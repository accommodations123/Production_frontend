export const utcToLocal = (date, time) => {
  if (!date) return "N/A";
  const cleanDate = date.includes('T') ? date.split('T')[0] : date;
  const utcDate = time ? new Date(`${cleanDate}T${time}:00Z`) : new Date(date);
  return isNaN(utcDate.getTime()) ? "N/A" : utcDate.toLocaleString();
};

export const formatUTCDate = (date, time) => {
  if (!date) return "N/A";
  const cleanDate = date.includes('T') ? date.split('T')[0] : date;
  const utcDate = time ? new Date(`${cleanDate}T${time}:00Z`) : new Date(date);
  return isNaN(utcDate.getTime()) ? "N/A" : utcDate.toLocaleDateString();
};

export const formatUTCTime = (date, time) => {
  if (!date) return "N/A";
  const cleanDate = date.includes('T') ? date.split('T')[0] : date;
  const utcDate = time ? new Date(`${cleanDate}T${time}:00Z`) : new Date(date);
  return isNaN(utcDate.getTime()) ? "N/A" : utcDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const isExpiredUTC = (date, time = "23:59:59") => {
  if (!date) return true;
  const cleanDate = date.includes('T') ? date.split('T')[0] : date;
  const utcDate = new Date(`${cleanDate}T${time}:00Z`);
  return utcDate.getTime() < Date.now();
};

