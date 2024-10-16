import {
  AddBPImage,
  BaseProduct,
  BaseProductDetailImage,
  CreateBaseProductRequest,
  CreateOptionValueRequest,
  CreateProductVariantRequest,
  ProductVariantResponse,
} from "@/types/product";
import { getAccessToken } from "./auth";
import { ErrorResponse } from "@/types/error";

export const createBaseProduct = async (
  data: CreateBaseProductRequest
): Promise<BaseProduct> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("brandId", data.brandId.toString());
      formData.append("mainImageId", data.mainImageId.toString());
      data.categoryIds.map((item) => {
        formData.append("categoryIds", item.toString());
      });
      data.images.map((item) => {
        formData.append("images", item);
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_GUDS_API}/products`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "POST",
        body: formData,
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

export const addBPImage = async (
  data: AddBPImage
): Promise<BaseProductDetailImage[]> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const formData = new FormData();

      formData.append("baseProductId", data.baseProductId.toString());
      data.images.map((item) => {
        formData.append("images", item);
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GUDS_API}/products/image`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
          method: "POST",
          body: formData,
        }
      );
      const result: BaseProductDetailImage[] | ErrorResponse = await res.json();

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
  data: CreateProductVariantRequest
): Promise<ProductVariantResponse> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const formData = new FormData();

      formData.append("baseProductId", data.baseProductId.toString());
      formData.append("image", data.image);
      data.optionValueIds.map((item) => {
        formData.append("optionValueIds", item.toString());
      });
      formData.append("price", data.price.toString());
      formData.append("quantity", data.quantity.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GUDS_API}/product-variants`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
          method: "POST",
          body: formData,
        }
      );
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
