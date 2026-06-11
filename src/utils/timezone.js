export const utcToLocal = (date, time) => {
  if (!date) return "N/A";
  const utcDate = time ? new Date(`${date}T${time}:00Z`) : new Date(date);
  return isNaN(utcDate.getTime()) ? "N/A" : utcDate.toLocaleString();
};

export const formatUTCDate = (date, time) => {
  if (!date) return "N/A";
  const utcDate = time ? new Date(`${date}T${time}:00Z`) : new Date(date);
  return isNaN(utcDate.getTime()) ? "N/A" : utcDate.toLocaleDateString();
};

export const formatUTCTime = (date, time) => {
  if (!date) return "N/A";
  const utcDate = time ? new Date(`${date}T${time}:00Z`) : new Date(date);
  return isNaN(utcDate.getTime()) ? "N/A" : utcDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const isExpiredUTC = (date, time = "23:59:59") => {
  if (!date) return true;
  const utcDate = new Date(`${date}T${time}:00Z`);
  return utcDate.getTime() < Date.now();
};
