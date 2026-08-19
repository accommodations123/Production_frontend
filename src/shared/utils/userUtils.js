/**
 * Utility for canonical user identity extraction and self-ownership checks.
 */

export function getCanonicalUserId(user) {
  if (!user) return "";
  if (typeof user === "string" || typeof user === "number") {
    return String(user);
  }
  return String(
    user.user_id ||
    user.userId ||
    user.user?.id ||
    user.user?._id ||
    user.user?.user_id ||
    user.id ||
    user._id ||
    ""
  );
}

export function isSelfUser(userA, userB) {
  if (!userA || !userB) return false;

  const idA = getCanonicalUserId(userA);
  const idB = getCanonicalUserId(userB);

  if (idA && idB && idA === idB) return true;

  const getCandidates = (u) => {
    if (typeof u === "string" || typeof u === "number") return [String(u)];
    return [
      u.id,
      u.user_id,
      u._id,
      u.userId,
      u.user?.id,
      u.user?._id,
      u.user?.user_id
    ].filter(Boolean).map(String);
  };

  const keysA = getCandidates(userA);
  const keysB = getCandidates(userB);

  if (keysA.some((a) => keysB.includes(a))) return true;

  const emailA = String(userA.email || userA.user?.email || "").trim().toLowerCase();
  const emailB = String(userB.email || userB.user?.email || "").trim().toLowerCase();
  if (emailA && emailB && emailA === emailB) return true;

  return false;
}
