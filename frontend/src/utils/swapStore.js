/* ── swapStore.js  – simple localStorage helper ─────────────── */
const KEY = "swapRequests";

/**
 * Request shape
 * {
 *   id,               // timestamp
 *   senderId,         // who sends
 *   recipientId,      // who receives
 *   recipientName,
 *   recipientAvatar,
 *   rating,
 *   giveSkill,        // skill sender offers
 *   takeSkill,        // skill sender wants
 *   status            // "Pending" | "Accepted" | "Rejected" | "Cancelled"
 * }
 */

export function getRequests() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function addRequest(req) {
  const current = getRequests();

  /* Avoid duplicate “Pending” request between the same two users */
  const duplicate = current.find(
    (r) =>
      r.senderId === req.senderId &&
      r.recipientId === req.recipientId &&
      (r.status === "Pending" || r.status === "Accepted")
  );
  if (duplicate) return;

  localStorage.setItem(KEY, JSON.stringify([...current, req]));
}

export function updateStatus(id, status) {
  const updated = getRequests().map((r) =>
    r.id === id ? { ...r, status } : r
  );
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function removeRequest(id) {
  const filtered = getRequests().filter((r) => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(filtered));
}
