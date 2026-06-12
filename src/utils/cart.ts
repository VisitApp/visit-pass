export const TOKEN_KEY = "opd_auth_token";
export const COVER_VARIANT_KEY = "opd_cover_variant_id";
export const USER_KEY = "opd_user_info";
/** dependents carried from order-confirmed → member-details */
export const MEMBERS_KEY = "opd_members";

/** userId saved at login, used by coupon/user-scoped calls */
export function getUserId(): number | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw).userId ?? null;
  } catch {
    return null;
  }
}

/** relation ids expected by the dependent/pricing APIs */
export const RELATION_ID = {
  father: 1,
  mother: 2,
  son: 3,
  daughter: 4,
  wife: 5,
  husband: 6,
  friend: 7,
  fatherInLaw: 8,
  motherInLaw: 9,
} as const;

/** add-dependents member keys → relation id (Spouse maps to Wife by default) */
export const MEMBER_RELATION_ID: Record<string, number> = {
  spouse: RELATION_ID.wife,
  father: RELATION_ID.father,
  mother: RELATION_ID.mother,
  son: RELATION_ID.son,
  daughter: RELATION_ID.daughter,
  fatherInLaw: RELATION_ID.fatherInLaw,
  motherInLaw: RELATION_ID.motherInLaw,
};

/** relation id → add-dependents member key (Wife & Husband both map to spouse) */
export const RELATION_ID_TO_KEY: Record<number, string> = {
  1: "father",
  2: "mother",
  3: "son",
  4: "daughter",
  5: "spouse",
  6: "spouse",
  8: "fatherInLaw",
  9: "motherInLaw",
};

/** member key → display label + avatar */
export const RELATION_META: Record<string, { label: string; img: string }> = {
  self: { label: "Self", img: "/relations/Self.png" },
  spouse: { label: "Spouse", img: "/relations/Spouse.png" },
  father: { label: "Father", img: "/relations/Father.png" },
  mother: { label: "Mother", img: "/relations/Mother.png" },
  motherInLaw: { label: "Mother-in law", img: "/relations/Mother.png" },
  fatherInLaw: { label: "Father-in law", img: "/relations/Father.png" },
  son: { label: "Son", img: "/relations/Son.png" },
  daughter: { label: "Daughter", img: "/relations/Daughter.png" },
};

/** member key for a selectedMember row (self row has relationId null) */
export function keyForMember(relationId: number | null): string {
  return relationId == null ? "self" : (RELATION_ID_TO_KEY[relationId] ?? "");
}
