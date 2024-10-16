import {
  AddCategoryRequest,
  CategoryResponse,
  EditCategoryRequest,
} from "@/types/category";
import { getAccessToken } from "./auth";
import { ErrorResponse } from "@/types/error";

export const addCategory = async (
  data: AddCategoryRequest
): Promise<CategoryResponse> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("image", data.image as any);
      formData.append("description", data.description);
      if (!!data.parentId) {
        formData.append("parentId", data.parentId.toString());
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GUDS_API}/categories`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
          method: "POST",
          body: formData,
        }
      );
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
      const formData = new FormData();

      formData.append("id", data.id as any);
      formData.append("name", data.name);
      formData.append("existImage", data.existImage);
      formData.append("existImageId", data.existImageId);
      formData.append("description", data.description);
      if (!!data.parentId) {
        formData.append("parentId", data.parentId.toString());
      }
      if (!!data.newImage) {
        formData.append("newImage", data.newImage);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GUDS_API}/categories`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
          method: "PUT",
          body: formData,
        }
      );
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
