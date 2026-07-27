import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSaveHostMutation, useGetHostProfileQuery } from '@/store/api/hostApi';
import { useGetMeQuery } from '@/store/api/authApi';
import { useLocationCascade } from '@/shared/hooks/useLocationCascade';
import { splitPhone } from '@/shared/utils/phoneUtils';
import { fetchAddressByPincode } from '@/shared/utils/pincodeUtils';
import { extractUsername } from '@/shared/utils/socialUtils';

const INITIAL_FORM = {
  full_name: '',
  email: '',
  phone: '',
  phonePrefix: '+91',
  phoneIso: '',
  zip_code: '',
  street_address: '',
  whatsapp: '',
  whatsappPrefix: '+91',
  whatsappIso: '',
  facebook: '',
  instagram: '',
};

/**
 * Hook managing host registration form state, validation, pincode lookup,
 * and submission via useSaveHostMutation.
 */
export function useHostRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [activeSocials, setActiveSocials] = useState({ whatsapp: false, facebook: false, instagram: false });

  const loc = useLocationCascade();
  const pincodeApplied = useRef(false);

  const { data: userData } = useGetMeQuery();
  const [saveHost, { isLoading: isSubmitLoading, isError, error }] = useSaveHostMutation();
  const { data: hostProfile } = useGetHostProfileQuery(undefined, { skip: !userData });

  // Pre-fill from existing host profile
  useEffect(() => {
    if (!hostProfile) return;
    const phoneData = splitPhone(hostProfile.phone);
    const whatsappData = splitPhone(hostProfile.whatsapp);

    setFormData((prev) => ({
      ...prev,
      full_name: hostProfile.full_name || prev.full_name,
      email: hostProfile.email || prev.email,
      phone: phoneData.number,
      phonePrefix: phoneData.code,
      zip_code: hostProfile.zip_code || prev.zip_code || '',
      street_address: hostProfile.address || prev.street_address,
      whatsapp: whatsappData.number,
      whatsappPrefix: whatsappData.code,
      facebook: hostProfile.facebook || prev.facebook,
      instagram: hostProfile.instagram || prev.instagram,
    }));

    // Pre-select location from profile
    if (hostProfile.country && loc.countries.length > 0 && !loc.selectedCountry) {
      const countryObj = loc.countries.find((c) => c.name === hostProfile.country);
      if (countryObj) loc.setCountry(countryObj);
    }

    setActiveSocials({
      whatsapp: !!hostProfile.whatsapp,
      facebook: !!hostProfile.facebook,
      instagram: !!hostProfile.instagram,
    });
  }, [hostProfile, loc.countries]);

  // Pre-select state from profile once states are available
  useEffect(() => {
    if (!hostProfile?.state || !loc.states.length || loc.selectedState) return;
    const stateObj = loc.states.find((s) => s.name === hostProfile.state);
    if (stateObj) loc.setState(stateObj);
  }, [hostProfile?.state, loc.states]);

  // Pre-select city from profile once cities are available
  useEffect(() => {
    if (!hostProfile?.city || !loc.cities.length || loc.selectedCity) return;
    const cityObj = loc.cities.find((c) => c.name === hostProfile.city);
    if (cityObj) loc.setCity(cityObj);
  }, [hostProfile?.city, loc.cities]);

  // Pincode auto-fill for Indian addresses
  useEffect(() => {
    const pincode = formData.zip_code;
    const countryName = loc.selectedCountry?.name || '';
    const isIndiaOrEmpty = !countryName || countryName.toLowerCase() === 'india';

    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode) || !isIndiaOrEmpty) return;
    if (pincodeApplied.current) return;

    const timeoutId = setTimeout(async () => {
      setPincodeLoading(true);
      const addressData = await fetchAddressByPincode(pincode);
      if (addressData) {
        if (!loc.selectedCountry) {
          const indiaObj = loc.countries.find((c) => c.name.toLowerCase() === (addressData.country || 'india').toLowerCase());
          if (indiaObj) loc.setCountry(indiaObj);
        }
        pincodeApplied.current = true;
      }
      setPincodeLoading(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.zip_code, loc.countries, loc.selectedCountry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'zip_code') pincodeApplied.current = false;
  };

  const toggleSocial = (social) => {
    setActiveSocials((prev) => ({ ...prev, [social]: !prev[social] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const requiredFields = ['full_name', 'email', 'phone'];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (!loc.selectedCountry) missingFields.push('country');
    if (!loc.selectedState) missingFields.push('state');
    if (!loc.selectedCity) missingFields.push('city');
    if (!formData.street_address) missingFields.push('street_address');

    if (missingFields.length > 0) {
      setSubmitError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    if (!formData.whatsapp && !formData.facebook && !formData.instagram) {
      setSubmitError('Please provide at least one social media link (WhatsApp, Facebook, or Instagram)');
      setIsSubmitting(false);
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user.id || user._id;

      const hostPayload = {
        userId,
        user_id: userId,
        full_name: formData.full_name,
        email: formData.email,
        phone: `${formData.phonePrefix} ${formData.phone}`,
        country: loc.selectedCountry?.name || '',
        state: loc.selectedState?.name || '',
        city: loc.selectedCity?.name || '',
        zip_code: formData.zip_code,
        address: formData.street_address,
        street_address: formData.street_address,
        whatsapp: formData.whatsapp ? `${formData.whatsappPrefix} ${formData.whatsapp}` : '',
        facebook: extractUsername('facebook', formData.facebook),
        instagram: extractUsername('instagram', formData.instagram),
      };

      await saveHost(hostPayload).unwrap();
      setShowSuccess(true);
      navigate('/host/create');
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      if (err.status === 'PARSING_ERROR' && err.originalStatus === 500) {
        setSubmitError('Server error occurred. Please try again later or contact support if the problem persists.');
      } else if (err.status === 401) {
        setSubmitError('Your session has expired. Please sign in again to submit your host application.');
        localStorage.removeItem('user');
      } else {
        setSubmitError(err.data?.message || err.error || 'Failed to submit application. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    focusedField,
    setFocusedField,
    isSubmitting,
    isSubmitLoading,
    isError,
    error,
    showSuccess,
    submitError,
    pincodeLoading,
    activeSocials,
    toggleSocial,
    hostProfile,
    loc,
    handleSubmit,
  };
}
