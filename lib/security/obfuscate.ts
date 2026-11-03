/**
 * Utility for obfuscating sensitive contact details (such as emails)
 * before rendering in server-generated HTML.
 *
 * This prevents automated scrapers and spambots from harvesting email
 * addresses via "View Source" or simple HTTP crawlers.
 */

export function obfuscateEmail(email: string): string {
  if (!email) return "";
  if (typeof Buffer !== "undefined") {
    return Buffer.from(email, "utf-8").toString("base64");
  }
  if (typeof btoa !== "undefined") {
    return btoa(email);
  }
  return email;
}

export function deobfuscateEmail(encoded: string): string {
  if (!encoded) return "";
  try {
    if (typeof atob !== "undefined") {
      return atob(encoded);
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(encoded, "base64").toString("utf-8");
    }
  } catch {
    // If decoding fails, return empty string
    return "";
  }
  return "";
}

