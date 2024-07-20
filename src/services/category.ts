"use server";
import {
  AddCategoryRequest,
  CategoryResponse,
  EditCategoryRequest,
} from "@/types/category";
import { api } from "./api";
import { auth } from "@/auth";
import { ErrorResponse } from "@/types/error";
import { ProductResponse } from "@/components/modal/productTableModal/ProductTableModal";
import { getAccessToken } from "./auth";

export const getAllCategory = async (): Promise<CategoryResponse[]> => {
  try {
    const res = await fetch(`${api}/categories`, {
      next: { tags: ["category"] },
    });
    let data: CategoryResponse[] | ErrorResponse = await res.json();

    if ("error" in data) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getCategoryChildren = async (
  slug: string
): Promise<CategoryResponse[]> => {
  try {
    const res = await fetch(`${api}/categories/children/${slug}`);
    let data: CategoryResponse[] | ErrorResponse = await res.json();

    if ("error" in data) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getCategoryProduct = async (
  slug: string
): Promise<ProductResponse[]> => {
  try {
    const res = await fetch(`${api}/categories/product/${slug}`);
    let data: ProductResponse[] | ErrorResponse = await res.json();

    if ("error" in data) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const addCategory = async (
  data: AddCategoryRequest
): Promise<CategoryResponse> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "POST",
        body: JSON.stringify(data),
      });
      const result: CategoryResponse | ErrorResponse = await res.json();

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

export const editCategory = async (
  data: EditCategoryRequest
): Promise<CategoryResponse> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "PUT",
        body: JSON.stringify(data),
      });
      const result: CategoryResponse | ErrorResponse = await res.json();

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
