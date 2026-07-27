import { Plane, User, MapPin, Loader2, Calendar, Clock } from 'lucide-react';

import SearchableDropdown from '@/shared/ui/SearchableDropdown';

import { usePostTrip } from '../hooks/usePostTrip';

const ACCENT = {
  page: { icon: 'text-[#00142E]', btn: 'bg-[#00142E] hover:bg-[#071F3B] shadow-lg shadow-[#00142E]/20' },
  modal: { icon: 'text-[#E1392A]', btn: 'bg-[#E1392A] hover:bg-[#C82E20] hover:shadow-[0_8px_20px_rgba(203,42,37,0.25)]' },
};

/**
 * Unified travel-plan form. Use variant="page" on the create route,
 * variant="modal" inside the travel page modal wrapper.
 */
export default function PostTripForm({ variant = 'page', onClose, onCancel, onAdd }) {
  const dismiss = onClose || onCancel;
  const { icon, btn } = ACCENT[variant] || ACCENT.page;

  const {
    navigate, isSubmitting, isProfileLoading, isVerifiedHost, hostProfile,
    form, handleChange, formErrors, fromLoc, toLoc, handleSubmit,
  } = usePostTrip({ onClose: dismiss, onAdd });

  if (!isProfileLoading && !isVerifiedHost) {
    return (
      <div className="bg-white w-full max-w-2xl mx-auto rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden p-8 text-center my-8">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl" role="img" aria-label="locked">&#128274;</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {hostProfile?.status === 'pending' ? 'Account Verification Pending' : 'Host Access Required'}
        </h2>
        <p className="text-[#222222] mb-6">
          {hostProfile?.status === 'pending'
            ? 'Your host application is currently under review. You can post travel plans once your account is approved.'
            : 'You need to be an approved host to post travel plans.'}
        </p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={dismiss}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm cursor-pointer"
          >
            Back to Travel
          </button>
          {hostProfile?.status !== 'pending' && (
            <button
              type="button"
              onClick={() => { dismiss?.(); navigate('/hosts'); }}
              className="px-5 py-2 text-sm font-medium text-white bg-[#C93A30] rounded-lg hover:bg-[#b02e25] transition shadow-sm cursor-pointer"
            >
              Become a Host
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white w-full rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#00142E] flex items-center gap-2">
            <Plane className={`${icon} w-5 h-5`} /> Post Travel Plan
          </h2>
          <p className="text-xs text-[#484848] mt-1 font-medium">Share your itinerary to match with fellow travelers</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Personal Information */}
        <section className="space-y-4">
          <h3 className="text-base font-bold text-[#00142E] flex items-center gap-2 pb-2 border-b border-gray-50">
            <User size={18} className={icon} /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput label="Age" name="age" type="number" placeholder="Enter your age" value={form.age} error={formErrors.age} onChange={handleChange} required />
            <FormInput label="Languages (comma separated)" name="languages" placeholder="e.g., English, Hindi, Spanish" value={form.languages} error={formErrors.languages} onChange={handleChange} required />
          </div>
        </section>

        {/* Trip Information */}
        <section className="space-y-6 pt-2">
          <h3 className="text-base font-bold text-[#00142E] flex items-center gap-2 pb-2 border-b border-gray-50">
            <Plane size={18} className={icon} /> Trip Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormInput label="Airline" name="airline" placeholder="Enter airline name" value={form.airline} error={formErrors.airline} onChange={handleChange} required />
            <FormInput label="Flight Number" name="flight_number" placeholder="Enter flight number (e.g., AF226)" value={form.flight_number} onChange={handleChange} />
            <FormInput label="Number of Travelers" name="travelers_count" type="number" min="1" placeholder="How many are traveling?" value={form.travelers_count} onChange={handleChange} required />
          </div>

          {/* Origin */}
          <LocationSection title="Origin (Flying From)" icon={icon} loc={fromLoc} errors={formErrors} prefix="from" />

          {/* Destination */}
          <LocationSection title="Destination (Flying To)" icon={icon} loc={toLoc} errors={formErrors} prefix="to" />

          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <DateTimeField label="Departure Date & Time" dateName="travel_date" timeName="departure_time" form={form} errors={formErrors} onChange={handleChange} required />
            <DateTimeField label="Arrival Date & Time" dateName="arrival_date" timeName="arrival_time" form={form} errors={formErrors} onChange={handleChange} />
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={dismiss}
            className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white ${btn} active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Plan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers (file-local, not exported) ────────────────────── */

function FormInput({ label, name, type = 'text', placeholder, value, error, onChange, required, min }) {
  const borderStyle = error ? '#ef4444' : 'var(--color-neutral)';
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        name={name}
        type={type}
        min={min}
        placeholder={placeholder}
        className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2.5 text-sm outline-none transition-all`}
        onChange={onChange}
        value={value}
        style={{ borderColor: borderStyle, color: 'var(--color-foreground)' }}
      />
    </div>
  );
}

function LocationSection({ title, icon, loc, errors, prefix }) {
  const countryKey = `${prefix}_country`;
  const cityKey = `${prefix}_city`;
  return (
    <div className="space-y-4 pt-2">
      <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
        <MapPin size={16} className={icon} /> {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchableDropdown label="Country" placeholder="Select Country" options={loc.countries} value={loc.selectedCountry?.name || ''} onChange={loc.setCountry} error={errors[countryKey]} required />
        <SearchableDropdown label="State" placeholder="Select State" options={loc.states} value={loc.selectedState?.name || ''} disabled={!loc.selectedCountry} isLoading={!loc.states.length && !!loc.selectedCountry} onChange={loc.setState} />
        <SearchableDropdown label="City" placeholder="Select City" options={loc.cities} value={loc.selectedCity?.name || ''} disabled={!loc.selectedState} isLoading={!loc.cities.length && !!loc.selectedState} onChange={loc.setCity} error={errors[cityKey]} required />
      </div>
    </div>
  );
}

function DateTimeField({ label, dateName, timeName, form, errors, onChange, required }) {
  const dateError = errors[dateName];
  const timeError = errors[timeName];
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex gap-2">
        <div className="relative w-1/2 flex items-center">
          <input
            name={dateName}
            type="date"
            className={`w-full rounded-lg border ${dateError ? 'border-red-500' : 'border-gray-300'} bg-white pl-3 pr-10 py-2.5 text-sm outline-none transition-all cursor-pointer`}
            onChange={onChange}
            value={form[dateName]}
            onClick={(e) => e.target.showPicker?.()}
            style={{ borderColor: dateError ? '#ef4444' : 'var(--color-neutral)', color: 'var(--color-foreground)' }}
          />
          <Calendar className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative w-1/2 flex items-center">
          <input
            name={timeName}
            type="time"
            className={`w-full rounded-lg border ${timeError ? 'border-red-500' : 'border-gray-300'} bg-white pl-3 pr-10 py-2.5 text-sm outline-none transition-all cursor-pointer`}
            onChange={onChange}
            value={form[timeName]}
            onClick={(e) => e.target.showPicker?.()}
            style={{ borderColor: timeError ? '#ef4444' : 'var(--color-neutral)', color: 'var(--color-foreground)' }}
          />
          <Clock className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
