import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiGmail } from "react-icons/si";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaXTwitter, FaLinkedinIn, FaUserPlus, FaClock } from "react-icons/fa6";
import { validateSocial, getSocialUrl } from "@/lib/socialUtils";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  useGetConnectionStatusQuery,
  useSendConnectionRequestMutation
} from "@/store/api/connectionApi";
import { toast } from "sonner";

/**
 * Helper to determine whether the logged-in user is the owner/host of a given item.
 */
export function checkIsOwner({ user, ownerId, ownerEmail, ownerName, socials }) {
  if (!user) return false;

  const userIds = [
    user.id,
    user.user_id,
    user._id,
    user.userId,
    user.host_id,
    user.Host?.id,
    user.host?.id,
    user.Host?.user_id,
    user.host?.user_id,
    user.user?.id,
    user.user?._id
  ].filter(Boolean).map(String);

  const userEmails = [
    user.email,
    user.user?.email,
    user.Host?.email,
    user.host?.email
  ].filter(Boolean).map((e) => String(e).trim().toLowerCase());

  const currentNames = [
    user.full_name,
    user.fullName,
    user.name,
    user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null,
    user.first_name,
    user.user?.full_name,
    user.user?.name,
    user.email ? user.email.split('@')[0] : null
  ].filter(Boolean);

  const cleanStr = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. Direct ID match
  if (ownerId && userIds.some((uid) => uid === String(ownerId))) {
    return true;
  }

  // 2. Email match
  const targetEmail = (ownerEmail || socials?.email || "").trim().toLowerCase();
  if (targetEmail && userEmails.some((em) => em === targetEmail)) {
    return true;
  }

  // 3. Name match (ignore generic placeholders)
  const cleanOwner = cleanStr(ownerName);
  const isGeneric = !cleanOwner || ['host', 'seller', 'user', 'owner', 'travelpartner', 'professional', 'traveler', 'organizer'].includes(cleanOwner);
  if (!isGeneric && currentNames.some((n) => {
    const cn = cleanStr(n);
    return cn && (cn === cleanOwner || cleanOwner.startsWith(cn) || cn.startsWith(cleanOwner) || cleanOwner.includes(cn) || cn.includes(cleanOwner));
  })) {
    return true;
  }

  return false;
}

/**
 * Renders quick-connect social circle buttons for card footers (PropertyCard / ProductCard / EventCard / TripCard / PeopleCard).
 */
export const SocialQuickConnect = ({ 
  socials, 
  className = "", 
  ownerId = null, 
  ownerEmail = null,
  ownerName = "",
  itemId = "",
  itemTitle = "",
  itemType = "accommodations"
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id || user?._id;

  const isOwner = checkIsOwner({ user, ownerId, ownerEmail, ownerName, socials });
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
          <FaClock className="w-2.5 h-2.5 text-amber-600" />
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

    if (platform === "email") {
      const url = getSocialUrl("email", value);
      if (url) {
        window.location.href = url;
      }
    } else {
      const url = getSocialUrl(platform, value);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  };

  const activeSocials = [];

  if (effectiveSocials.whatsapp && validateSocial("whatsapp", effectiveSocials.whatsapp)) {
    activeSocials.push({
      platform: "whatsapp",
      value: effectiveSocials.whatsapp,
      icon: FaWhatsapp,
      bgColor: "bg-[#25D366] text-white hover:bg-[#20ba5a] hover:scale-110",
      title: "WhatsApp"
    });
  }

  if (effectiveSocials.email && validateSocial("email", effectiveSocials.email)) {
    activeSocials.push({
      platform: "email",
      value: effectiveSocials.email,
      icon: SiGmail,
      bgColor: "bg-[#EA4335] text-white hover:bg-[#d3362a] hover:scale-110",
      title: "Gmail"
    });
  }

  if (effectiveSocials.instagram && validateSocial("instagram", effectiveSocials.instagram)) {
    activeSocials.push({
      platform: "instagram",
      value: effectiveSocials.instagram,
      icon: FaInstagram,
      bgColor: "bg-[#E4405F] text-white hover:bg-[#d03552] hover:scale-110",
      title: "Instagram"
    });
  }

  if (effectiveSocials.facebook && validateSocial("facebook", effectiveSocials.facebook)) {
    activeSocials.push({
      platform: "facebook",
      value: effectiveSocials.facebook,
      icon: FaFacebookF,
      bgColor: "bg-[#1877F2] text-white hover:bg-[#1464cd] hover:scale-110",
      title: "Facebook"
    });
  }

  if (effectiveSocials.linkedin && validateSocial("linkedin", effectiveSocials.linkedin)) {
    activeSocials.push({
      platform: "linkedin",
      value: effectiveSocials.linkedin,
      icon: FaLinkedinIn,
      bgColor: "bg-[#0A66C2] text-white hover:bg-[#08529C] hover:scale-110",
      title: "LinkedIn"
    });
  }

  if (effectiveSocials.twitter && validateSocial("twitter", effectiveSocials.twitter)) {
    activeSocials.push({
      platform: "twitter",
      value: effectiveSocials.twitter,
      icon: FaXTwitter,
      bgColor: "bg-black text-white hover:bg-gray-900 hover:scale-110",
      title: "X (Twitter)"
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
    <div className={`flex flex-wrap gap-1.5 sm:gap-2 items-center justify-end ${className}`}>
      {activeSocials.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.platform}
            type="button"
            onClick={(e) => handleSocialClick(e, item.platform, item.value)}
            className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer ${item.bgColor}`}
            title={item.title}
          >
            {item.platform === "email" ? (
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            ) : item.platform === "facebook" ? (
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            ) : (
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Renders contact buttons in detail seller profile sections (Marketplace page/details).
 */
export const SellerContactButtons = ({
  phone,
  email,
  instagram,
  facebook,
  linkedin,
  ownerId = null,
  ownerEmail = null,
  ownerName = "",
  itemId = "",
  itemTitle = "",
  itemType = "buysell"
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id;
  const [isRequestedLocally, setIsRequestedLocally] = useState(false);

  const isOwner = checkIsOwner({ user, ownerId, ownerEmail: ownerEmail || email, ownerName, socials: { email, phone, instagram, facebook, linkedin } });

  const { data: statusRes } = useGetConnectionStatusQuery(
    itemId ? { targetUserId: ownerId, itemId, itemType } : ownerId,
    {
      skip: !ownerId || !currentUserId || isOwner
    }
  );
  const [sendReq, { isLoading: isSending }] = useSendConnectionRequestMutation();

  const connStatus = isOwner ? "accepted" : (isRequestedLocally ? "pending" : (statusRes?.status || "none"));
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
        setIsRequestedLocally(true);
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
        setIsRequestedLocally(false);
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
          <FaClock className="w-3.5 h-3.5 text-amber-600" />
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

  const effectivePhone = (isOwner ? (user?.phone || user?.Host?.phone || user?.host?.phone) : null) || phone;
  const effectiveEmail = (isOwner ? (user?.email || user?.Host?.email || user?.host?.email) : null) || email;
  const effectiveInstagram = (isOwner ? (user?.instagram || user?.Host?.instagram || user?.host?.instagram) : null) || instagram;
  const effectiveFacebook = (isOwner ? (user?.facebook || user?.Host?.facebook || user?.host?.facebook) : null) || facebook;

  const activeButtons = [];

  if (effectivePhone && validateSocial("whatsapp", effectivePhone)) {
    activeButtons.push({
      platform: "call",
      value: effectivePhone,
      label: "Call",
      onClick: () => window.open(`tel:${effectivePhone.trim()}`),
      bgClass: "hover:bg-white/15",
      textClass: "text-white",
      borderClass: "border-white/10",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    });
  }

  if (effectiveEmail && validateSocial("email", effectiveEmail)) {
    activeButtons.push({
      platform: "email",
      value: effectiveEmail,
      label: "Gmail",
      onClick: () => window.open(getSocialUrl("email", effectiveEmail), "_blank", "noopener,noreferrer"),
      bgClass: "hover:bg-red-500/10",
      textClass: "text-gray-200 hover:text-red-400",
      borderClass: "border-white/10 hover:border-red-500/20",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      )
    });
  }

  if (effectiveInstagram && validateSocial("instagram", effectiveInstagram)) {
    activeButtons.push({
      platform: "instagram",
      value: effectiveInstagram,
      label: "Instagram",
      onClick: () => window.open(getSocialUrl("instagram", effectiveInstagram), "_blank", "noopener,noreferrer"),
      bgClass: "hover:bg-pink-500/10",
      textClass: "text-gray-200 hover:text-pink-400",
      borderClass: "border-white/10 hover:border-pink-500/20",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      )
    });
  }

  if (effectiveFacebook && validateSocial("facebook", effectiveFacebook)) {
    activeButtons.push({
      platform: "facebook",
      value: effectiveFacebook,
      label: "Facebook",
      onClick: () => window.open(getSocialUrl("facebook", effectiveFacebook), "_blank", "noopener,noreferrer"),
      bgClass: "hover:bg-blue-500/10",
      textClass: "text-gray-200 hover:text-blue-400",
      borderClass: "border-white/10 hover:border-blue-500/20",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    });
  }

  if (activeButtons.length === 0) return null;

  return (
    <div className="flex gap-2 w-full flex-wrap">
      {activeButtons.map((btn) => (
        <button
          key={btn.platform}
          onClick={btn.onClick}
          className={`flex-1 min-w-[80px] h-10 bg-white/5 ${btn.bgClass} ${btn.textClass} rounded-xl font-semibold flex items-center justify-center gap-1.5 border ${btn.borderClass} hover:scale-[1.02] active:scale-95 transition-all text-xs cursor-pointer`}
          title={btn.label}
        >
          {btn.icon}
          {btn.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Renders stay-detail style round social connect buttons (Room stays details).
 */
export const HostDetailSocials = ({
  socials,
  className = "",
  ownerId = null,
  ownerEmail = null,
  ownerName = "",
  itemId = ""
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id;
  const [isRequestedLocally, setIsRequestedLocally] = useState(false);

  const isOwner = checkIsOwner({ user, ownerId, ownerEmail, ownerName, socials });

  const { data: statusRes } = useGetConnectionStatusQuery(
    itemId ? { targetUserId: ownerId, itemId, itemType: "accommodations" } : ownerId,
    {
      skip: !ownerId || !currentUserId || isOwner
    }
  );
  const [sendReq, { isLoading: isSending }] = useSendConnectionRequestMutation();

  const connStatus = isOwner ? "accepted" : (isRequestedLocally ? "pending" : (statusRes?.status || statusRes?.data?.status || "none"));
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
        setIsRequestedLocally(true);
        await sendReq({
          targetUserId: ownerId,
          targetName: ownerName || "Host",
          itemId: itemId || ownerId,
          itemTitle: ownerName || "Host Profile",
          itemType: "accommodations",
          requesterPhone: user?.phone || "",
          requesterEmail: user?.email || ""
        }).unwrap();
        toast.success(`Connection request sent to ${ownerName || "the host"}!`);
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
          className={`px-4 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-not-allowed select-none ${className}`}
        >
          <FaClock className="w-3.5 h-3.5 text-amber-600" />
          Pending Approval
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={isSending}
        onClick={handleConnectClick}
        className={`px-4 py-2 bg-[#CB2A26] hover:bg-[#a82220] text-white rounded-full text-xs font-bold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer ${className}`}
      >
        <FaUserPlus className="w-3.5 h-3.5" />
        {currentUserId ? "Connect with Host" : "Sign in to connect"}
      </button>
    );
  }

  const effectiveSocials = {
    whatsapp: (isOwner ? (user?.whatsapp || user?.Host?.whatsapp || user?.host?.whatsapp || user?.phone || user?.Host?.phone || user?.host?.phone) : null) || socials?.whatsapp || socials?.phone || "",
    email: (isOwner ? (user?.email || user?.Host?.email || user?.host?.email) : null) || socials?.email || "",
    instagram: (isOwner ? (user?.instagram || user?.Host?.instagram || user?.host?.instagram) : null) || socials?.instagram || "",
    facebook: (isOwner ? (user?.facebook || user?.Host?.facebook || user?.host?.facebook) : null) || socials?.facebook || ""
  };

  const activeSocials = [];

  if (effectiveSocials.whatsapp && validateSocial("whatsapp", effectiveSocials.whatsapp)) {
    activeSocials.push({
      platform: "whatsapp",
      value: effectiveSocials.whatsapp,
      icon: FaWhatsapp,
      bgColor: "bg-green-50 hover:bg-green-100",
      textColor: "text-green-600",
      title: "WhatsApp"
    });
  }

  if (effectiveSocials.email && validateSocial("email", effectiveSocials.email)) {
    activeSocials.push({
      platform: "email",
      value: effectiveSocials.email,
      icon: SiGmail,
      bgColor: "bg-red-50 hover:bg-red-100",
      textColor: "text-[#EA4335]",
      title: "Gmail"
    });
  }

  if (effectiveSocials.instagram && validateSocial("instagram", effectiveSocials.instagram)) {
    activeSocials.push({
      platform: "instagram",
      value: effectiveSocials.instagram,
      icon: FaInstagram,
      bgColor: "bg-pink-50 hover:bg-pink-100",
      textColor: "text-pink-600",
      title: "Instagram"
    });
  }

  if (effectiveSocials.facebook && validateSocial("facebook", effectiveSocials.facebook)) {
    activeSocials.push({
      platform: "facebook",
      value: effectiveSocials.facebook,
      icon: FaFacebookF,
      bgColor: "bg-blue-50 hover:bg-blue-100",
      textColor: "text-[#1877F2]",
      title: "Facebook"
    });
  }

  if (activeSocials.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {activeSocials.map((item) => {
        const Icon = item.icon;
        const handleSocialClick = () => {
          const url = getSocialUrl(item.platform, item.value);
          if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
          }
        };

        return (
          <button
            key={item.platform}
            type="button"
            onClick={handleSocialClick}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${item.bgColor} ${item.textColor}`}
            title={item.title}
          >
            {item.platform === "email" ? (
              <Icon className="w-4 h-4" />
            ) : (
              <Icon className="w-5 h-5" />
            )}
          </button>
        );
      })}
    </div>
  );
};
