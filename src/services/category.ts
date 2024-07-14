"use server";
import {
  AddCategoryRequest,
  CategoryResponse,
  EditCategoryRequest,
} from "@/types/category";
import { api } from "./api";
import { auth } from "@/auth";
import { ErrorResponse } from "@/types/error";

export const getAllCategory = async (): Promise<CategoryResponse[]> => {
  try {
    const res = await fetch(`${api}/categories`, {
      next: { tags: ["category"] },
    });
    let data = (await res.json()) as CategoryResponse[];
    return data;
  } catch (error) {
    throw error;
  }
};

export const addCategory = async (
  data: AddCategoryRequest
): Promise<CategoryResponse> => {
  try {
    const session = await auth();
    if (session) {
      const accessToken = session.user.access_token;
      const res = await fetch(`${api}/categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      return result;
    } else {
      throw new Error("No session");
    }
  } catch (error) {
    throw error;
  }
};

export const editCategory = async (
  data: EditCategoryRequest
): Promise<CategoryResponse> => {
  try {
    const session = await auth();
    if (session) {
      const accessToken = session.user.access_token;
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
      throw new Error("No session");
    }
  } catch (error) {
    throw error;
  }
};
