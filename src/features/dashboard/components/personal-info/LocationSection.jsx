import { MapPin } from 'lucide-react';
import SearchableDropdown from '@/shared/ui/SearchableDropdown';
import { DetailCard } from './DetailCard';
import { InfoField } from './InfoField';

const LABEL_CLASS = 'bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#CB2A26]/20 focus:border-[#CB2A26] text-gray-900 transition-all font-bold text-sm h-11';
const DISPLAY_CLASS = 'p-3 bg-gray-50/50 rounded-xl border border-gray-100 font-semibold text-gray-800 text-sm flex items-center min-h-[44px]';
const LABEL_TEXT = 'text-[10px] font-bold uppercase tracking-wider text-[#717171] ml-1 block';

export function LocationSection({ editStates, toggleEdit, isUpdating, formData, setFormData, countriesList, statesList, citiesList, isValidCountry, isValidState, setStatesList, setCitiesList, citiesFetched, csc, handleChange }) {
  return (
    <DetailCard
      title="Location & Address"
      description="Your primary location & stay region"
      icon={MapPin}
      isEditing={editStates.location}
      onEdit={() => toggleEdit('location')}
      isUpdating={isUpdating && editStates.location}
    >
      {/* Country */}
      <div className="space-y-2">
        <label className={LABEL_TEXT}>Country</label>
        {editStates.location ? (
          <SearchableDropdown
            label="" placeholder="Select Country"
            options={countriesList} value={formData.country}
            onChange={(option) => {
              setFormData((prev) => ({ ...prev, country: option.name, state: '', city: '' }));
              if (csc) setStatesList(csc.State.getStatesOfCountry(option.isoCode));
              setCitiesList([]);
            }}
            className={LABEL_CLASS}
          />
        ) : (
          <div className={DISPLAY_CLASS}>{formData.country || <span className="text-gray-300 font-normal italic">Not specified</span>}</div>
        )}
      </div>

      {/* State */}
      <div className="space-y-2">
        <label className={LABEL_TEXT}>State / Province</label>
        {editStates.location ? (
          <SearchableDropdown
            label="" placeholder="Select State"
            options={statesList} value={formData.state}
            disabled={!formData.country}
            isLoading={isValidCountry && !statesList.length && !!formData.country}
            onChange={(option) => {
              setFormData((prev) => ({ ...prev, state: option.name, city: '' }));
              const countryObj = countriesList.find((c) => c.name === formData.country);
              if (countryObj && csc) {
                setCitiesList(csc.City.getCitiesOfState(countryObj.isoCode, option.isoCode));
                citiesFetched.current = true;
              } else {
                citiesFetched.current = false;
              }
            }}
            className={LABEL_CLASS}
          />
        ) : (
          <div className={DISPLAY_CLASS}>{formData.state || <span className="text-gray-300 font-normal italic">Not specified</span>}</div>
        )}
      </div>

      {/* City */}
      <div className="space-y-2">
        <label className={LABEL_TEXT}>City</label>
        {editStates.location ? (
          <SearchableDropdown
            label="" placeholder="Select City"
            options={citiesList} value={formData.city}
            disabled={!formData.state}
            isLoading={isValidState && !citiesList.length && !citiesFetched.current && !!formData.state}
            onChange={(option) => setFormData((prev) => ({ ...prev, city: option.name }))}
            className={LABEL_CLASS}
          />
        ) : (
          <div className={DISPLAY_CLASS}>{formData.city || <span className="text-gray-300 font-normal italic">Not specified</span>}</div>
        )}
      </div>

      <InfoField label="Zip / Pin Code" name="zip" value={formData.zip} isEditing={editStates.location} onChange={handleChange} />
      <div className="md:col-span-2">
        <InfoField label="Street Address" name="address" value={formData.address} isEditing={editStates.location} onChange={handleChange} placeholder="House number, street name..." />
      </div>
    </DetailCard>
  );
}
