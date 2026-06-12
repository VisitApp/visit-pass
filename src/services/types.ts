export type UserInfo = {
  userId: number;
  isNewUser?: boolean;
  enrolmentCompleted?: boolean;
  visitPaymentMade?: boolean;
};

export type Plan = {
  coverVariantId: number;
  name: string;
  cost: string;
  coverId: number;
  description: string;
  standardPlanDescription: unknown;
};

export type SelectedMember = {
  dependentId: number | null;
  relationId: number | null;
  name: string | null;
  dob: string | null;
};

export type Pricing = {
  selectedMembers: SelectedMember[];
  cost: number;
  discount: number;
  finalCost: number;
};

export type DependentDetail = {
  // null for the self (primary) row, which has no dependentId
  dependentId: number | null;
  name: string;
  dob: string;
  // collected for gender-ambiguous rows (self, spouse); null otherwise
  gender?: string | null;
};

export type CartPlan = {
  name: string;
  description: string;
  cost: string;
  coverVariantId: number;
};

export type Coupon = {
  couponName: string;
  couponDiscount?: string;
  subHeading?: string;
  description?: string;
};

export type CartSummary = {
  usersDetails: { userId: number; name?: string } | null;
  selectedMembers: SelectedMember[];
  selectedOpdPlan: CartPlan | null;
  coupons: Coupon[];
  couponApplied: number;
  discount: number | null;
  discountPrecent: string;
  cost: number;
  finalCost: number;
};

/** uniform result shape for API calls */
export type ApiResult<T = undefined> = {
  ok: boolean;
  unauthorized?: boolean;
  error?: string;
  data?: T;
};
