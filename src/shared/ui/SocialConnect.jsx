import { SiGmail } from 'react-icons/si';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaXTwitter, FaLinkedinIn } from 'react-icons/fa6';
import { validateSocial, getSocialUrl } from '@/shared/utils/socialUtils';

/**
 * Quick-connect social buttons for card footers (PropertyCard / ProductCard / PeopleCard).
 */
export function SocialQuickConnect({ socials, className = '' }) {
  if (!socials) return null;

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

  if (socials.whatsapp && validateSocial('whatsapp', socials.whatsapp)) {
    activeSocials.push({
      platform: 'whatsapp',
      value: socials.whatsapp,
      icon: FaWhatsapp,
      bgColor: 'bg-[#25D366] text-white hover:bg-[#20BD5A] hover:scale-105',
      title: 'WhatsApp'
    });
  }

  if (socials.email && validateSocial('email', socials.email)) {
    activeSocials.push({
      platform: 'email',
      value: socials.email,
      icon: SiGmail,
      bgColor: 'bg-[#CB2A26] text-white hover:bg-[#A9221F] hover:scale-105',
      title: 'Email'
    });
  }

  if (socials.instagram && validateSocial('instagram', socials.instagram)) {
    activeSocials.push({
      platform: 'instagram',
      value: socials.instagram,
      icon: FaInstagram,
      bgColor: 'bg-[#E4405F] text-white hover:bg-[#D03552] hover:scale-105',
      title: 'Instagram'
    });
  }

  if (socials.facebook && validateSocial('facebook', socials.facebook)) {
    activeSocials.push({
      platform: 'facebook',
      value: socials.facebook,
      icon: FaFacebookF,
      bgColor: 'bg-[#1877F2] text-white hover:bg-[#166FE5] hover:scale-105',
      title: 'Facebook'
    });
  }

  if (socials.linkedin && validateSocial('linkedin', socials.linkedin)) {
    activeSocials.push({
      platform: 'linkedin',
      value: socials.linkedin,
      icon: FaLinkedinIn,
      bgColor: 'bg-[#0A66C2] text-white hover:bg-[#08529C] hover:scale-105',
      title: 'LinkedIn'
    });
  }

  if (socials.twitter && validateSocial('twitter', socials.twitter)) {
    activeSocials.push({
      platform: 'twitter',
      value: socials.twitter,
      icon: FaXTwitter,
      bgColor: 'bg-black text-white hover:bg-slate-800 hover:scale-105',
      title: 'X / Twitter'
    });
  }

  if (activeSocials.length === 0) return null;

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
export function SellerContactButtons({ phone, email, instagram, linkedin }) {
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

