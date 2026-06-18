/**
 * Validates whether a given social media input is valid for the specified platform.
 */
export const validateSocial = (platform, value) => {
  if (!value || typeof value !== "string" || !value.trim()) return false;
  const trimmed = value.trim();

  const validators = {
    whatsapp: (v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    },
    email: (v) => v.includes("@") && v.includes("."),
    gmail: (v) => v.includes("@") && v.includes("."),
    instagram: (v) => (v.startsWith("http") ? v.includes("instagram.com/") : /^[a-zA-Z0-9._]{1,30}$/.test(v.replace(/^@/, "")) || v.replace(/^@/, "").length > 0),
    facebook: (v) => (v.startsWith("http") ? v.includes("facebook.com/") : /^[a-zA-Z0-9.]{5,50}$/.test(v.replace(/^\//, "")) || v.replace(/^\//, "").length > 0),
    twitter: (v) => (v.startsWith("http") ? (v.includes("twitter.com/") || v.includes("x.com/")) : /^[a-zA-Z0-9_]{1,15}$/.test(v.replace(/^@/, "")) || v.replace(/^@/, "").length > 0),
    x: (v) => (v.startsWith("http") ? (v.includes("twitter.com/") || v.includes("x.com/")) : /^[a-zA-Z0-9_]{1,15}$/.test(v.replace(/^@/, "")) || v.replace(/^@/, "").length > 0),
  };

  return validators[platform] ? validators[platform](trimmed) : true;
};

/**
 * Standardizes a social media handle or detail into a clickable external link.
 */
export const getSocialUrl = (platform, value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  const config = {
    whatsapp: () => `https://wa.me/${trimmed.replace(/\D/g, "")}`,
    instagram: () => `https://instagram.com/${trimmed.replace(/^@/, "")}`,
    facebook: () => `https://facebook.com/${trimmed.replace(/^\//, "")}`,
    twitter: () => `https://twitter.com/${trimmed.replace(/^@/, "")}`,
    x: () => `https://twitter.com/${trimmed.replace(/^@/, "")}`,
    email: () => `mailto:${trimmed}`,
    gmail: () => `mailto:${trimmed}`,
    gmail_web: () => `https://mail.google.com/mail/?view=cm&fs=1&to=${trimmed}`,
  };

  return config[platform] ? config[platform]() : trimmed;
};

/**
 * Extracts a username from a full social URL or a handle.
 */
export const extractUsername = (platform, value) => {
  if (!value || typeof value !== "string") return "";
  let trimmed = value.trim().replace(/^@/, "").replace(/^\//, "");

  try {
    if (trimmed.includes(`${platform}.com`) || trimmed.startsWith("http")) {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length > 0) return parts[0];
    }
  } catch (e) {}

  const match = trimmed.match(new RegExp(`(?:${platform}\\.com)\\/([^/?#]+)`, "i"));
  return match ? match[1] : trimmed;
};
