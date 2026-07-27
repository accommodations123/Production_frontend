import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBuySellMutation, useUpdateBuySellMutation } from '@/store/api/marketplaceApi';
import { useGetHostProfileQuery } from '@/store/api/hostApi';
import { useGetMeQuery } from '@/store/api/authApi';
import { useCountry } from '@/context/CountryContext';
import { useLocationCascade } from '@/shared/hooks/useLocationCascade';
import { splitPhone, formatPhone } from '@/shared/utils/phoneUtils';
import { fetchAddressByPincode } from '@/shared/utils/pincodeUtils';
import { compressImage } from '@/shared/utils/imageUtils';
import { CATEGORY_MAP } from '../sell-form/sellFormConstants';

const appendIfExists = (formData, key, value) => {
  if (value !== undefined && value !== null && value !== '') {
    formData.append(key, value);
  }
};

/**
 * Hook managing all SellForm state, validation, and submission.
 */
export function useSellForm({ onPost, initialData, isEditing: externalIsEditing }) {
  const navigate = useNavigate();
  const { activeCountry: globalActiveCountry } = useCountry();

  // Auth / host queries
  const { data: userData } = useGetMeQuery();
  const { data: hostProfile, isLoading: isProfileLoading } = useGetHostProfileQuery(undefined, {
    skip: !userData,
  });
  const isVerifiedHost = hostProfile?.status === 'approved';

  // Location cascade
  const loc = useLocationCascade();

  // Images
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phoneIso, setPhoneIso] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [condition, setCondition] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');

  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const lastSyncedGlobalCountryRef = useRef(null);

  // Mutations
  const [createBuySell, { isLoading: isCreating, isError: isCreateError, error: createError, isSuccess: isCreateSuccess }] = useCreateBuySellMutation();
  const [updateBuySell, { isLoading: isUpdating, isError: isUpdateError, error: updateError, isSuccess: isUpdateSuccess }] = useUpdateBuySellMutation();

  const isLoading = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;
  const isSuccess = isCreateSuccess || isUpdateSuccess;
  const isEditing = !!initialData || externalIsEditing;

  // Pre-fill from initialData or localStorage
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setPrice(initialData.price || '');
      setDescription(initialData.description || '');
      setZipCode(initialData.zip_code || '');
      setStreetAddress(initialData.street_address || '');
      setName(initialData.name || '');
      setCategory(initialData.category || 'Furniture');
      setSubcategory(initialData.subcategory || '');
      setCondition(initialData.condition || 'New');
      setMake(initialData.make || '');
      setModel(initialData.model || '');
      setYear(initialData.year || '');
      setMileage(initialData.mileage || '');
      setFuelType(initialData.fuel_type || '');
      setTransmission(initialData.transmission || '');

      if (initialData.phone) {
        const parsed = splitPhone(initialData.phone);
        setPhoneCode(parsed.code);
        setPhone(parsed.number);
      }

      if (initialData.images && Array.isArray(initialData.images)) {
        setExistingImages(initialData.images);
      } else if (initialData.image) {
        setExistingImages([initialData.image]);
      }

      // Pre-select location in cascade
      if (initialData.country && loc.countries.length) {
        const cObj = loc.countries.find((c) => c.name === initialData.country);
        if (cObj) loc.setCountry(cObj);
      }
    } else {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.fullName || user.name) setName(user.fullName || user.name);
          if (user.phone) {
            const parsed = splitPhone(user.phone);
            setPhoneCode(parsed.code);
            setPhone(parsed.number);
          }
        } catch (err) {
          console.warn('Failed to parse user for SellForm pre-fill', err);
        }
      }
    }
  }, [initialData, loc.countries.length]);

  // Sync global country for new listings
  useEffect(() => {
    const globalCode = globalActiveCountry?.code || globalActiveCountry?.country;
    if (!isEditing && globalCode && loc.countries.length) {
      if (lastSyncedGlobalCountryRef.current !== globalCode) {
        const matched = loc.countries.find((c) => c.isoCode === globalCode);
        if (matched) {
          loc.setCountry(matched);
          lastSyncedGlobalCountryRef.current = globalCode;
        }
      }
    }
  }, [globalActiveCountry, isEditing, loc.countries.length]);

  // Pincode auto-fill
  useEffect(() => {
    if (initialData && zipCode === initialData.zip_code) return;

    const timer = setTimeout(async () => {
      if (zipCode && zipCode.length === 6 && /^\d+$/.test(zipCode) && loc.countries.length) {
        setIsPincodeLoading(true);
        const data = await fetchAddressByPincode(zipCode);
        if (data) {
          const cObj = loc.countries.find((c) => c.name?.toLowerCase() === (data.country || 'india').toLowerCase());
          if (cObj) loc.setCountry(cObj);
        }
        setIsPincodeLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [zipCode, loc.countries.length]);

  // Image handlers
  const addFiles = (files) => {
    const valid = [];
    const oversized = [];
    Array.from(files).forEach((f) => {
      if (f instanceof File) {
        if (f.size > 10 * 1024 * 1024) oversized.push(f.name);
        else valid.push(f);
      }
    });
    if (oversized.length) {
      setValidationError(`Some files are too large (Max 10MB): ${oversized.join(', ')}`);
    } else {
      setValidationError('');
    }
    setImages((prev) => [...prev, ...valid]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));
  const removeExistingImage = (url) => setExistingImages((prev) => prev.filter((img) => img !== url));

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const countryName = loc.selectedCountry?.name || '';
    const stateName = loc.selectedState?.name || '';
    const cityName = loc.selectedCity?.name || '';

    if (!title || !price || !description || !countryName || !stateName || !cityName || !streetAddress || !name || !phone || !category || !subcategory || !condition) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    const validSubs = CATEGORY_MAP[category] || ['Other'];
    if (!validSubs.includes(subcategory)) {
      setValidationError(`Invalid subcategory for "${category}".`);
      return;
    }

    const fd = new FormData();
    appendIfExists(fd, 'title', title);
    if (price !== '') fd.append('price', Number(price));
    appendIfExists(fd, 'description', description);
    appendIfExists(fd, 'country', countryName);
    appendIfExists(fd, 'state', stateName);
    appendIfExists(fd, 'city', cityName);
    appendIfExists(fd, 'zip_code', zipCode);
    appendIfExists(fd, 'street_address', streetAddress);
    appendIfExists(fd, 'category', category);
    appendIfExists(fd, 'subcategory', subcategory);
    appendIfExists(fd, 'condition', condition);

    if (category === 'Vehicles') {
      appendIfExists(fd, 'make', make);
      appendIfExists(fd, 'model', model);
      appendIfExists(fd, 'year', year);
      appendIfExists(fd, 'mileage', mileage);
      appendIfExists(fd, 'fuel_type', fuelType);
      appendIfExists(fd, 'transmission', transmission);
    }

    appendIfExists(fd, 'name', name);
    appendIfExists(fd, 'phone', formatPhone(phoneCode, phone));
    fd.append('status', 'active');
    fd.append('existingImages', JSON.stringify(existingImages));

    for (const img of images) {
      try {
        const compressed = await compressImage(img);
        fd.append('galleryImages', compressed);
      } catch (err) {
        console.error('Failed to compress image, using original:', err);
        fd.append('galleryImages', img);
      }
    }

    try {
      let res;
      if (isEditing && initialData?.id) {
        res = await updateBuySell({ id: initialData.id, data: fd }).unwrap();
      } else {
        res = await createBuySell(fd).unwrap();
      }
      if (res?.success && onPost) onPost(res.listing || res.listings?.[0]);
    } catch (err) {
      console.error('Listing operation failed:', err);
    }
  };

  return {
    // Auth
    isProfileLoading, isVerifiedHost, hostProfile, navigate,
    // Location
    loc, isPincodeLoading,
    // Form fields
    title, setTitle, price, setPrice, description, setDescription,
    zipCode, setZipCode, streetAddress, setStreetAddress,
    name, setName, phone, setPhone, phoneCode, setPhoneCode, phoneIso, setPhoneIso,
    category, setCategory, subcategory, setSubcategory, condition, setCondition,
    make, setMake, model, setModel, year, setYear,
    mileage, setMileage, fuelType, setFuelType, transmission, setTransmission,
    // Images
    images, existingImages, dragActive, setDragActive,
    addFiles, handleDrop, removeImage, removeExistingImage,
    // Status
    isLoading, isError, error, isSuccess, isEditing,
    validationError, setValidationError, handleSubmit,
  };
}
