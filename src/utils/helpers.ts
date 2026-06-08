/**
 * Shared, dependency-free utility functions. Drop small pure helpers here.
 * Keep DOM / React / Node-specific logic out — those belong with their feature.
 */

/**
 * Join class names, dropping falsy ones so conditionals read cleanly:
 *   clsx(s.glow, s.glowTL)
 *   clsx(s.card, isActive && s.active)
 */
export const clsx = (
  ...classes: Array<string | false | null | undefined>
): string => classes.filter(Boolean).join(" ");
