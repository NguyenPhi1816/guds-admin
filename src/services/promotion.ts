"use server";
import { ErrorResponse } from "@/types/error";
import { api } from "./api";
import { getAccessToken } from "./auth";
import {
  CreateDiscountRequest,
  CreatePromotionRequest,
  CreateVoucherRequest,
  DiscountDetail,
  Promotion,
  PromotionDetail,
  VoucherDetail,
} from "@/types/promotion";

export const getPromotions = async (): Promise<Promotion[]> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/promotion`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "GET",
      });
      const result: Promotion[] | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};

export const createPromotion = async (
  data: CreatePromotionRequest
): Promise<Promotion> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/promotion`, {
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      });
      const result: Promotion | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};

export const getPromotionDetail = async (
  promotionId: number
): Promise<PromotionDetail> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/promotion/${promotionId}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "GET",
      });
      const result: PromotionDetail | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};

export const createDiscount = async (
  data: CreateDiscountRequest
): Promise<DiscountDetail> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/discount`, {
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      });
      const result: DiscountDetail | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};

export const deleteDiscount = async (discountId: number): Promise<any> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/discount/${discountId}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "DELETE",
      });
      const result: any | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};

export const updateDiscountStatus = async (
  discountId: number,
  status: string
): Promise<any> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/discount/${discountId}/${status}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "PUT",
      });
      const result: any | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};

export const createVoucher = async (
  data: CreateVoucherRequest
): Promise<VoucherDetail> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/voucher`, {
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      });
      const result: VoucherDetail | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};

export const deleteVoucher = async (voucherId: number): Promise<any> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/voucher/${voucherId}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "DELETE",
      });
      const result: any | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};

export const updateVoucherStatus = async (
  voucherId: number,
  status: string
): Promise<any> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/voucher/${voucherId}/${status}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "PUT",
      });
      const result: any | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};
