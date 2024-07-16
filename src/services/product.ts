"use server";

import { BaseProduct } from "@/types/product";
import { api } from "./api";
import { ErrorResponse } from "@/types/error";

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
