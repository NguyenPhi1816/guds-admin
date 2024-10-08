import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    accessToken: string;
    expires: Date;
    user: {
      name: string;
      email: string;
      image: string;
      id: number;
    };
    provider: string;
    providerAccountId: number;
  }

  interface Session {
    user: {
      accessToken: string;
      expires: Date;
      user: {
        name: string;
        email: string;
        image: string;
        id: number;
      };
      provider: string;
      providerAccountId: number;
    };
  }
}
