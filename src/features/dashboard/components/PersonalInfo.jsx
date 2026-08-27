import { useState, useEffect, useMemo } from 'react';
import { User } from 'lucide-react';
import { useCountry } from '@/context/CountryContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { extractUsername } from '@/shared/utils/socialUtils';
import { splitPhone } from '@/shared/utils/phoneUtils';

import { ProfileHeader } from './personal-info/ProfileHeader';
import { DetailCard } from './personal-info/DetailCard';
import { InfoField } from './personal-info/InfoField';
import { LocationSection } from './personal-info/LocationSection';
import { SocialSection } from './personal-info/SocialSection';

import { useLocationCascade } from '@/shared/hooks/useLocationCascade';

function hydratePhone(fullPhone, defaultCode = '+91', defaultIso = 'IN') {
  if (!fullPhone) return { code: defaultCode, iso: defaultIso, number: '' };
  const parsed = splitPhone(fullPhone);
  return { code: parsed.code, iso: defaultIso, number: parsed.number };
}

export function PersonalInfo({ initialData, verificationState, onUpdate, isUpdating, isHost }) {
  const { activeCountry } = useCountry();
  const navigate = useNavigate();
  const loc = useLocationCascade();

  const [editStates, setEditStates] = useState({ headline: false, personal: false, location: false, social: false });

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    country: initialData?.country || '',
    state: initialData?.state || '',
    city: initialData?.city || '',
    address: initialData?.address || '',
    zip: initialData?.zip || '',
    whatsapp: initialData?.whatsapp || '',
    facebook: initialData?.facebook || '',
    instagram: initialData?.instagram || '',
    phoneCode: activeCountry?.phoneCode || '+91',
    phoneIso: activeCountry?.code || 'IN',
    whatsappCode: activeCountry?.phoneCode || '+91',
    whatsappIso: activeCountry?.code || 'IN',
  });

  // Hydrate from initialData
  useEffect(() => {
    if (!initialData) return;
    const defCode = activeCountry?.phoneCode || '+91';
    const defIso = activeCountry?.code || 'IN';
    const pPhone = hydratePhone(initialData.phone, defCode, defIso);
    const pWa = hydratePhone(initialData.whatsapp, defCode, defIso);

    setFormData((prev) => ({
      ...prev,
      full_name: initialData.full_name || initialData.name || prev.full_name || '',
      email: initialData.email || prev.email || '',
      phone: pPhone.number || '',
      phoneCode: pPhone.code,
      phoneIso: pPhone.iso,
      country: initialData.country || prev.country || '',
      state: initialData.state || prev.state || '',
      city: initialData.city || prev.city || '',
      address: initialData.street_address || initialData.address || prev.address || '',
      zip: initialData.zip_code || initialData.zip || prev.zip || '',
      whatsapp: pWa.number || '',
      whatsappCode: pWa.code,
      whatsappIso: pWa.iso,
      facebook: initialData.facebook || prev.facebook || '',
      instagram: initialData.instagram || prev.instagram || '',
    }));

    // Pre-select location
    if (initialData.country && loc.countries.length > 0) {
      const cObj = loc.countries.find((c) => c.name === initialData.country);
      if (cObj && !loc.selectedCountry) loc.setCountry(cObj);
    }
  }, [initialData]);

  // Pre-select state from initialData
  useEffect(() => {
    if (initialData?.state && loc.states.length > 0 && !loc.selectedState) {
      const sObj = loc.states.find((s) => s.name === initialData.state);
      if (sObj) loc.setState(sObj);
    }
  }, [initialData?.state, loc.states]);

  // Pre-select city from initialData
  useEffect(() => {
    if (initialData?.city && loc.cities.length > 0 && !loc.selectedCity) {
      const cObj = loc.cities.find((c) => c.name === initialData.city);
      if (cObj) loc.setCity(cObj);
    }
  }, [initialData?.city, loc.cities]);

  // Sync country changes from cascade into formData
  useEffect(() => {
    if (loc.selectedCountry) {
      setFormData((prev) => ({ ...prev, country: loc.selectedCountry.name }));
    }
  }, [loc.selectedCountry]);

  useEffect(() => {
    if (loc.selectedState) {
      setFormData((prev) => ({ ...prev, state: loc.selectedState.name }));
    }
  }, [loc.selectedState]);

  useEffect(() => {
    if (loc.selectedCity) {
      setFormData((prev) => ({ ...prev, city: loc.selectedCity.name }));
    }
  }, [loc.selectedCity]);

  // Update default codes when activeCountry changes
  useEffect(() => {
    if (activeCountry) {
      setFormData((prev) => ({
        ...prev,
        phoneCode: activeCountry.phoneCode || '+91',
        phoneIso: activeCountry.code || 'IN',
        whatsappCode: activeCountry.phoneCode || '+91',
        whatsappIso: activeCountry.code || 'IN',
      }));
    }
  }, [activeCountry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEdit = async (section) => {
    if (editStates[section]) {
      try {
        const cleanFb = extractUsername('facebook', formData.facebook);
        const cleanInsta = extractUsername('instagram', formData.instagram);
        setFormData((prev) => ({ ...prev, facebook: cleanFb, instagram: cleanInsta }));

        if (onUpdate) {
          const payload = new FormData();
          Object.keys(formData).forEach((key) => {
            if (!['phone', 'whatsapp', 'phoneCode', 'whatsappCode', 'phoneIso', 'whatsappIso'].includes(key)) {
              let val = formData[key];
              if (key === 'facebook') val = cleanFb;
              if (key === 'instagram') val = cleanInsta;
              payload.append(key, val);
            }
          });
          const finalPhone = formData.phone ? `${formData.phoneCode}${formData.phone}` : '';
          const finalWa = formData.whatsapp ? `${formData.whatsappCode}${formData.whatsapp}` : '';
          payload.append('phone', finalPhone);
          payload.append('whatsapp', finalWa);
          payload.append('zip_code', formData.zip);
          payload.append('street_address', formData.address);
          await onUpdate(payload);
        }
        setEditStates((prev) => ({ ...prev, [section]: false }));
      } catch (error) {
        console.error('Update failed', error);
        toast.error('Failed to update profile. Please try again.');
      }
    } else {
      setEditStates((prev) => ({ ...prev, [section]: true }));
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Only image files are allowed'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB'); return; }
    if (onUpdate) {
      const fd = new FormData();
      fd.append('profile_image', file);
      onUpdate(fd);
    }
  };

  // Pincode auto-fill
  useEffect(() => {
    if (!formData.zip || formData.zip.length !== 6 || !/^\d+$/.test(formData.zip) || !editStates.location) return;
    const timeoutId = setTimeout(async () => {
      try {
        const { fetchAddressByPincode } = await import('@/shared/utils/pincodeUtils');
        const data = await fetchAddressByPincode(formData.zip);
        if (data) setFormData((prev) => ({ ...prev, city: data.city || prev.city, state: data.state || prev.state, country: data.country || prev.country }));
      } catch (e) { console.error(e); }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.zip, editStates.location]);

  const completionScore = useMemo(() => {
    let score = 0;
    if (formData.full_name) score += 20;
    if (formData.email) score += 20;
    if (formData.phone) score += 20;
    if (formData.country && formData.city) score += 20;
    if (formData.whatsapp && formData.facebook && formData.instagram) score += 20;
    return score;
  }, [formData]);

  const displayName = formData.full_name || 'User';
  const profileImage = initialData?.profile_image || null;

  const isValidCountry = loc.countries.some((c) => c.name === formData.country);
  const isValidState = loc.states.some((s) => s.name === formData.state);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      {/* Back button */}
      <div className="flex items-center justify-between pb-1">
        <button type="button" onClick={() => navigate('/account-v2')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-[#00142E] bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-xs cursor-pointer active:scale-95">
          <span>&larr; Back to Account Console</span>
        </button>
        <span className="text-xs font-bold text-gray-400">Profile Settings</span>
      </div>

      <ProfileHeader displayName={displayName} profileImage={profileImage} formData={formData} completionScore={completionScore} handleAvatarUpload={handleAvatarUpload} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Personal Details */}
          <DetailCard title="Personal Details" description="Your primary identity credentials" icon={User} isEditing={editStates.personal} onEdit={() => toggleEdit('personal')} isUpdating={isUpdating && editStates.personal}>
            <div className="md:col-span-2">
              <InfoField label="Full Name" name="full_name" value={formData.full_name} isEditing={editStates.personal} onChange={handleChange} />
            </div>
            <InfoField label="Email Address" name="email" type="email" value={formData.email} isEditing={editStates.personal} onChange={handleChange} />
            <InfoField label="Phone Number" name="phone" type="tel" value={formData.phone} isEditing={editStates.personal} onChange={handleChange} prefix={formData.phoneCode} iso={formData.phoneIso} onPrefixChange={(code, iso) => setFormData((prev) => ({ ...prev, phoneCode: code, phoneIso: iso }))} />
          </DetailCard>

          <LocationSection editStates={editStates} toggleEdit={toggleEdit} isUpdating={isUpdating} formData={formData} setFormData={setFormData} countriesList={loc.countries} statesList={loc.states} citiesList={loc.cities} isValidCountry={isValidCountry} isValidState={isValidState} setStatesList={() => {}} setCitiesList={() => {}} citiesFetched={{ current: false }} csc={null} handleChange={handleChange} />
          <SocialSection editStates={editStates} toggleEdit={toggleEdit} isUpdating={isUpdating} formData={formData} setFormData={setFormData} handleChange={handleChange} />
        </div>
      </div>
    </div>
  );
}
