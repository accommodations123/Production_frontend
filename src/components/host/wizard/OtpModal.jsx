import React from 'react';

const OtpModal = ({ showOtpModal, setShowOtpModal, handleVerifyOtp }) => {
  if (!showOtpModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Verify Your Email</h3>
        <p className="text-gray-400 mb-4">We've sent a verification code to your email</p>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg text-center text-xl focus:border-accent outline-none"
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowOtpModal(false)}
            className="flex-1 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleVerifyOtp('123456')}
            className="flex-1 py-2 bg-accent text-white rounded-lg font-medium"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;