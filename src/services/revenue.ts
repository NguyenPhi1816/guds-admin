"use server";
import { ErrorResponse } from "@/types/error";
import { api } from "./api";

export const getMonthlyRevenue = async (
  year: string
): Promise<{ month: number; revenue: number }[]> => {
  try {
    const res = await fetch(`${api}/revenue/monthly?year=${year}`);
    const data: { month: number; revenue: number }[] | ErrorResponse =
      await res.json();

    if ("error" in data) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
