"use server";

import { signIn, signOut } from "@/auth";
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
