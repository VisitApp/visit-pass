import axios from "axios";
import { getUserId, TOKEN_KEY } from "@/utils/cart";
import { authConfig, parseError, toPricing } from "./helpers";
import type {
  CartSummary,
  DependentDetail,
  Plan,
  Pricing,
  UserInfo,
} from "./types";

export type {
  ApiResult,
  CartPlan,
  CartSummary,
  Coupon,
  DependentDetail,
  Pricing,
  Plan,
  SelectedMember,
  UserInfo,
} from "./types";

export const API_BASE =
  "https://enrolment-portal.getvisitapp.net/optin/opt-in/visitapp";

const api = axios.create({ baseURL: API_BASE });

export async function identifyUser(params: {
  phone: string;
  corporateId: number;
  corporateName: string;
  employeeId?: string;
  email?: string | null;
}): Promise<{ ok: boolean; error?: string; userInfo?: UserInfo }> {
  try {
    const { data } = await api.post("/identify-user", params);
    if (!data.userInfo) {
      return {
        ok: false,
        error: data.errorMessage || data.message || "Something went wrong",
      };
    }
    return { ok: true, userInfo: data.userInfo };
  } catch (e) {
    return { ok: false, error: parseError(e, "Something went wrong").error };
  }
}

export async function verifyOtp(params: {
  userId: number;
  otp: string;
  phone: string;
}): Promise<{
  ok: boolean;
  error?: string;
  token?: string;
  userInfo?: UserInfo;
}> {
  try {
    const res = await api.post("/verify-otp", params);
    const data = res.data;
    const token =
      data.authToken || (res.headers["authorization"] as string) || "";
    if (!token) {
      return {
        ok: false,
        error: data.errorMessage || data.message || "Invalid OTP",
      };
    }
    return { ok: true, token, userInfo: data.userInfo };
  } catch (e) {
    return { ok: false, error: parseError(e, "Invalid OTP").error };
  }
}

export async function getAvailableTopups(): Promise<{
  ok: boolean;
  unauthorized?: boolean;
  error?: string;
  plans?: Plan[];
  selectedCoverVariantId?: number | null;
}> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return { ok: false, unauthorized: true };
  try {
    const { data } = await api.post("/available-topups", {}, authConfig(token));
    if (data.message === "success") {
      return {
        ok: true,
        plans: data.result ?? [],
        selectedCoverVariantId: data.coverVariantId ?? null,
      };
    }
    return { ok: false, error: data.errorMessage || "Couldn't load plans" };
  } catch (e) {
    return { ok: false, ...parseError(e, "Something went wrong") };
  }
}

export async function addToCart(
  coverVariantId: number,
): Promise<{ ok: boolean; unauthorized?: boolean; error?: string }> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return { ok: false, unauthorized: true };
  try {
    const { data } = await api.post(
      "/add-to-cart",
      { coverVariantId },
      authConfig(token),
    );
    if (data.message === "success") return { ok: true };
    return { ok: false, error: data.errorMessage || "Couldn't add to cart" };
  } catch (e) {
    return { ok: false, ...parseError(e, "Something went wrong") };
  }
}

type PricingResult = {
  ok: boolean;
  unauthorized?: boolean;
  error?: string;
  data?: Pricing;
};

// All three pricing actions hit /add-dependent-pricing:
//  - summary: { coverVariantId }
//  - add:     { coverVariantId, relationId, name?, dob? }
//  - remove:  { coverVariantId, action: "remove", dependentId }
async function dependentPricing(
  body: Record<string, unknown>,
  failMessage: string,
): Promise<PricingResult> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return { ok: false, unauthorized: true };
  try {
    const { data } = await api.post(
      "/add-dependent-pricing",
      body,
      authConfig(token),
    );
    if (data.message === "success") return { ok: true, data: toPricing(data) };
    return { ok: false, error: data.errorMessage || failMessage };
  } catch (e) {
    return { ok: false, ...parseError(e, "Something went wrong") };
  }
}

export function getCartPricing(coverVariantId: number): Promise<PricingResult> {
  return dependentPricing({ coverVariantId }, "Couldn't load cart");
}

export async function getCartSummary(): Promise<{
  ok: boolean;
  unauthorized?: boolean;
  error?: string;
  data?: CartSummary;
}> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return { ok: false, unauthorized: true };
  try {
    const { data } = await api.get("/cart-summary", authConfig(token));
    if (data.message !== "success") {
      return { ok: false, error: data.errorMessage || "Couldn't load summary" };
    }
    return {
      ok: true,
      data: {
        usersDetails: data.usersDetails ?? null,
        selectedMembers: data.selectedMembers ?? [],
        selectedOpdPlan: data.selectedOpdPlan ?? null,
        coupons: data.coupons ?? [],
        couponApplied: data.couponApplied ?? 0,
        discount: data.discount ?? null,
        discountPrecent: data.discountPrecent ?? "0",
        cost: data.cost ?? 0,
        finalCost: data.finalCost ?? 0,
      },
    };
  } catch (e) {
    return { ok: false, ...parseError(e, "Couldn't load cart summary") };
  }
}

export function addDependentPricing(params: {
  coverVariantId: number;
  relationId: number;
  name?: string;
  dob?: string;
}): Promise<PricingResult> {
  return dependentPricing({ ...params }, "Couldn't add member");
}

export function removeDependentPricing(params: {
  coverVariantId: number;
  dependentId: number;
}): Promise<PricingResult> {
  return dependentPricing(
    {
      coverVariantId: params.coverVariantId,
      action: "remove",
      dependentId: params.dependentId,
    },
    "Couldn't remove member",
  );
}

export async function applyUserCoupon(
  couponCode: string,
): Promise<{ ok: boolean; unauthorized?: boolean; error?: string }> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return { ok: false, unauthorized: true };
  const userId = getUserId();
  if (!userId) return { ok: false, error: "Missing user" };
  try {
    const { data } = await api.post(
      "/update-user-coupon",
      { userId, CouponCode: couponCode },
      authConfig(token),
    );
    if (data.message === "success") return { ok: true };
    return { ok: false, error: data.errorMessage || "Couldn't apply coupon" };
  } catch (e) {
    return { ok: false, ...parseError(e, "Something went wrong") };
  }
}

export function removeUserCoupon(): Promise<{
  ok: boolean;
  unauthorized?: boolean;
  error?: string;
}> {
  return applyUserCoupon("");
}

export async function saveCart(): Promise<{
  ok: boolean;
  unauthorized?: boolean;
  error?: string;
  cartId?: number;
  status?: string;
  totalCost?: number;
}> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return { ok: false, unauthorized: true };
  try {
    const { data } = await api.post("/save-cart", {}, authConfig(token));
    if (data.message === "success") {
      return {
        ok: true,
        cartId: data.cartId,
        status: data.status,
        totalCost: data.totalCost,
      };
    }
    return { ok: false, error: data.errorMessage || "Couldn't save cart" };
  } catch (e) {
    return { ok: false, ...parseError(e, "Something went wrong") };
  }
}

export function transactUrl(
  userId: number,
  cartId: number,
  paymentType = "cashfree",
): string {
  return `${API_BASE}/transact?userId=${userId}&cartId=${cartId}&paymentType=${paymentType}`;
}

export async function updateDependentDetails(
  members: DependentDetail[],
): Promise<{ ok: boolean; unauthorized?: boolean; error?: string }> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return { ok: false, unauthorized: true };
  try {
    const { data } = await api.post(
      "/update-dependent-details",
      { members },
      authConfig(token),
    );
    if (data.message === "success") return { ok: true };
    return { ok: false, error: data.errorMessage || "Couldn't save details" };
  } catch (e) {
    return { ok: false, ...parseError(e, "Something went wrong") };
  }
}
