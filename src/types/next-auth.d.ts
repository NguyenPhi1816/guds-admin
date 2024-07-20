import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    name: string;
    image: string | null;
    email: string;
    role: string;
    status: string;
    access_token: string;
    refresh_token: string;
  }

  interface Session {
    user: {
      name: string;
      image: string | null;
      email: string;
      role: string;
      status: string;
      access_token: string;
      refresh_token: string;
    };
  }
}
