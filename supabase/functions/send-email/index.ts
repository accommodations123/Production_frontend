// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code runs in Supabase Edge Functions (Deno runtime).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  notification_id?: string;
  from?: string;
}

serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // 2. Validate Caller Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing Authorization header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Parse and validate payload
    const body: EmailPayload = await req.json().catch(() => ({}));
    const { to, subject, html, text, notification_id, from } = body;

    if (!to || typeof to !== "string" || !to.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid recipient email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subject || typeof subject !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Missing or invalid email subject." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!html && !text) {
      return new Response(
        JSON.stringify({ success: false, error: "Email body (html or text) is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Retrieve Server-Side Secrets
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Optional Supabase admin client for queue updates
    const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
      ? createClient(supabaseUrl, supabaseServiceKey)
      : null;

    let providerMessageId: string | null = null;
    let providerError: string | null = null;
    let deliveryStatus: "sent" | "failed" = "failed";

    // 5. Dispatch via Transactional Provider (Resend or SendGrid)
    if (resendApiKey) {
      const fromAddress = from || Deno.env.get("EMAIL_FROM_ADDRESS") || "NextKinLife <notifications@nextkinlife.com>";
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html: html || `<p>${text}</p>`,
          text: text || "",
        }),
      });

      const resendData = await resendRes.json();
      if (resendRes.ok && resendData?.id) {
        deliveryStatus = "sent";
        providerMessageId = resendData.id;
      } else {
        providerError = resendData?.message || `Resend error: HTTP ${resendRes.status}`;
      }
    } else if (sendgridApiKey) {
      const fromAddress = from || Deno.env.get("EMAIL_FROM_ADDRESS") || "notifications@nextkinlife.com";
      const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromAddress, name: "NextKinLife" },
          subject,
          content: [
            { type: "text/plain", value: text || subject },
            ...(html ? [{ type: "text/html", value: html }] : []),
          ],
        }),
      });

      if (sgRes.status === 202 || sgRes.status === 200) {
        deliveryStatus = "sent";
        providerMessageId = sgRes.headers.get("x-message-id") || `sg_${Date.now()}`;
      } else {
        const sgErr = await sgRes.text().catch(() => "SendGrid API error");
        providerError = `SendGrid error: HTTP ${sgRes.status} - ${sgErr}`;
      }
    } else {
      // No server provider configured in Edge Function secrets
      providerError = "No transactional email provider configured. Please set RESEND_API_KEY in Edge Function secrets.";
      console.error(providerError);
    }

    // 6. Update Database State if notification_id is provided
    if (supabaseAdmin && notification_id) {
      try {
        const now = new Date().toISOString();
        if (deliveryStatus === "sent") {
          await supabaseAdmin
            .from("notifications")
            .update({
              email_status: "sent",
              email_sent_at: now,
              email_error: null,
            })
            .eq("id", notification_id);

          await supabaseAdmin
            .from("email_jobs")
            .update({
              status: "sent",
              provider_message_id: providerMessageId,
              processed_at: now,
              last_error: null,
            })
            .eq("notification_id", notification_id);
        } else {
          await supabaseAdmin
            .from("notifications")
            .update({
              email_status: "failed",
              email_error: providerError,
            })
            .eq("id", notification_id);

          await supabaseAdmin
            .from("email_jobs")
            .update({
              status: "failed",
              last_error: providerError,
            })
            .eq("notification_id", notification_id);
        }
      } catch (dbErr) {
        console.error("Failed to update notification email status in DB:", dbErr);
      }
    }

    // 7. Structured Response
    if (deliveryStatus === "sent") {
      return new Response(
        JSON.stringify({
          success: true,
          status: "sent",
          messageId: providerMessageId,
          sent_at: new Date().toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          status: "failed",
          error: providerError,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("send-email Edge Function unexpected error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        status: "failed",
        error: err instanceof Error ? err.message : "Internal Server Error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
