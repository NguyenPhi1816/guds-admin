import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from "@/types/auth";
import { api } from "./api";
import { ErrorResponse } from "@/types/error";

export const authenticate = async (
  request: LoginRequest
): Promise<LoginResponse | undefined> => {
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
    const data: LoginResponse | ErrorResponse = await res.json();

    if ("error" in data) {
      return undefined;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (
  refreshToken: string
): Promise<RefreshTokenResponse | undefined> => {
  try {
    const res = await fetch(`${api}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + refreshToken,
      },
    });
    const data: RefreshTokenResponse | ErrorResponse = await res.json();

    if ("error" in data) {
      return undefined;
    }

    return data;
  } catch (error) {
    throw error;
  }
};
