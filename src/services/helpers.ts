import axios from "axios";
import type { Pricing, SelectedMember } from "./types";

export function authConfig(token: string) {
  const value = token.startsWith("JWT ") ? token : `JWT ${token}`;
  return { headers: { Authorization: value } };
}

export function parseError(
  e: unknown,
  fallback: string,
): { unauthorized?: boolean; error: string } {
  if (axios.isAxiosError(e)) {
    if (e.response?.status === 401)
      return { unauthorized: true, error: "Unauthorized" };
    const data = e.response?.data as { errorMessage?: string } | undefined;
    return { error: data?.errorMessage || fallback };
  }
  return { error: fallback };
}

export const toPricing = (data: {
  selectedMembers?: SelectedMember[];
  cost?: number;
  discount?: number;
  finalCost?: number;
}): Pricing => ({
  selectedMembers: data.selectedMembers ?? [],
  cost: data.cost ?? 0,
  discount: data.discount ?? 0,
  finalCost: data.finalCost ?? 0,
});
