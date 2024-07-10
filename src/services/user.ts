import { ProfileResponse } from "@/types/user";

export const getProfile = async (accessToken: string) => {
  try {
    const res = await fetch("http://localhost:8080/api/users/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    });
    const profile: ProfileResponse = await res.json();
    return profile ?? null;
  } catch (error) {
    console.log(error);
  }
};
