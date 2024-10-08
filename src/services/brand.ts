"use server";
import { Brand, CreateBrandRequest, UpdateBrandRequest } from "@/types/brand";
import { api } from "./api";
import { auth } from "@/auth";
import { ErrorResponse } from "@/types/error";
import { ProductResponse } from "@/components/modal/productTableModal/ProductTableModal";
import { getAccessToken } from "./auth";

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
    const accessToken = await getAccessToken();

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("image", data.image);

    if (accessToken) {
      const res = await fetch(`${api}/brands`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "POST",
        body: formData,
      });
      const result: Brand | ErrorResponse = await res.json();

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

export const updateBrand = async (data: UpdateBrandRequest): Promise<Brand> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const formData = new FormData();

      formData.append("id", data.id.toString());
      formData.append("name", data.name);
      formData.append("existImage", data.existImage);

      if (!!data.newImage) {
        formData.append("newImage", data.newImage);
      }

      const res = await fetch(`${api}/brands`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "PUT",
        body: formData,
      });
      const result: Brand | ErrorResponse = await res.json();

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
