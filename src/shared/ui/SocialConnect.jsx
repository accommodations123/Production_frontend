import { SiGmail } from "react-icons/si";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { validateSocial, getSocialUrl } from "@/shared/utils/socialUtils";

/**
 * Renders quick-connect social circle buttons for card footers (PropertyCard / ProductCard).
 */
export const SocialQuickConnect = ({ socials, className = "" }) => {
  if (!socials) return null;

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

  if (socials.whatsapp && validateSocial("whatsapp", socials.whatsapp)) {
    activeSocials.push({
      platform: "whatsapp",
      value: socials.whatsapp,
      icon: FaWhatsapp,
      bgColor: "bg-[#25D366] text-white hover:bg-[#20ba5a] hover:scale-110",
      title: "WhatsApp"
    });
  }

  if (socials.email && validateSocial("email", socials.email)) {
    activeSocials.push({
      platform: "email",
      value: socials.email,
      icon: SiGmail,
      bgColor: "bg-[#EA4335] text-white hover:bg-[#d3362a] hover:scale-110",
      title: "Gmail"
    });
  }

  if (socials.instagram && validateSocial("instagram", socials.instagram)) {
    activeSocials.push({
      platform: "instagram",
      value: socials.instagram,
      icon: FaInstagram,
      bgColor: "bg-[#E4405F] text-white hover:bg-[#d03552] hover:scale-110",
      title: "Instagram"
    });
  }

  if (socials.facebook && validateSocial("facebook", socials.facebook)) {
    activeSocials.push({
      platform: "facebook",
      value: socials.facebook,
      icon: FaFacebookF,
      bgColor: "bg-[#1877F2] text-white hover:bg-[#1464cd] hover:scale-110",
      title: "Facebook"
    });
  }

  if (socials.twitter && validateSocial("twitter", socials.twitter)) {
    activeSocials.push({
      platform: "twitter",
      value: socials.twitter,
      icon: FaXTwitter,
      bgColor: "bg-black text-white hover:bg-gray-900 hover:scale-110",
      title: "X (Twitter)"
    });
  }

  if (activeSocials.length === 0) return null;

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
export const SellerContactButtons = ({ phone, email, instagram, facebook }) => {
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
export const HostDetailSocials = ({ socials, className = "" }) => {
  if (!socials) return null;

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
