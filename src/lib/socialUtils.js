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
      // Standard email regex - lenient
      return trimmed.includes("@") && trimmed.includes(".");
    }

    case "instagram": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed.includes("instagram.com/");
      }
      const cleanInsta = trimmed.replace(/^@/, "");
      const instaRegex = /^[a-zA-Z0-9._]{1,30}$/;
      return instaRegex.test(cleanInsta) || cleanInsta.length > 0;
    }

    case "facebook": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed.includes("facebook.com/");
      }
      const cleanFb = trimmed.replace(/^\//, "");
      const fbRegex = /^[a-zA-Z0-9.]{5,50}$/;
      return fbRegex.test(cleanFb) || cleanFb.length > 0;
    }

    case "twitter":
    case "x": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed.includes("twitter.com/") || trimmed.includes("x.com/");
      }
      const cleanTwitter = trimmed.replace(/^@/, "");
      const twitterRegex = /^[a-zA-Z0-9_]{1,15}$/;
      return twitterRegex.test(cleanTwitter) || cleanTwitter.length > 0;
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
      if (trimmed.toLowerCase().includes("instagram.com")) {
        return trimmed.startsWith("www.") ? `https://${trimmed}` : `https://www.${trimmed}`;
      }
      const handle = trimmed.replace(/^@/, "");
      return `https://instagram.com/${handle}`;
    }

    case "facebook": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      if (trimmed.toLowerCase().includes("facebook.com")) {
        return trimmed.startsWith("www.") ? `https://${trimmed}` : `https://www.${trimmed}`;
      }
      const page = trimmed.replace(/^\//, "");
      return `https://facebook.com/${page}`;
    }

    case "twitter":
    case "x": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      if (trimmed.toLowerCase().includes("twitter.com") || trimmed.toLowerCase().includes("x.com")) {
        return trimmed.startsWith("www.") ? `https://${trimmed}` : `https://www.${trimmed}`;
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

/**
 * Extracts a username from a full social URL or a handle.
 * 
 * @param {string} platform - The platform name ('facebook' or 'instagram')
 * @param {string} value - The input value
 * @returns {string} The extracted username
 */
export const extractUsername = (platform, value) => {
  if (!value || typeof value !== "string") return "";
  let trimmed = value.trim();
  if (!trimmed) return "";
  
  // Strip common URL schemes and prefixes
  trimmed = trimmed.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/^@+/, "").replace(/^\/+/, "");

  try {
    if (trimmed.includes("/") || trimmed.includes("?") || trimmed.includes("#")) {
      const urlStr = "https://" + trimmed;
      const url = new URL(urlStr);
      const pathSegments = url.pathname.split("/").filter(Boolean);
      if (pathSegments.length > 0) {
        let candidate = pathSegments[pathSegments.length - 1];
        if (candidate === "profile.php" && url.searchParams.get("id")) {
          return url.searchParams.get("id");
        }
        return candidate.replace(/^@+/, "");
      }
    }
  } catch (e) {
    // Fall through to regex
  }

  // Regex fallback
  const regex = new RegExp(`(?:${platform}\\.com\\/)?([^/?#]+)`, "i");
  const match = trimmed.match(regex);
  if (match && match[1]) {
    return match[1].replace(/^@+/, "");
  }

  return trimmed;
};
