"use server";
import { Brand, CreateBrandRequest, UpdateBrandRequest } from "@/types/brand";
import { api } from "./api";
import { auth } from "@/auth";
import { ErrorResponse } from "@/types/error";
import { ProductResponse } from "@/components/modal/productTableModal/ProductTableModal";

export const getAllBrand = async (): Promise<Brand[]> => {
  try {
    const res = await fetch(`${api}/brands`);
    const data: Brand[] | ErrorResponse = await res.json();

    if ("error" in data) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getBrandProduct = async (
  slug: string
): Promise<ProductResponse[]> => {
  try {
    const res = await fetch(`${api}/brands/product/${slug}`);
    let data: ProductResponse[] | ErrorResponse = await res.json();

    if ("error" in data) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const createBrand = async (data: CreateBrandRequest): Promise<Brand> => {
  try {
    const session = await auth();
    if (session) {
      const accessToken = session.user.access_token;
      const res = await fetch(`${api}/brands`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "POST",
        body: JSON.stringify(data),
      });
      const result: Brand | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("No session");
    }
  } catch (error) {
    throw error;
  }
};

export const updateBrand = async (data: UpdateBrandRequest): Promise<Brand> => {
  try {
    const session = await auth();
    if (session) {
      const accessToken = session.user.access_token;
      const res = await fetch(`${api}/brands`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "PUT",
        body: JSON.stringify(data),
      });
      const result: Brand | ErrorResponse = await res.json();

      if ("error" in result) {
        throw new Error(result.message);
      }

      return result;
    } else {
      throw new Error("No session");
    }
  } catch (error) {
    throw error;
  }
};
