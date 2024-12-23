import {
  AddBPImage,
  BaseProduct,
  BaseProductDetailImage,
  CreateBaseProductRequest,
  CreateOptionValueRequest,
  CreateProductVariantRequest,
  ProductVariantResponse,
  UpdateBaseProductRequest,
  UpdateProductVariantRequest,
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

export const updateProductVariant = async (
  data: UpdateProductVariantRequest
): Promise<ProductVariantResponse> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const formData = new FormData();

      formData.append("productVariantId", data.productVariantId.toString());
      if (data.image) {
        formData.append("image", data.image);
      }
      formData.append("imageUrl", data.imageUrl);
      formData.append("imageId", data.imageId);
      formData.append("quantity", data.quantity.toString());
      formData.append("price", data.price.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GUDS_API}/product-variants`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
          method: "PUT",
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

export const exportSalesReport = async (fromDate: string, toDate: string) => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_GUDS_API}/export-sales-report?fromDate=${fromDate}&toDate=${toDate}`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi tải file báo cáo");
      }

      // Chuyển đổi response thành blob
      const blob = await response.blob();

      console.log(response);

      // Tạo URL cho file blob
      const url = window.URL.createObjectURL(blob);

      // Tạo thẻ <a> để tải file
      const link = document.createElement("a");
      link.href = url;
      link.download = `Sales_Report_${fromDate}_to_${toDate}.xlsx`;
      link.click();

      // Giải phóng URL
      window.URL.revokeObjectURL(url);
    } else {
      throw new Error("Phiên làm việc hết hạn");
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
};
