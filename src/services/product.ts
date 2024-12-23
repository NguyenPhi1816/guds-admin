"use server";

import {
  BaseProduct,
  CreateBaseProductRequest,
  CreateOptionValueRequest,
  CreateProductVariantRequest,
  ProductVariantResponse,
  OptionValuesResponse,
  UpdateBaseProductRequest,
  UpdateProductVariantRequest,
  UpdateBaseProductStatusRequest,
  BaseProductDetailAdmin,
  CreateInventoryLog,
  InventoryLog,
} from "@/types/product";
import { api } from "./api";
import { ErrorResponse } from "@/types/error";
import { auth } from "@/auth";
import { getAccessToken } from "./auth";

export const getAllProduct = async (): Promise<BaseProduct[]> => {
  try {
    const res = await fetch(`${api}/products`);
    const data: BaseProduct[] | ErrorResponse = await res.json();

    if ("error" in data) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getBaseProductBySlug = async (
  slug: string
): Promise<BaseProductDetailAdmin> => {
  try {
    const res = await fetch(`${api}/products/${slug}`);
    const data: BaseProductDetailAdmin | ErrorResponse = await res.json();

    if ("error" in data) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const createBaseProduct = async (
  createBaseProductRequest: CreateBaseProductRequest
): Promise<BaseProduct> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/products`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "POST",
        body: JSON.stringify(createBaseProductRequest),
      });
      const result: BaseProduct | ErrorResponse = await res.json();

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

export const deleteBaseProductImage = async (publicId: string) => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      await fetch(`${api}/products/image?id=${publicId}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "DELETE",
      });
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    throw error;
  }
};

export const updateBaseProduct = async (
  updateBaseProductRequest: UpdateBaseProductRequest
): Promise<BaseProduct> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/products`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "PUT",
        body: JSON.stringify(updateBaseProductRequest),
      });
      const result: BaseProduct | ErrorResponse = await res.json();

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

export const updateBaseProductStatus = async (
  updateBaseProductStatusRequest: UpdateBaseProductStatusRequest
) => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/products/status`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "PUT",
        body: JSON.stringify(updateBaseProductStatusRequest),
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

export const createOptionValues = async (
  createOptionValuesRequest: CreateOptionValueRequest
): Promise<OptionValuesResponse[]> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/option-values`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "POST",
        body: JSON.stringify(createOptionValuesRequest),
      });
      const result: OptionValuesResponse[] | ErrorResponse = await res.json();

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

export const createProductVariant = async (
  createProductVariantRequest: CreateProductVariantRequest
): Promise<ProductVariantResponse> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/product-variants`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "POST",
        body: JSON.stringify(createProductVariantRequest),
      });
      const result: ProductVariantResponse | ErrorResponse = await res.json();

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

export const updateProductVariant = async (
  updateProductVariantRequest: UpdateProductVariantRequest
): Promise<ProductVariantResponse> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/product-variants`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "PUT",
        body: JSON.stringify(updateProductVariantRequest),
      });
      const result: ProductVariantResponse | ErrorResponse = await res.json();

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

export const createInventoryLog = async (
  data: CreateInventoryLog
): Promise<InventoryLog> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/create-inventory-log`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "POST",
        body: JSON.stringify(data),
      });
      const result: InventoryLog | ErrorResponse = await res.json();

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

export const getInventoryLog = async (
  productVariantId: number
): Promise<InventoryLog[]> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/get-inventory-log/${productVariantId}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "GET",
      });
      const result: InventoryLog[] | ErrorResponse = await res.json();

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

export const updateProductMainImage = async (
  baseProductId: number,
  imageId: number
) => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(
        `${api}/products/image?baseProductId=${baseProductId}&imageId=${imageId}`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
          method: "PUT",
        }
      );
      const result: number | ErrorResponse = await res.json();

      if (typeof result != "number") {
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
