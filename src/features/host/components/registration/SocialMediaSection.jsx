import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';
import { CountryCodeSelect } from '@/shared/ui/CountryCodeSelect';

const SOCIAL_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TOGGLE_BUTTONS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, color: 'green' },
  { key: 'facebook', label: 'Facebook', icon: FaFacebook, color: 'blue' },
  { key: 'instagram', label: 'Instagram', icon: FaInstagram, color: 'pink' },
];

export function SocialMediaSection({ formData, handleChange, setFormData, activeSocials, toggleSocial }) {
  return (
    <div className="py-8 border-b border-gray-200 space-y-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-accent">{SOCIAL_ICON}</div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">Social Media</h3>
          <p className="text-sm text-[#222222]">Select the platforms you want to add</p>
        </div>
      </div>

      {/* Toggle Icons */}
      <div className="flex justify-center gap-8 mb-8">
        {TOGGLE_BUTTONS.map(({ key, label, icon: Icon, color }) => {
          const isActive = activeSocials[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleSocial(key)}
              className={`flex flex-col items-center gap-2 transition-all transform hover:scale-110 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
            >
              <div className={`p-4 rounded-full ${isActive ? `bg-${color}-100 ring-2 ring-${color}-500` : 'bg-gray-200'}`}>
                <Icon className={`w-8 h-8 ${isActive ? `text-${color}-600` : 'text-[#484848]'}`} />
              </div>
              <span className={`text-xs font-medium ${isActive ? `text-${color}-700` : 'text-[#484848]'}`}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Conditional Inputs */}
      <div className="space-y-4">
        {activeSocials.whatsapp && (
          <div className="animate-fade-in-down">
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaWhatsapp className="text-green-600 w-4 h-4" /> WhatsApp Number
            </label>
            <div className="flex gap-2">
              <CountryCodeSelect value={formData.whatsappPrefix || '+91'} isoCode={formData.whatsappIso} onChange={(code, iso) => setFormData((prev) => ({ ...prev, whatsappPrefix: code, whatsappIso: iso }))} className="w-[110px]" />
              <input id="whatsapp" name="whatsapp" placeholder="9876543210" value={formData.whatsapp} onChange={handleChange} autoFocus className="block w-full px-4 py-3 rounded-lg shadow-sm border-2 border-green-100 focus:border-green-500 focus:ring-green-500 sm:text-sm transition-all" />
            </div>
          </div>
        )}

        {activeSocials.facebook && (
          <div className="animate-fade-in-down">
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaFacebook className="text-blue-600 w-4 h-4" /> Facebook Username
            </label>
            <input id="facebook" name="facebook" placeholder="username" value={formData.facebook} onChange={handleChange} autoFocus className="block w-full px-4 py-3 rounded-lg shadow-sm border-2 border-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all" />
          </div>
        )}

        {activeSocials.instagram && (
          <div className="animate-fade-in-down">
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaInstagram className="text-pink-600 w-4 h-4" /> Instagram Username
            </label>
            <input id="instagram" name="instagram" placeholder="username" value={formData.instagram} onChange={handleChange} autoFocus className="block w-full px-4 py-3 rounded-lg shadow-sm border-2 border-pink-100 focus:border-pink-500 focus:ring-pink-500 sm:text-sm transition-all" />
          </div>
        )}

        {!activeSocials.whatsapp && !activeSocials.facebook && !activeSocials.instagram && (
          <p className="text-center text-sm text-[#717171] italic mt-4">Click an icon above to add a social link</p>
        )}
      </div>
    </div>
  );
}
