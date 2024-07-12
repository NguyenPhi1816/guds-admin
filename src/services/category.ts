"use server";
import { AddCategoryRequest, CategoryResponse } from "@/types/category";
import { api } from "./api";
import { auth } from "@/auth";

export const getAllCategory = async (): Promise<CategoryResponse[]> => {
  try {
    const res = await fetch(`${api}/categories`);
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
