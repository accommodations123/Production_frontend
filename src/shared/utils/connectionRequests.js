/**
 * Connection Requests Manager
 * Stores and manages P2P connection requests between users/hosts across sessions.
 */

const STORAGE_KEY = "nxt_connection_requests_v1";

export function getStoredRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredRequests(requests) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    window.dispatchEvent(new Event("connection_requests_updated"));
  } catch (e) {
    console.error("Failed to save connection requests", e);
  }
}

export function sendConnectionRequest({ targetUserId, targetName, requesterId, requesterName, requesterEmail, requesterPhone, itemId, itemTitle, itemType }) {
  const requests = getStoredRequests();
  
  // Check if request already exists for this target user and specific item
  const existingIndex = requests.findIndex(
    (r) => String(r.targetUserId) === String(targetUserId) &&
           String(r.requesterId) === String(requesterId) &&
           (itemId ? String(r.itemId) === String(itemId) : true)
  );

  if (existingIndex >= 0) {
    return requests[existingIndex];
  }

  const newRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    targetUserId: String(targetUserId),
    targetName: targetName || "Advisor / Host",
    requesterId: String(requesterId),
    requesterName: requesterName || "User",
    requesterEmail: requesterEmail || "",
    requesterPhone: requesterPhone || "",
    itemId: itemId ? String(itemId) : "",
    itemTitle: itemTitle || "Professional Profile",
    itemType: itemType || "people",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  requests.unshift(newRequest);
  saveStoredRequests(requests);
  return newRequest;
}

export function getConnectionStatus(targetUserId, requesterId, itemId) {
  if (!targetUserId || !requesterId) return "none";
  if (String(targetUserId) === String(requesterId)) return "self";

  const requests = getStoredRequests();
  const found = requests.find(
    (r) => String(r.targetUserId) === String(targetUserId) &&
           String(r.requesterId) === String(requesterId) &&
           (itemId ? String(r.itemId) === String(itemId) : true)
  );

  return found ? found.status : "none";
}

export function getIncomingRequests(targetUserId) {
  if (!targetUserId) return [];
  const requests = getStoredRequests();
  return requests.filter((r) => String(r.targetUserId) === String(targetUserId));
}

export function updateRequestStatus(requestId, newStatus) {
  const requests = getStoredRequests();
  const updated = requests.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r));
  saveStoredRequests(updated);
}
