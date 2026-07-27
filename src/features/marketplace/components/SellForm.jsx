import React, { useEffect } from 'react';
import { Camera, Loader2, ShoppingBag, X } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useSellForm } from './hooks/useSellForm';
import { SellFormMediaStep } from './sell-form/SellFormMediaStep';
import { SellFormDetailsStep } from './sell-form/SellFormDetailsStep';
import { SellFormLocationStep } from './sell-form/SellFormLocationStep';

/**
 * SellForm orchestrator.
 * Renders the media, details, and location/contact sections and wires them
 * up to the useSellForm hook which owns all state, validation and submission.
 */
export function SellForm({ onPost, initialData, isEditing: externalIsEditing }) {
  const f = useSellForm({ onPost, initialData, isEditing: externalIsEditing });

  // Object URL previews for newly-added images (created lazily, revoked on change)
  const [previewUrls, setPreviewUrls] = React.useState([]);
  useEffect(() => {
    const urls = f.images.map((img) => URL.createObjectURL(img));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.images]);

  const fileInputRef = React.useRef(null);
  const allPreviewImages = [...f.existingImages, ...previewUrls];

  const handleFileSelect = (e) => {
    if (e.target.files) f.addFiles(e.target.files);
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    if (index < f.existingImages.length) {
      f.removeExistingImage(f.existingImages[index]);
    } else {
      f.removeImage(index - f.existingImages.length);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    f.setDragActive(true);
  };

  /* ================= RENDER ================= */

  if (f.isProfileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!f.isVerifiedHost) {
    const isPending = f.hostProfile?.status === 'pending';
    return (
      <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-xl text-center border border-gray-200 shadow-md">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isPending ? 'Account Verification Pending' : 'Host Access Required'}
        </h2>
        <p className="text-[#222222] mb-6">
          {isPending
            ? 'Your host application is currently under review. You can list items once your account is approved.'
            : 'You need to be an approved host to list items for sale.'}
        </p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => f.navigate('/marketplace')}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm cursor-pointer"
          >
            Back to Marketplace
          </button>
          {!isPending && (
            <button
              type="button"
              onClick={() => f.navigate('/hosts')}
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
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-md space-y-6 text-left">
      {/* Top Return Header */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
        <button
          type="button"
          onClick={() => f.navigate('/marketplace')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-[#00142E] bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <span>← Back to Marketplace</span>
        </button>
        <span className="text-xs font-bold text-gray-400">Post Buy/Sell Listing</span>
      </div>

      {/* Header with Icon & Clean Subtitle */}
      <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-[#00142E] shrink-0">
          <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#00142E] tracking-tight">
            {f.isEditing ? 'Update Listing' : 'List an Item for Sale'}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            {f.isEditing
              ? 'Update your listing details below.'
              : 'Share pre-owned furniture, electronics, and goods with fellow members.'}
          </p>
        </div>
      </div>

      {f.isError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm font-medium">
          {f.error?.data?.message || 'Failed to create listing'}
        </div>
      )}

      {f.validationError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm font-medium">
          {f.validationError}
        </div>
      )}

      {f.isSuccess && (
        <div className="bg-green-100 text-green-700 p-3 rounded-xl text-sm font-medium">
          Listing created successfully
        </div>
      )}

      <form onSubmit={f.handleSubmit} className="space-y-4">
        {/* PHOTOS */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-4 sm:p-6 bg-white text-center',
            f.dragActive ? 'border-indigo-500' : 'border-gray-300'
          )}
          onDragOver={handleDragOver}
          onDragLeave={() => f.setDragActive(false)}
          onDrop={f.handleDrop}
        >
          <input
            type="file"
            multiple
            className="hidden"
            id="images"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileSelect}
          />
          <label htmlFor="images" className="cursor-pointer">
            <Camera className="mx-auto text-indigo-600 mb-2 h-5 w-5 sm:h-6 sm:w-6" />
            <p className="font-medium text-gray-900 text-sm sm:text-base">
              Click or drag images here
            </p>
          </label>

          {allPreviewImages.length > 0 && (
            <div className="flex gap-2 sm:gap-3 mt-4 overflow-x-auto">
              {allPreviewImages.map((imgUrl, i) => (
                <div
                  key={i < f.existingImages.length ? `existing-${imgUrl}` : `new-${i}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 border rounded-lg overflow-hidden shrink-0"
                >
                  <img src={imgUrl} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveImage(i);
                    }}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-red-50"
                  >
                    <X size={12} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ITEM DETAILS */}
        <SellFormDetailsStep
          title={f.title}
          setTitle={f.setTitle}
          category={f.category}
          setCategory={f.setCategory}
          subcategory={f.subcategory}
          setSubcategory={f.setSubcategory}
          condition={f.condition}
          setCondition={f.setCondition}
          make={f.make}
          setMake={f.setMake}
          model={f.model}
          setModel={f.setModel}
          year={f.year}
          setYear={f.setYear}
          mileage={f.mileage}
          setMileage={f.setMileage}
          fuelType={f.fuelType}
          setFuelType={f.setFuelType}
          transmission={f.transmission}
          setTransmission={f.setTransmission}
          price={f.price}
          setPrice={f.setPrice}
          loc={f.loc}
        />

        {/* LOCATION, DESCRIPTION & CONTACT */}
        <SellFormLocationStep
          loc={f.loc}
          zipCode={f.zipCode}
          setZipCode={f.setZipCode}
          isPincodeLoading={f.isPincodeLoading}
          streetAddress={f.streetAddress}
          setStreetAddress={f.setStreetAddress}
          description={f.description}
          setDescription={f.setDescription}
          name={f.name}
          setName={f.setName}
          phone={f.phone}
          setPhone={f.setPhone}
          phoneCode={f.phoneCode}
          setPhoneCode={f.setPhoneCode}
          phoneIso={f.phoneIso}
          setPhoneIso={f.setPhoneIso}
        />

        {/* ACTIONS */}
        <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">
          <button
            type="submit"
            disabled={f.isLoading}
            className="w-full sm:w-auto bg-[#00142E] hover:bg-[#071F3B] text-white font-bold rounded-xl h-11 px-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {f.isLoading
              ? f.isEditing
                ? 'Updating...'
                : 'Posting...'
              : f.isEditing
                ? 'Update Listing'
                : 'Post Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
