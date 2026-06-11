"use client";
import React, { useState } from "react";
import {
  Shield, Lock, Bell, Mail, Smartphone,
  Globe, Eye, CreditCard, Languages, Flag, ShieldAlert, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const SettingSection = ({ title, children }) => (
  <div className="space-y-4">
    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1.5">{title}</h4>
    <div className="grid gap-4">
      {children}
    </div>
  </div>
);

const SettingToggle = ({ icon: Icon, label, desc, active, onToggle }) => (
  <div className="flex items-center justify-between p-5 sm:p-6 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
        <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
      </div>
      <div className="space-y-0.5">
        <h5 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug">{label}</h5>
        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-md">{desc}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={cn(
        "w-11 h-6 rounded-full p-1 transition-all duration-300 relative shrink-0",
        active ? "bg-blue-600 shadow-md shadow-blue-500/20" : "bg-gray-200"
      )}
    >
      <div className={cn(
        "w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
        active ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  </div>
);

const SettingSelect = ({ icon: Icon, label, value, options }) => (
  <div className="flex items-center justify-between p-5 sm:p-6 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
        <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
      </div>
      <h5 className="font-extrabold text-gray-900 text-sm sm:text-base">{label}</h5>
    </div>
    <select className="bg-gray-50 border border-gray-200 font-bold text-gray-700 text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    publicProfile: true,
    showPhone: false,
    twoFactor: true,
  });

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Visual Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-full blur-3xl -z-10"></div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase block">Preferences ⚙️</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg leading-relaxed">
            Manage your notification frequencies, public visibility settings, and login preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Toggles Grid */}
        <div className="lg:col-span-8 space-y-8">

          <SettingSection title="Notification Preferences">
            <SettingToggle
              icon={Mail}
              label="Email Notifications"
              desc="Receive reservation requests, booking confirmations, and host updates."
              active={settings.emailNotifications}
              onToggle={() => toggle('emailNotifications')}
            />
            <SettingToggle
              icon={Bell}
              label="Push Notifications"
              desc="Receive real-time alerts and chats directly on your active browser device."
              active={settings.pushNotifications}
              onToggle={() => toggle('pushNotifications')}
            />
            <SettingToggle
              icon={Smartphone}
              label="SMS Notifications"
              desc="Receive emergency notifications or listing verification codes via text message."
              active={settings.smsNotifications}
              onToggle={() => toggle('smsNotifications')}
            />
          </SettingSection>

          <SettingSection title="Privacy & Security">
            <SettingToggle
              icon={Eye}
              label="Public Profile Visibility"
              desc="Allow other travelers and hosts to search for your name and view details."
              active={settings.publicProfile}
              onToggle={() => toggle('publicProfile')}
            />
            <SettingToggle
              icon={Smartphone}
              label="Show Phone Number"
              desc="Share your verified phone number only with confirmed booking partners."
              active={settings.showPhone}
              onToggle={() => toggle('showPhone')}
            />
            <SettingToggle
              icon={Shield}
              label="Two-Factor Authentication"
              desc="Enhance account security by requesting OTP verifications during logins."
              active={settings.twoFactor}
              onToggle={() => toggle('twoFactor')}
            />
          </SettingSection>

          <SettingSection title="Global Configurations">
            <SettingSelect
              icon={CreditCard}
              label="Preferred Currency"
              options={["INR (₹)", "USD ($)", "EUR (€)", "GBP (£)", "CAD ($)"]}
            />
            <SettingSelect
              icon={Flag}
              label="Preferred Country"
              options={["India", "United States", "United Kingdom", "Canada", "Germany"]}
            />
            <SettingSelect
              icon={Languages}
              label="Preferred Language"
              options={["English (US)", "English (UK)", "Hindi", "Spanish", "French"]}
            />
          </SettingSection>

        </div>

        {/* Right Info card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-5">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Security Check
            </h3>

            <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex gap-3">
              <CheckCircle2 className="w-9 h-9 text-green-600 shrink-0" />
              <div>
                <p className="font-extrabold text-gray-900 text-xs">Device Protected</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                  Your session is encrypted and guarded with standard SSL and cookie protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
