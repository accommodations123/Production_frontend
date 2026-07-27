import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTripMutation } from '@/store/api/travelApi';
import { useGetHostProfileQuery } from '@/store/api/hostApi';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAuth } from '@/shared/hooks/useAuth';
import { useLocationCascade } from '@/shared/hooks/useLocationCascade';

const INITIAL_FORM = {
  age: '',
  languages: '',
  airline: '',
  flight_number: '',
  flightName: '',
  travelers_count: '1',
  travel_date: '',
  departure_time: '',
  arrival_date: '',
  arrival_time: '',
};

/**
 * Hook managing all PostTripForm state, validation, and submission.
 * Handles two independent location cascades (origin / destination).
 */
export function usePostTrip({ onClose, onAdd } = {}) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [createTrip, { isLoading: isSubmitting }] = useCreateTripMutation();

  const { data: userData } = useGetMeQuery();
  const { data: hostProfile, isLoading: isProfileLoading } = useGetHostProfileQuery(undefined, {
    skip: !userData,
  });
  const isVerifiedHost = hostProfile?.status === 'approved';

  const [form, setForm] = useState(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState('personal');
  const [formErrors, setFormErrors] = useState({});

  // Two independent cascades for origin and destination
  const fromLoc = useLocationCascade();
  const toLoc = useLocationCascade();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.age) errors.age = 'Age is required';
    if (!form.languages) errors.languages = 'Languages are required';
    if (!form.airline) errors.airline = 'Airline is required';
    if (!fromLoc.selectedCountry) errors.from_country = 'Origin country is required';
    if (!fromLoc.selectedCity) errors.from_city = 'Origin city is required';
    if (!toLoc.selectedCountry) errors.to_country = 'Destination country is required';
    if (!toLoc.selectedCity) errors.to_city = 'Destination city is required';
    if (!form.travel_date) errors.travel_date = 'Travel date is required';
    if (!form.departure_time) errors.departure_time = 'Departure time is required';

    setFormErrors(errors);
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      const personalFields = ['age', 'languages'];
      const hasPersonalErrors = Object.keys(errors).some((field) => personalFields.includes(field));
      setActiveTab(hasPersonalErrors ? 'personal' : 'trip');
      alert('Please fill in all required fields marked in red.');
      return;
    }

    const fromCountry = fromLoc.selectedCountry?.name || '';
    const fromState = fromLoc.selectedState?.name || '';
    const fromCity = fromLoc.selectedCity?.name || '';
    const toCountry = toLoc.selectedCountry?.name || '';
    const toCity = toLoc.selectedCity?.name || '';

    try {
      const payload = {
        host_id: currentUser?.id || 1,
        from_country: fromCountry,
        from_state: fromState,
        from_city: fromCity,
        to_country: toCountry,
        to_city: toCity,
        travel_date: form.travel_date,
        departure_time: form.departure_time,
        arrival_date: form.arrival_date,
        arrival_time: form.arrival_time,
        airline: form.airline,
        flight_number: form.flight_number,
        travelers_count: Number(form.travelers_count),
        age: Number(form.age),
        languages: form.languages.split(',').map((lang) => lang.trim()).filter(Boolean),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await createTrip(payload).unwrap();

      onAdd?.({
        ...response,
        id: response.id || Date.now(),
        user: {
          fullName: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}` : 'Guest User',
          age: Number(form.age),
          languages: form.languages.split(',').map((l) => l.trim()),
          phone: currentUser?.phone || '',
          email: currentUser?.email || '',
          whatsapp: currentUser?.whatsapp || '',
          image: currentUser?.image || currentUser?.profile_image || 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
        },
        destination: `${toCity}, ${toCountry}`,
        date: form.travel_date,
        time: form.departure_time,
        flight: {
          airline: form.airline,
          flightName: form.flightName,
          flightNumber: form.flight_number,
          from: fromCity,
          to: toCity,
          departureDate: form.travel_date,
          departureTime: form.departure_time,
          arrivalDate: form.arrival_date,
          arrivalTime: form.arrival_time,
        },
        travelers_count: form.travelers_count,
      });
      onClose?.();
    } catch (error) {
      console.error('Failed to post trip:', error);
      alert('Failed to post trip. Please try again.');
    }
  };

  return {
    navigate,
    isSubmitting,
    isProfileLoading,
    isVerifiedHost,
    hostProfile,
    form,
    handleChange,
    activeTab,
    formErrors,
    fromLoc,
    toLoc,
    handleSubmit,
  };
}
