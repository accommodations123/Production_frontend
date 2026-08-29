import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SiGmail } from 'react-icons/si';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaXTwitter, FaLinkedinIn, FaUserPlus, FaClock } from 'react-icons/fa6';
import { validateSocial, getSocialUrl } from '@/shared/utils/socialUtils';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  useGetConnectionStatusQuery,
  useSendConnectionRequestMutation
} from '@/store/api/connectionApi';
import { toast } from 'sonner';

/**
 * Quick-connect social buttons for card footers (PropertyCard / ProductCard / TravelCard / EventCard).
 */
export function SocialQuickConnect({
  socials,
  className = '',
  ownerId = null,
  ownerName = '',
  itemId = '',
  itemTitle = '',
  itemType = 'accommodations'
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id || user?._id;
  const cleanStr = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  let localUser = null;
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('authUser');
    if (raw) localUser = JSON.parse(raw);
  } catch {}

  const userIds = [
    user?.id,
    user?.user_id,
    user?._id,
    user?.host_id,
    user?.Host?.id,
    user?.Host?.user_id,
    user?.host?.id,
    user?.host?.user_id,
    user?.profile?.id,
    user?.profile?.user_id,
    user?.sub,
    localUser?.id,
    localUser?.user_id,
    localUser?._id,
    localUser?.host_id,
    localUser?.profile?.id,
    localUser?.profile?.user_id,
    localUser?.sub
  ].filter(Boolean).map(String);

  const currentNames = [
    user?.full_name,
    user?.fullName,
    user?.name,
    user?.username,
    user?.user_name,
    user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null,
    user?.first_name,
    user?.email ? user.email.split('@')[0] : null,
    localUser?.full_name,
    localUser?.fullName,
    localUser?.name,
    localUser?.username,
    localUser?.user_name,
    localUser?.first_name ? `${localUser.first_name} ${localUser.last_name || ''}`.trim() : null,
    localUser?.email ? localUser.email.split('@')[0] : null
  ].filter(Boolean);

  const cleanOwner = cleanStr(ownerName);

  const isOwner = Boolean(
    (user || localUser) && (
      (ownerId && userIds.some(uid => uid === String(ownerId))) ||
      (cleanOwner && currentNames.some(n => {
        const cn = cleanStr(n);
        return cn && (cn === cleanOwner || cleanOwner.startsWith(cn) || cn.startsWith(cleanOwner) || cleanOwner.includes(cn) || cn.includes(cleanOwner));
      }))
    )
  );

  const [isRequestedLocally, setIsRequestedLocally] = useState(false);

  const { data: statusRes } = useGetConnectionStatusQuery(
    itemId ? { targetUserId: ownerId, itemId, itemType } : ownerId,
    {
      skip: !ownerId || !currentUserId || isOwner,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true
    }
  );
  const [sendReq, { isLoading: isSending }] = useSendConnectionRequestMutation();

  const connStatus = isOwner ? "accepted" : (isRequestedLocally ? "pending" : (statusRes?.status || statusRes?.data?.status || "none"));
  const isConnected = isOwner || connStatus === "accepted";

  // Effective social channels from owner profile or accepted connection request data
  const effectiveSocials = {
    whatsapp:
      (isOwner
        ? (user?.whatsapp || user?.Host?.whatsapp || user?.host?.whatsapp || user?.phone || user?.Host?.phone || user?.host?.phone)
        : null) ||
      socials?.whatsapp ||
      socials?.phone ||
      statusRes?.data?.targetWhatsapp ||
      statusRes?.data?.targetPhone ||
      "",
    email:
      (isOwner
        ? (user?.email || user?.Host?.email || user?.host?.email)
        : null) ||
      socials?.email ||
      statusRes?.data?.targetEmail ||
      "",
    instagram:
      (isOwner
        ? (user?.instagram || user?.Host?.instagram || user?.host?.instagram)
        : null) ||
      socials?.instagram ||
      statusRes?.data?.targetInstagram ||
      "",
    facebook:
      (isOwner
        ? (user?.facebook || user?.Host?.facebook || user?.host?.facebook)
        : null) ||
      socials?.facebook ||
      statusRes?.data?.targetFacebook ||
      "",
    linkedin:
      (isOwner
        ? (user?.linkedin || user?.Host?.linkedin || user?.host?.linkedin)
        : null) ||
      socials?.linkedin ||
      statusRes?.data?.targetLinkedin ||
      "",
    twitter:
      (isOwner
        ? (user?.twitter || user?.x || user?.Host?.twitter || user?.Host?.x || user?.host?.twitter || user?.host?.x)
        : null) ||
      socials?.twitter ||
      statusRes?.data?.targetTwitter ||
      ""
  };

  // If not connected and not the owner, hide social icons and show Connect button
  if (!isConnected) {
    const handleConnectClick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!currentUserId) {
        toast.error("Please sign in to send a connection request.");
        navigate("/signin");
        return;
      }
      try {
        setIsRequestedLocally(true);
        await sendReq({
          targetUserId: ownerId,
          targetName: ownerName || "Owner",
          itemId,
          itemTitle: itemTitle || "Listing",
          itemType,
          requesterPhone: user?.phone || "",
          requesterEmail: user?.email || ""
        }).unwrap();
        toast.success(`Connection request sent to ${ownerName || "the owner"}!`);
      } catch (err) {
        setIsRequestedLocally(false);
        toast.error(err?.data?.message || "Failed to send connection request.");
      }
    };

    if (connStatus === "pending") {
      return (
        <button
          type="button"
          disabled
          className={`px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-not-allowed select-none ${className}`}
        >
          <FaClock className="w-2.5 h-2.5" />
          Requested
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={isSending}
        onClick={handleConnectClick}
        className={`px-3 py-1.5 bg-[#CB2A26] hover:bg-[#a82220] text-white rounded-full text-[10px] font-bold flex items-center gap-1 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer ${className}`}
      >
        <FaUserPlus className="w-2.5 h-2.5" />
        {currentUserId ? "Connect" : "Sign in to connect"}
      </button>
    );
  }

  const handleSocialClick = (e, platform, value) => {
    e.preventDefault();
    e.stopPropagation();

    if (platform === 'email') {
      const url = getSocialUrl('email', value);
      if (url) {
        window.location.href = url;
      }
    } else {
      const url = getSocialUrl(platform, value);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const activeSocials = [];

  if (effectiveSocials.whatsapp && validateSocial('whatsapp', effectiveSocials.whatsapp)) {
    activeSocials.push({
      platform: 'whatsapp',
      value: effectiveSocials.whatsapp,
      icon: FaWhatsapp,
      bgColor: 'bg-[#25D366] text-white hover:bg-[#20BD5A] hover:scale-105',
      title: 'WhatsApp'
    });
  }

  if (effectiveSocials.email && validateSocial('email', effectiveSocials.email)) {
    activeSocials.push({
      platform: 'email',
      value: effectiveSocials.email,
      icon: SiGmail,
      bgColor: 'bg-[#CB2A26] text-white hover:bg-[#A9221F] hover:scale-105',
      title: 'Email'
    });
  }

  if (effectiveSocials.instagram && validateSocial('instagram', effectiveSocials.instagram)) {
    activeSocials.push({
      platform: 'instagram',
      value: effectiveSocials.instagram,
      icon: FaInstagram,
      bgColor: 'bg-[#E4405F] text-white hover:bg-[#D03552] hover:scale-105',
      title: 'Instagram'
    });
  }

  if (effectiveSocials.facebook && validateSocial('facebook', effectiveSocials.facebook)) {
    activeSocials.push({
      platform: 'facebook',
      value: effectiveSocials.facebook,
      icon: FaFacebookF,
      bgColor: 'bg-[#1877F2] text-white hover:bg-[#166FE5] hover:scale-105',
      title: 'Facebook'
    });
  }

  if (effectiveSocials.linkedin && validateSocial('linkedin', effectiveSocials.linkedin)) {
    activeSocials.push({
      platform: 'linkedin',
      value: effectiveSocials.linkedin,
      icon: FaLinkedinIn,
      bgColor: 'bg-[#0A66C2] text-white hover:bg-[#08529C] hover:scale-105',
      title: 'LinkedIn'
    });
  }

  if (effectiveSocials.twitter && validateSocial('twitter', effectiveSocials.twitter)) {
    activeSocials.push({
      platform: 'twitter',
      value: effectiveSocials.twitter,
      icon: FaXTwitter,
      bgColor: 'bg-black text-white hover:bg-slate-800 hover:scale-105',
      title: 'X / Twitter'
    });
  }

  if (activeSocials.length === 0) {
    if (isOwner) {
      return (
        <span className={`px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold flex items-center gap-1 select-none shadow-xs ${className}`}>
          ✓ You
        </span>
      );
    }
    if (connStatus === "accepted") {
      return (
        <span className={`px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold flex items-center gap-1 select-none shadow-xs ${className}`}>
          ✓ Connected
        </span>
      );
    }
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 items-center justify-end ${className}`}>
      {activeSocials.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.platform}
            type="button"
            onClick={(e) => handleSocialClick(e, item.platform, item.value)}
            className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer ${item.bgColor}`}
            title={item.title}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Full seller contact button bar for detail views.
 */
export function SellerContactButtons({
  phone,
  email,
  instagram,
  linkedin,
  ownerId = null,
  ownerName = "",
  itemId = "",
  itemTitle = "",
  itemType = "accommodations"
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id;

  const isOwner = Boolean(ownerId && currentUserId && String(ownerId) === String(currentUserId));

  const { data: statusRes } = useGetConnectionStatusQuery(
    itemId ? { targetUserId: ownerId, itemId } : ownerId,
    {
      skip: !ownerId || !currentUserId || isOwner
    }
  );
  const [sendReq, { isLoading: isSending }] = useSendConnectionRequestMutation();

  const connStatus = isOwner ? "accepted" : (statusRes?.status || "none");
  const isConnected = isOwner || connStatus === "accepted";

  if (!isConnected) {
    const handleConnectClick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!currentUserId) {
        toast.error("Please sign in to send a connection request.");
        navigate("/signin");
        return;
      }
      try {
        await sendReq({
          targetUserId: ownerId,
          targetName: ownerName || "Seller",
          itemId,
          itemTitle: itemTitle || "Listing",
          itemType,
          requesterPhone: user?.phone || "",
          requesterEmail: user?.email || ""
        }).unwrap();
        toast.success(`Connection request sent to ${ownerName || "the seller"}!`);
      } catch (err) {
        toast.error(err?.data?.message || "Failed to send connection request.");
      }
    };

    if (connStatus === "pending") {
      return (
        <button
          type="button"
          disabled
          className="w-full h-11 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed select-none text-xs"
        >
          <FaClock className="w-3.5 h-3.5" />
          Connection Request Pending Approval
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={isSending}
        onClick={handleConnectClick}
        className="w-full h-11 bg-[#CB2A26] hover:bg-[#a82220] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all text-xs cursor-pointer shadow-xs"
      >
        <FaUserPlus className="w-3.5 h-3.5" />
        {currentUserId ? "Send Connection Request to View Contacts" : "Sign in to connect"}
      </button>
    );
  }

  const activeButtons = [];

  if (phone) {
    activeButtons.push({
      platform: 'whatsapp',
      label: 'WhatsApp',
      onClick: () => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank'),
      bgClass: 'bg-[#25D366] hover:bg-[#20BD5A] text-white',
      icon: <FaWhatsapp className="w-4 h-4" />
    });
  }

  if (linkedin) {
    activeButtons.push({
      platform: 'linkedin',
      label: 'LinkedIn',
      onClick: () => window.open(getSocialUrl('linkedin', linkedin), '_blank'),
      bgClass: 'bg-[#0A66C2] hover:bg-[#08529C] text-white',
      icon: <FaLinkedinIn className="w-4 h-4" />
    });
  }

  if (email) {
    activeButtons.push({
      platform: 'email',
      label: 'Email',
      onClick: () => window.open(`mailto:${email}`, '_self'),
      bgClass: 'bg-[#00162D] hover:bg-[#0A1C30] text-white',
      icon: <SiGmail className="w-4 h-4" />
    });
  }

  if (activeButtons.length === 0) return null;

  return (
    <div className="flex gap-2 w-full flex-wrap">
      {activeButtons.map((btn) => (
        <button
          key={btn.platform}
          type="button"
          onClick={btn.onClick}
          className={`flex-1 min-w-[100px] h-10 ${btn.bgClass} rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs hover:scale-[1.01] active:scale-98 transition-all text-xs cursor-pointer`}
        >
          {btn.icon}
          <span>{btn.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Host detail socials alias.
 */
export const HostDetailSocials = SocialQuickConnect;

