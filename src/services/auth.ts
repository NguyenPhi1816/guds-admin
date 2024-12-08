"use server";
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from "@/types/auth";
import { api } from "./api";
import { ErrorResponse } from "@/types/error";
import { auth } from "@/auth";

export const authenticate = async (
  request: LoginRequest
): Promise<LoginResponse | undefined> => {
  try {
    const { phoneNumber, password } = request;
    const res = await fetch(`${api}/auth/login-admin`, {
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

// export const refreshToken = async (
//   refreshToken: string
// ): Promise<RefreshTokenResponse | undefined> => {
//   try {
//     const res = await fetch(`${api}/auth/refresh-token`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + refreshToken,
//       },
//     });
//     const data: RefreshTokenResponse | ErrorResponse = await res.json();

//     if ("error" in data) {
//       return undefined;
//     }

//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

// function isTokenExpired(token: string) {
//   try {
//     const payload = JSON.parse(
//       Buffer.from(token.split(".")[1], "base64").toString()
//     );
//     const exp = payload.exp * 1000;
//     return Date.now() > exp;
//   } catch (error) {
//     console.error("Invalid token", error);
//     return true;
//   }
// }

export async function getAccessToken(): Promise<string | undefined> {
  try {
    const session = await auth();
    if (session) {
      return session.user.accessToken;
    } else {
      return undefined;
    }
  } catch (error) {
    throw error;
  }
}
