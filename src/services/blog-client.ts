import {
  Blog,
  BlogCategory,
  CreateBlog,
  CreateBlogCategory,
  UpdateBlog,
  UpdateBlogCategory,
} from "@/types/blog";
import { getAccessToken } from "./auth";
import { ErrorResponse } from "@/types/error";

export const createBlogCategory = async (
  data: CreateBlogCategory
): Promise<BlogCategory> => {
  try {
    const accessToken = await getAccessToken();

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("image", data.image);

    if (accessToken) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GUDS_API}/blogs/category`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
          method: "POST",
          body: formData,
        }
      );
      const result: BlogCategory | ErrorResponse = await res.json();

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

export const updateBlogCategory = async (
  data: UpdateBlogCategory
): Promise<BlogCategory> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const formData = new FormData();

      formData.append("id", data.id.toString());
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("existImage", data.existImage);
      formData.append("existImageId", data.existImageId);

      if (!!data.newImage) {
        formData.append("newImage", data.newImage);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GUDS_API}/blogs/category`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
          method: "PUT",
          body: formData,
        }
      );
      const result: BlogCategory | ErrorResponse = await res.json();

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

export const createBlog = async (data: CreateBlog): Promise<Blog> => {
  try {
    const accessToken = await getAccessToken();

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("summary", data.summary);
    formData.append("content", data.content);
    formData.append("categoryId", data.categoryId.toString());
    formData.append("image", data.image);

    if (accessToken) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GUDS_API}/blogs`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "POST",
        body: formData,
      });
      const result: Blog | ErrorResponse = await res.json();

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

export const updateBlog = async (data: UpdateBlog): Promise<Blog> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const formData = new FormData();

      formData.append("id", data.id.toString());
      formData.append("title", data.title);
      formData.append("summary", data.summary);
      formData.append("content", data.content);
      formData.append("categoryId", data.categoryId.toString());

      formData.append("existImage", data.existImage);
      formData.append("existImageId", data.existImageId);

      if (!!data.newImage) {
        formData.append("newImage", data.newImage);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_GUDS_API}/blogs`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "PUT",
        body: formData,
      });
      const result: Blog | ErrorResponse = await res.json();

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
