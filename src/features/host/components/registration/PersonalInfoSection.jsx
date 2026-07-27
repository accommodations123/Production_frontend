import { CountryCodeSelect } from '@/shared/ui/CountryCodeSelect';

const PERSON_ICON = (
  <svg className="h-5 w-5 text-[#717171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EMAIL_ICON = (
  <svg className="h-5 w-5 text-[#717171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export function PersonalInfoSection({ formData, handleChange, focusedField, setFocusedField, setFormData }) {
  const inputClass = (field) =>
    `block w-full pl-10 pr-4 py-3 rounded-lg shadow-sm placeholder-gray-400 text-black focus:outline-none sm:text-sm transition-all ${
      focusedField === field
        ? 'border-2 border-primary ring-1 ring-primary bg-primary/10'
        : 'border-2 border-gray-200 bg-gray-50'
    }`;

  return (
    <div className="py-8 border-b border-gray-200 space-y-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-accent">
          {PERSON_ICON}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <p className="text-sm text-[#222222]">Tell us about yourself</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <svg className="h-4 w-4 mr-2 text-[#717171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Full Name
          </label>
          <div className="relative">
            <input id="full_name" name="full_name" required placeholder="Enter your full legal name" value={formData.full_name} onChange={handleChange} onFocus={() => setFocusedField('full_name')} onBlur={() => setFocusedField(null)} className={inputClass('full_name')} />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{PERSON_ICON}</div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <svg className="h-4 w-4 mr-2 text-[#717171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </label>
          <div className="relative">
            <input id="email" name="email" type="email" placeholder="We'll use this for account verification" value={formData.email} onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className={inputClass('email')} />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{EMAIL_ICON}</div>
          </div>
        </div>

        {/* Phone */}
        <div className="md:col-span-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="flex gap-2">
            <CountryCodeSelect
              value={formData.phonePrefix || '+91'}
              isoCode={formData.phoneIso}
              onChange={(code, iso) => setFormData((prev) => ({ ...prev, phonePrefix: code, phoneIso: iso }))}
              className="w-[110px]"
            />
            <input
              id="phone"
              name="phone"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              className={`block w-full px-4 py-3 rounded-lg shadow-sm placeholder-gray-400 text-black focus:outline-none sm:text-sm transition-all ${
                focusedField === 'phone' ? 'border-2 border-primary ring-1 ring-primary bg-primary/10' : 'border-2 border-gray-200 bg-gray-50'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
