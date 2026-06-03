/**
 * Validates whether a given social media input is valid for the specified platform.
 * 
 * @param {string} platform - The platform name (e.g., 'whatsapp', 'email', 'instagram', 'facebook', 'twitter')
 * @param {string} value - The input value to validate
 * @returns {boolean} True if the input is valid, false otherwise
 */
export const validateSocial = (platform, value) => {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  switch (platform) {
    case "whatsapp": {
      const digits = trimmed.replace(/\D/g, "");
      // E.164 standard states phone numbers can be up to 15 digits, min is usually 7 digits
      return digits.length >= 7 && digits.length <= 15;
    }

    case "email":
    case "gmail": {
      // Standard email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(trimmed);
    }

    case "instagram": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed.includes("instagram.com/");
      }
      // Instagram usernames: alphanumeric, periods, underscores, max 30 chars
      const cleanInsta = trimmed.replace(/^@/, "");
      const instaRegex = /^[a-zA-Z0-9._]{1,30}$/;
      return instaRegex.test(cleanInsta);
    }

    case "facebook": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed.includes("facebook.com/");
      }
      // Facebook usernames: alphanumeric, periods, min 5, max 50 chars
      const cleanFb = trimmed.replace(/^\//, "");
      const fbRegex = /^[a-zA-Z0-9.]{5,50}$/;
      return fbRegex.test(cleanFb);
    }

    case "twitter":
    case "x": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed.includes("twitter.com/") || trimmed.includes("x.com/");
      }
      // X/Twitter usernames: alphanumeric, underscores, max 15 chars
      const cleanTwitter = trimmed.replace(/^@/, "");
      const twitterRegex = /^[a-zA-Z0-9_]{1,15}$/;
      return twitterRegex.test(cleanTwitter);
    }

    default:
      return true;
  }
};

/**
 * Standardizes a social media handle or detail into a clickable external link.
 * 
 * @param {string} platform - The platform name
 * @param {string} value - The input value (e.g., username, phone number, email)
 * @returns {string} The formatted URL or an empty string if invalid
 */
export const getSocialUrl = (platform, value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();

  switch (platform) {
    case "whatsapp": {
      const phone = trimmed.replace(/\D/g, "");
      return phone ? `https://wa.me/${phone}` : "";
    }

    case "instagram": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      const handle = trimmed.replace(/^@/, "");
      return `https://instagram.com/${handle}`;
    }

    case "facebook": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      const page = trimmed.replace(/^\//, "");
      return `https://facebook.com/${page}`;
    }

    case "twitter":
    case "x": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      const handle = trimmed.replace(/^@/, "");
      return `https://twitter.com/${handle}`;
    }

    case "email":
    case "gmail": {
      return `mailto:${trimmed}`;
    }

    case "gmail_web": {
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${trimmed}`;
    }

    default:
      return trimmed;
  }
};
