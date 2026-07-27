import { useState } from 'react';
import { MessageSquareCode, ShieldCheck, BellRing, Save } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { VerificationBadge } from '@/shared/ui/VerificationBadge';
import { Breadcrumb } from '@/shared/ui/Breadcrumb';
import { notify } from '@/shared/ui/toast';

export function SettingsPage() {
  const [channels, setChannels] = useState({
    whatsapp: true,
    instagram: true,
    linkedin: true,
    phone: false,
    email: true
  });

  const [notifications, setNotifications] = useState({
    inquiries: true,
    matches: true,
    community: false
  });

  const handleSave = () => {
    notify.success('Settings Saved', 'Your direct contact channels and notification preferences have been updated.');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-12 px-4 sm:px-6 lg:px-8 text-[#00162D] text-left">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Breadcrumb & Header */}
        <div className="space-y-3">
          <Breadcrumb
            items={[
              { label: "Settings" }
            ]}
          />
          <h1 className="text-3xl font-black tracking-tight text-[#00162D]">
            Account & Direct Contact Settings
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            Control which direct channels other members can use to contact you on NextKinLife.
          </p>
        </div>

        {/* Verification Status Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Identity Verification Status
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-[#00162D]">Verified Community Member</h3>
              <VerificationBadge isVerified={true} variant="compact" />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Verified members receive 4x more direct inquiries on properties and services.
            </p>
          </div>
          <ShieldCheck className="w-10 h-10 text-[#CB2A26] shrink-0" />
        </div>

        {/* Direct Contact Channels Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MessageSquareCode className="w-5 h-5 text-[#25D366]" />
            <h2 className="text-base font-extrabold text-[#00162D]">
              Direct Contact Channel Visibility
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer">
              <div>
                <span className="text-sm font-extrabold text-[#00162D] block">WhatsApp Direct Chat</span>
                <span className="text-xs text-slate-500 font-medium">Allow members to open 1-tap WhatsApp conversations with you.</span>
              </div>
              <input
                type="checkbox"
                checked={channels.whatsapp}
                onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-[#25D366] focus:ring-[#00162D]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer">
              <div>
                <span className="text-sm font-extrabold text-[#00162D] block">Instagram Handle</span>
                <span className="text-xs text-slate-500 font-medium">Display your Instagram handle on your listings.</span>
              </div>
              <input
                type="checkbox"
                checked={channels.instagram}
                onChange={(e) => setChannels({ ...channels, instagram: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-[#CB2A26] focus:ring-[#00162D]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer">
              <div>
                <span className="text-sm font-extrabold text-[#00162D] block">LinkedIn Profile</span>
                <span className="text-xs text-slate-500 font-medium">Link your professional LinkedIn profile for verification trust.</span>
              </div>
              <input
                type="checkbox"
                checked={channels.linkedin}
                onChange={(e) => setChannels({ ...channels, linkedin: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-[#0A66C2] focus:ring-[#00162D]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer">
              <div>
                <span className="text-sm font-extrabold text-[#00162D] block">Direct Email</span>
                <span className="text-xs text-slate-500 font-medium">Allow members to send mailto inquiry messages directly.</span>
              </div>
              <input
                type="checkbox"
                checked={channels.email}
                onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-[#CB2A26] focus:ring-[#00162D]"
              />
            </label>
          </div>
        </div>

        {/* Notifications Settings Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <BellRing className="w-5 h-5 text-[#CB2A26]" />
            <h2 className="text-base font-extrabold text-[#00162D]">
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer">
              <div>
                <span className="text-sm font-extrabold text-[#00162D] block">Instant Inquiry Notifications</span>
                <span className="text-xs text-slate-500 font-medium">Get notified immediately when a member initiates a contact request.</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.inquiries}
                onChange={(e) => setNotifications({ ...notifications, inquiries: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-[#CB2A26] focus:ring-[#00162D]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer">
              <div>
                <span className="text-sm font-extrabold text-[#00162D] block">Travel & Room Matching Alerts</span>
                <span className="text-xs text-slate-500 font-medium">Receive weekly digest when new stays match your destination city.</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.matches}
                onChange={(e) => setNotifications({ ...notifications, matches: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-[#CB2A26] focus:ring-[#00162D]"
              />
            </label>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSave}
            variant="primary"
            size="lg"
            className="rounded-xl px-8 font-extrabold gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
