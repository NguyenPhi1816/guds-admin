"use server";

import { signIn, signOut } from "@/auth";
import { refreshToken } from "@/services/auth";
import { AuthError } from "next-auth";

export const doCredentialLogin = async (formData: FormData) => {
  const phoneNumber = formData.get("phoneNumber");
  const password = formData.get("password");
  try {
    await signIn("credentials", {
      phoneNumber,
      password,
      redirect: true,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          throw new Error("Tài khoản hoặc mật khẩu không chính xác");
        case "CallbackRouteError":
          throw new Error("Tài khoản hoặc mật khẩu không chính xác");
        default:
          return "Có lỗi xảy ra";
      }
    }
    throw error;
  }
};

export const doRefreshToken = async (refresh_token: string) => {
  try {
    const token = await refreshToken(refresh_token);
    return token;
  } catch (error) {
    throw new Error("Something went wrong");
  }
};
