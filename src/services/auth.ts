import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from "@/types/auth";
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

export const refreshToken = async (refreshToken: string) => {
  try {
    const res = await fetch(`${api}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + refreshToken,
      },
    });
    const data = await res.json();
    if (data.error) {
      return undefined;
    }
    const token = data as RefreshTokenResponse;
    return token;
  } catch (error) {
    console.log(error);
  }
};
