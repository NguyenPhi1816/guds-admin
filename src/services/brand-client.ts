import { Brand, CreateBrandRequest, UpdateBrandRequest } from "@/types/brand";
import { getAccessToken } from "./auth";
import { ErrorResponse } from "@/types/error";

export const createBrand = async (data: CreateBrandRequest): Promise<Brand> => {
  try {
    const accessToken = await getAccessToken();

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("image", data.image);

    if (accessToken) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GUDS_API}/brands`, {
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_GUDS_API}/brands`, {
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
