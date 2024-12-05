"use server";
import { getAccessToken } from "./auth";
import { api } from "./api";
import { ErrorResponse } from "@/types/error";
import { Blog, BlogCategory, BlogDetail, UpdateBlogStatus } from "@/types/blog";

export const getAllBlogCategories = async (): Promise<BlogCategory[]> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/blogs/category`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "GET",
      });
      const result: BlogCategory[] | ErrorResponse = await res.json();

      console.log(result);

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

export const getCategoryBlog = async (
  blogCategoryId: number
): Promise<Blog[]> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/blogs/category/${blogCategoryId}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "GET",
      });
      const result: Blog[] | ErrorResponse = await res.json();

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

export const updateBlogStatus = async (
  data: UpdateBlogStatus
): Promise<any> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/blogs/status`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        body: JSON.stringify(data),
        method: "PUT",
      });
      const result: BlogCategory[] | ErrorResponse = await res.json();

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

export const getBlogDetail = async (blogId: number): Promise<BlogDetail> => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const res = await fetch(`${api}/blogs/detail/${blogId}`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        method: "GET",
      });
      const result: BlogDetail | ErrorResponse = await res.json();

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
