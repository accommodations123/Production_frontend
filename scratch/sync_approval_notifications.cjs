const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dmhxnuxlodsshdkunngb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaHhudXhsb2Rzc2hka3VubmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NDEwOTEsImV4cCI6MjEwMzExNzA5MX0.3HYB8stLkxNE4j32PVwKL6s8bwulfIJI247MbBE6hqw';

const client = createClient(supabaseUrl, supabaseAnonKey);

async function sync() {
  const notifsToInsert = [];

  // 1. Properties (approved)
  const { data: props } = await client.from('properties').select('*').or('status.eq.approved,is_approved.eq.true');
  for (const p of (props || [])) {
    if (p.host_id) {
      notifsToInsert.push({
        recipient_id: p.host_id,
        target_role: 'user',
        type: 'PROPERTY_APPROVED',
        title: '🎉 Space Listing Approved!',
        message: `Your space "${p.title || 'Accommodation'}" has been approved by NextKinLife admin and is now live & verified.`,
        entity_type: 'property',
        entity_id: String(p.id),
        action_url: `/rooms/${p.id}`,
        metadata: { id: p.id, title: p.title, city: p.city },
        channel: 'both',
        is_read: false,
        created_at: p.updated_at || p.created_at || new Date().toISOString()
      });
    }
  }

  // 2. Stay Requests (approved)
  const { data: stays } = await client.from('stay_requests').select('*').or('status.eq.approved,is_approved.eq.true');
  for (const s of (stays || [])) {
    if (s.user_id) {
      let displayTitle = 'Stay Request';
      try {
        if (s.title && s.title.startsWith('{')) {
          const parsed = JSON.parse(s.title);
          displayTitle = parsed.displayTitle || parsed.title || displayTitle;
        } else if (s.title) {
          displayTitle = s.title;
        }
      } catch {}
      notifsToInsert.push({
        recipient_id: s.user_id,
        target_role: 'user',
        type: 'STAY_REQUEST_APPROVED',
        title: '🎉 Stay Request Approved!',
        message: `Your stay request "${displayTitle}" has been approved by admin and is now active for hosts to connect with you.`,
        entity_type: 'stay_request',
        entity_id: String(s.id),
        action_url: '/accommodations',
        metadata: { id: s.id, title: displayTitle },
        channel: 'both',
        is_read: false,
        created_at: s.updated_at || s.created_at || new Date().toISOString()
      });
    }
  }

  // 3. Buy & Sell / Marketplace (approved)
  const { data: items } = await client.from('buy_sell').select('*').or('status.eq.approved,is_approved.eq.true');
  for (const b of (items || [])) {
    if (b.user_id) {
      notifsToInsert.push({
        recipient_id: b.user_id,
        target_role: 'user',
        type: 'BUY_SELL_APPROVED',
        title: '🛍️ Marketplace Item Approved!',
        message: `Your item "${b.title || 'Marketplace Item'}" is now approved and visible to the community in Marketplace.`,
        entity_type: 'buy_sell',
        entity_id: String(b.id),
        action_url: '/marketplace',
        metadata: { id: b.id, title: b.title, price: b.price },
        channel: 'both',
        is_read: false,
        created_at: b.updated_at || b.created_at || new Date().toISOString()
      });
    }
  }

  // 4. Travel Trips (approved)
  const { data: trips } = await client.from('travel_trips').select('*').or('status.eq.approved,is_approved.eq.true');
  for (const t of (trips || [])) {
    if (t.host_id) {
      notifsToInsert.push({
        recipient_id: t.host_id,
        target_role: 'user',
        type: 'TRIP_APPROVED',
        title: '🚗 Travel Companion Plan Approved!',
        message: `Your travel plan "${t.title || (t.origin + ' to ' + t.destination)}" is now approved and live in Travel Community.`,
        entity_type: 'trip',
        entity_id: String(t.id),
        action_url: '/travel',
        metadata: { id: t.id, title: t.title, destination: t.destination },
        channel: 'both',
        is_read: false,
        created_at: t.updated_at || t.created_at || new Date().toISOString()
      });
    }
  }

  // 5. Host Profiles (approved)
  const { data: hosts } = await client.from('profiles').select('*').or('status.eq.approved,is_approved.eq.true');
  for (const h of (hosts || [])) {
    if (h.id && h.role === 'host') {
      notifsToInsert.push({
        recipient_id: h.id,
        target_role: 'user',
        type: 'HOST_APPROVED',
        title: '🛡️ Host Identity Verified & Approved!',
        message: `Congratulations ${h.full_name || 'Host'}! Your host identity verification has been approved. You now have a verified host badge.`,
        entity_type: 'host',
        entity_id: String(h.id),
        action_url: '/account-v2?tab=personal',
        metadata: { id: h.id, role: h.role, verified: true },
        channel: 'both',
        is_read: false,
        created_at: h.updated_at || h.created_at || new Date().toISOString()
      });
    }
  }

  console.log('Total approval notifications ready to push:', notifsToInsert.length);

  // Insert in batches of 10
  let insertedCount = 0;
  for (let i = 0; i < notifsToInsert.length; i += 10) {
    const chunk = notifsToInsert.slice(i, i + 10);
    const { data, error } = await client.from('notifications').insert(chunk).select();
    if (error) {
      console.error('Batch error at ' + i + ':', error.message);
    } else {
      insertedCount += (data?.length || 0);
    }
  }

  console.log('Successfully inserted notifications count:', insertedCount);
}

sync();
