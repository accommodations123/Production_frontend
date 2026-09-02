import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SiGmail } from "react-icons/si";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaXTwitter, FaUserPlus, FaClock } from "react-icons/fa6";
import { validateSocial, getSocialUrl } from "@/lib/socialUtils";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  useGetConnectionStatusQuery,
  useSendConnectionRequestMutation
} from "@/hooks/data/useConnectionHooks";
import { toast } from "sonner";

/**
 * Renders quick-connect social circle buttons for card footers (PropertyCard / ProductCard).
 */
export const SocialQuickConnect = ({ 
  socials, 
  className = "", 
  ownerId = null, 
  ownerName = "",
  itemId = "",
  itemTitle = "",
  itemType = "accommodations"
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id || user?._id;
  const cleanStr = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  let localUser = null;
  try {
    const raw = localStorage.getItem("user") || localStorage.getItem("authUser");
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

  const isOwner = Boolean(
    ownerId && userIds.length > 0 && userIds.some(uid => uid === String(ownerId))
  );

  const [isRequestedLocally, setIsRequestedLocally] = useState(false);

  const isPersistedLocally = useMemo(() => {
    try {
      const raw = localStorage.getItem("nxt_outgoing_requests");
      if (!raw) return false;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return false;
      return list.some(r => 
        String(r.targetUserId) === String(ownerId) && 
        (!itemId || !r.itemId || String(r.itemId) === String(itemId))
      );
    } catch {
      return false;
    }
  }, [ownerId, itemId]);

  const { data: statusRes } = useGetConnectionStatusQuery(
    itemId ? { targetUserId: ownerId, itemId, itemType } : ownerId,
    {
      skip: !ownerId || !currentUserId || isOwner,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true
    }
  );
  const [sendReq, { isLoading: isSending }] = useSendConnectionRequestMutation();

  const serverStatus = statusRes?.status || statusRes?.data?.status || (statusRes?.data?.isConnected ? "accepted" : null);
  const connStatus = isOwner ? "accepted" : (serverStatus && serverStatus !== "none" ? serverStatus : (isRequestedLocally || isPersistedLocally ? "pending" : "none"));
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
        const reqName = user?.name || user?.full_name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') || localUser?.name || localUser?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '';
        const reqAvatar = user?.avatar || user?.avatar_url || user?.profile_image || localUser?.avatar || localUser?.profile_image || user?.user_metadata?.avatar_url || '';
        await sendReq({
          targetUserId: ownerId,
          targetName: ownerName || "Owner",
          itemId,
          itemTitle: itemTitle || "Listing",
          itemType,
          requesterName: reqName,
          requesterAvatar: reqAvatar,
          requesterPhone: user?.phone || localUser?.phone || "",
          requesterEmail: user?.email || localUser?.email || ""
        }).unwrap();
        try {
          const raw = localStorage.getItem("nxt_outgoing_requests");
          const list = raw ? JSON.parse(raw) : [];
          list.push({ targetUserId: String(ownerId), itemId: String(itemId || ''), itemType, status: 'pending', timestamp: Date.now() });
          localStorage.setItem("nxt_outgoing_requests", JSON.stringify(list));
        } catch {}
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
            onClick={(e) => handleSocialClick(e, item.platform, item.value)}
            className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${item.bgColor}`}
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
  ownerId = null,
  ownerName = "",
  itemId = "",
  itemTitle = "",
  itemType = "accommodations"
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id;
  const [isRequestedLocally, setIsRequestedLocally] = useState(false);

  const isOwner = Boolean(ownerId && currentUserId && String(ownerId) === String(currentUserId));

  const { data: statusRes } = useGetConnectionStatusQuery(
    itemId ? { targetUserId: ownerId, itemId } : ownerId,
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
        const reqName = user?.name || user?.full_name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') || localUser?.name || localUser?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '';
        const reqAvatar = user?.avatar || user?.avatar_url || user?.profile_image || localUser?.avatar || localUser?.profile_image || user?.user_metadata?.avatar_url || '';
        await sendReq({
          targetUserId: ownerId,
          targetName: ownerName || "Seller",
          itemId,
          itemTitle: itemTitle || "Listing",
          itemType,
          requesterName: reqName,
          requesterAvatar: reqAvatar,
          requesterPhone: user?.phone || localUser?.phone || "",
          requesterEmail: user?.email || localUser?.email || ""
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

  if (phone && validateSocial("whatsapp", phone)) {
    activeButtons.push({
      platform: "call",
      value: phone,
      label: "Call",
      onClick: () => window.open(`tel:${phone.trim()}`),
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

  if (email && validateSocial("email", email)) {
    activeButtons.push({
      platform: "email",
      value: email,
      label: "Gmail",
      onClick: () => window.open(getSocialUrl("email", email), "_blank", "noopener,noreferrer"),
      bgClass: "hover:bg-red-500/10",
      textClass: "text-gray-200 hover:text-red-400",
      borderClass: "border-white/10 hover:border-red-500/20",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      )
    });
  }

  if (instagram && validateSocial("instagram", instagram)) {
    activeButtons.push({
      platform: "instagram",
      value: instagram,
      label: "Instagram",
      onClick: () => window.open(getSocialUrl("instagram", instagram), "_blank", "noopener,noreferrer"),
      bgClass: "hover:bg-pink-500/10",
      textClass: "text-gray-200 hover:text-pink-400",
      borderClass: "border-white/10 hover:border-pink-500/20",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      )
    });
  }

  if (facebook && validateSocial("facebook", facebook)) {
    activeButtons.push({
      platform: "facebook",
      value: facebook,
      label: "Facebook",
      onClick: () => window.open(getSocialUrl("facebook", facebook), "_blank", "noopener,noreferrer"),
      bgClass: "hover:bg-blue-500/10",
      textClass: "text-gray-200 hover:text-blue-400",
      borderClass: "border-white/10 hover:border-blue-500/20",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
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
          className={`flex-1 min-w-[80px] h-10 bg-white/5 ${btn.bgClass} ${btn.textClass} rounded-xl font-semibold flex items-center justify-center gap-1.5 border ${btn.borderClass} hover:scale-[1.02] active:scale-95 transition-all text-xs`}
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
export const HostDetailSocials = ({ socials, className = "", ownerId = null, ownerName = "", itemId = "" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id;
  const [isRequestedLocally, setIsRequestedLocally] = useState(false);

  const isOwner = Boolean(ownerId && currentUserId && String(ownerId) === String(currentUserId));

  const { data: statusRes } = useGetConnectionStatusQuery(
    itemId ? { targetUserId: ownerId, itemId } : ownerId,
    {
      skip: !ownerId || !currentUserId || isOwner
    }
  );
  const [sendReq, { isLoading: isSending }] = useSendConnectionRequestMutation();

  const connStatus = isOwner ? "accepted" : (isRequestedLocally ? "pending" : (statusRes?.status || "none"));
  const isConnected = isOwner || connStatus === "accepted";

  if (!socials) return null;

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
        const reqName = user?.name || user?.full_name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') || localUser?.name || localUser?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '';
        const reqAvatar = user?.avatar || user?.avatar_url || user?.profile_image || localUser?.avatar || localUser?.profile_image || user?.user_metadata?.avatar_url || '';
        await sendReq({
          targetUserId: ownerId,
          targetName: ownerName || "Host",
          itemId: itemId || ownerId,
          itemTitle: ownerName || "Host Profile",
          itemType: "accommodations",
          requesterName: reqName,
          requesterAvatar: reqAvatar,
          requesterPhone: user?.phone || localUser?.phone || "",
          requesterEmail: user?.email || localUser?.email || ""
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
          <FaClock className="w-3.5 h-3.5" />
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

  const activeSocials = [];

  if (socials.whatsapp && validateSocial("whatsapp", socials.whatsapp)) {
    activeSocials.push({
      platform: "whatsapp",
      value: socials.whatsapp,
      icon: FaWhatsapp,
      bgColor: "bg-green-50 hover:bg-green-100",
      textColor: "text-green-600",
      title: "WhatsApp"
    });
  }

  if (socials.email && validateSocial("email", socials.email)) {
    activeSocials.push({
      platform: "email",
      value: socials.email,
      icon: SiGmail,
      bgColor: "bg-red-50 hover:bg-red-100",
      textColor: "text-[#EA4335]",
      title: "Gmail"
    });
  }

  if (socials.instagram && validateSocial("instagram", socials.instagram)) {
    activeSocials.push({
      platform: "instagram",
      value: socials.instagram,
      icon: FaInstagram,
      bgColor: "bg-pink-50 hover:bg-pink-100",
      textColor: "text-pink-600",
      title: "Instagram"
    });
  }

  if (socials.facebook && validateSocial("facebook", socials.facebook)) {
    activeSocials.push({
      platform: "facebook",
      value: socials.facebook,
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
            onClick={handleSocialClick}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${item.bgColor} ${item.textColor}`}
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

