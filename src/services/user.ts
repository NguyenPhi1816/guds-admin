"use server";
import { ProfileResponse } from "@/types/user";
import { api } from "./api";
import { ErrorResponse } from "@/types/error";

export const getProfile = async (accessToken: string) => {
  try {
    const res = await fetch(`${api}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    });
    const profile: ProfileResponse | ErrorResponse = await res.json();

    if ("error" in profile) {
      throw new Error(profile.message);
    }

    return profile ?? null;
  } catch (error) {
    throw error;
  }
};
