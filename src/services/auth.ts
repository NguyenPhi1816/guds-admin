import { LoginRequest, LoginResponse } from "@/types/auth";
import { api } from "./api";

export const authenticate = async (request: LoginRequest) => {
  try {
    const { phoneNumber, password } = request;
    const res = await fetch(`${api}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber,
        password,
      }),
    });
    const data = await res.json();
    if (data.error) {
      return undefined;
    }
    const tokens = data as LoginResponse;
    return tokens;
  } catch (error) {
    console.log(error);
  }
};
