/**
 * ────────────────────────────────────────────────────────────
 *  AVATAR UTILITIES
 * ────────────────────────────────────────────────────────────
 *  Generates colored circle avatars with initials extracted from names.
 *  Used in DataTable name columns and detail page headers.
 * ────────────────────────────────────────────────────────────
 */

// Pastel color palette (matches competitor screenshots)
const AVATAR_COLORS = [
  { bg: "#FFE8E8", text: "#C85A54" }, // soft red
  { bg: "#FFE8D6", text: "#CC7A3D" }, // peach
  { bg: "#FFF4CC", text: "#B8941F" }, // amber
  { bg: "#E8F5E9", text: "#4A7C59" }, // sage
  { bg: "#E3F2FD", text: "#2E5C8A" }, // sky blue
  { bg: "#F3E5F5", text: "#7B4D9E" }, // lavender
  { bg: "#FFF3E0", text: "#C17D11" }, // orange
  { bg: "#E0F2F1", text: "#00695C" }, // teal
];

/**
 * Extract initials from a name string
 * @param {string} name - Full name or partial name
 * @returns {string} - Up to 2 uppercase initials
 */
export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  
  const trimmed = name.trim();
  if (!trimmed) return "?";
  
  const words = trimmed.split(/\s+/).filter(Boolean);
  
  if (words.length === 0) return trimmed[0]?.toUpperCase() || "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  
  // First letter of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
};

/**
 * Get a consistent color for a given name (deterministic hash)
 * @param {string} name - Name to hash
 * @returns {object} - { bg, text } color pair
 */
export const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  
  // Simple string hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

/**
 * Generate avatar props for inline use
 * @param {string} name - Name to display
 * @returns {object} - { initials, bgColor, textColor }
 */
export const getAvatarProps = (name) => {
  const initials = getInitials(name);
  const colors = getAvatarColor(name);
  return {
    initials,
    bgColor: colors.bg,
    textColor: colors.text,
  };
};