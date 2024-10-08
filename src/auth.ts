import credentials from "next-auth/providers/credentials";
import { authenticate } from "./services/auth";
import NextAuth from "next-auth";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  providers: [
    credentials({
      name: "Credentials",
      credentials: {
        phoneNumber: {
          label: "Phone Number",
          type: "text",
          placeholder: "Phone Number",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { phoneNumber, password } = credentials;

        const response = await authenticate({
          phoneNumber: phoneNumber as string,
          password: password as string,
        });

        if (!response) {
          return null;
        }

        return response;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (!!user) {
        token.accessToken = user.accessToken;
        token.expires = user.expires;
        token.user = user.user;
        token.provider = user.provider;
        token.providerAccountId = user.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token as any;

      if (Date.now() > new Date(token.expires as Date).getTime()) {
        console.log("session expired.");
        session.expires = "expired" as Date & string;
      }

      return session;
    },
  },
});
