"use server";
import { getAccessToken } from "./auth";
import { api } from "./api";
import { ErrorResponse } from "@/types/error";
import {
  GetProductStatisticsRequest,
  GetProductStatisticsResponse,
  GetPurchasesStatisticsRequest,
  PriceChangeStatisticsRequest,
  PriceChangeStatisticsResponse,
} from "@/types/statistics";

export const getProductStatistics = async (
  data: GetProductStatisticsRequest
): Promise<GetProductStatisticsResponse[]> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/products/statistics`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "Post",
        body: JSON.stringify(data),
      });
      const result: GetProductStatisticsResponse[] | ErrorResponse =
        await res.json();

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

export const getPurchasesStatistics = async (
  data: GetPurchasesStatisticsRequest
): Promise<GetProductStatisticsResponse[]> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/products/purchases/statistics`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "Post",
        body: JSON.stringify(data),
      });
      const result: GetProductStatisticsResponse[] | ErrorResponse =
        await res.json();

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

export const priceChangeStatistics = async (
  data: PriceChangeStatisticsRequest
): Promise<PriceChangeStatisticsResponse[]> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/products/prices/statistics`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "Post",
        body: JSON.stringify(data),
      });
      const result: PriceChangeStatisticsResponse[] | ErrorResponse =
        await res.json();

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

export const getTop10MostPurchasedProducts = async (): Promise<any[]> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/products/top-10/most-purchased`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "GET",
      });
      const result: any[] | ErrorResponse = await res.json();

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

export const getTop10MostPurchasedCategories = async (): Promise<any[]> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/categories/top-10/most-purchased`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "GET",
      });
      const result: any[] | ErrorResponse = await res.json();

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
