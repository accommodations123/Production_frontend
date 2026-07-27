import { Briefcase, Camera, MapPin, ShieldCheck } from 'lucide-react';

export function ProfileHeader({ displayName, profileImage, formData, completionScore, handleAvatarUpload }) {
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Cover Banner */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-sm">
        <div className="h-44 sm:h-56 bg-gradient-to-r from-[#F7C06D] via-[#85B7F0] to-[#9F85F0] relative overflow-hidden">
          <div className="absolute right-8 top-6 opacity-15 text-white pointer-events-none">
            <Briefcase className="w-36 h-36" />
          </div>
        </div>

        {/* Profile Box */}
        <div className="bg-white rounded-b-3xl border-x border-b border-gray-200/80 px-6 sm:px-8 pb-8 pt-0 relative z-10 -mt-16 sm:-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-end gap-6 text-center sm:text-left">
              {/* Avatar */}
              <div className="relative group shrink-0">
                {profileImage ? (
                  <img src={profileImage} alt={displayName} className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl object-cover border-4 border-white shadow-xl bg-slate-100" />
                ) : (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl bg-[#7C3AED] text-white font-extrabold text-4xl sm:text-6xl flex items-center justify-center border-4 border-white shadow-xl">
                    {initialLetter}
                  </div>
                )}
                <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-[#00142E] hover:bg-[#CB2A26] text-white p-2 rounded-xl cursor-pointer shadow-md transition-all active:scale-95" title="Update profile picture">
                  <Camera className="w-4 h-4" />
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>

              {/* Name + Meta */}
              <div className="space-y-2 pt-2 mb-12 sm:pt-0">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{displayName}</h1>
                <p className="text-sm font-semibold text-slate-500">{formData.headline}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {formData.city || 'Hyderabad'}{formData.country ? `, ${formData.country}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Completion Meter */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-5">
        <h3 className="font-extrabold text-gray-900 text-base">Profile Completion</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#222222]">Completeness Score</span>
            <span className="font-extrabold text-blue-600">{completionScore}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-[#CB2A26] transition-all duration-500 rounded-full" style={{ width: `${completionScore}%` }} />
          </div>
        </div>
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3">
          <ShieldCheck className="w-9 h-9 text-blue-600 shrink-0" />
          <div>
            <p className="font-extrabold text-gray-900 text-xs">Verified Account Badge</p>
            <p className="text-[10px] text-[#484848] mt-0.5 leading-relaxed">Completing your location, contact, and social details increases host & guest response rates by 3x.</p>
          </div>
        </div>
      </div>
    </>
  );
}
