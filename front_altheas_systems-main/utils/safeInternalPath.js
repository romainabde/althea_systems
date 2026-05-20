/**
 * Valide `?next=` pour une redirection interne après login (évite open redirect).
 * Accepte uniquement un chemin relatif same-origin commençant par `/`.
 *
 * @param {string | null | undefined} nextParam
 * @returns {string} chemin commençant par `/` (défaut `/`)
 */
export function getSafeInternalPath(nextParam) {
  if (nextParam == null || typeof nextParam !== "string") return "/";

  let decoded;
  try {
    decoded = decodeURIComponent(nextParam.trim());
  } catch {
    return "/";
  }

  if (!decoded.startsWith("/")) return "/";
  if (decoded.startsWith("//")) return "/";

  const lower = decoded.toLowerCase();
  if (lower.includes("javascript:") || lower.includes("\\")) return "/";

  return decoded;
}
