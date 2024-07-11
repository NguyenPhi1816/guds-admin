import credentials from "next-auth/providers/credentials";
import { authenticate } from "./services/auth";
import { getProfile } from "./services/user";
import NextAuth from "next-auth";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    credentials({
      name: "Credentials",
      credentials: {
        phoneNumber: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const { phoneNumber, password } = credentials;

        const tokens = await authenticate({
          phoneNumber: phoneNumber as string,
          password: password as string,
        });
        if (!tokens) {
          return null;
        }
        const profile = await getProfile(tokens.access_token);
        if (!profile) {
          return null;
        }

        const response = {
          id: profile.id.toString(),
          name: profile.firstName + " " + profile.lastName,
          image: profile.image,
          email: profile.email,
          roles: profile.roles,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        };
        return response;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return {
          ...token,
          ...session.user,
        };
      }
      return { ...token, ...user };
    },
    async session({ session, token, user }) {
      session.user = token as any;
      return session;
    },
  },
});
