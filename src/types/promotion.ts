export type Promotion = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
};

export type PromotionDetail = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  vouchers: VoucherDetail[];
  discounts: DiscountDetail[];
};

export type VoucherDetail = {
  id: number;
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscountValue: number;
  status: string;
  usageLimit: number;
  usedCount: number;
};

export type AppliedDiscountProduct = {
  id: number;
  slug: string;
  name: string;
  status: "ACTIVE";
  brand: string;
  categories: string[];
};

export type DiscountDetail = {
  id: number;
  type: string;
  value: number;
  status: string;
  appliedProducts: AppliedDiscountProduct[];
};

export type CreatePromotionRequest = {
  name: string;
  startDate: string;
  endDate: string;
};

export type CreateDiscountRequest = {
  type: string;
  value: number;
  promotionId: number;
  appliedProductIds: number[];
};

export type CreateVoucherRequest = {
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscountValue: number;
  usageLimit: number;
  promotionId: number;
};
