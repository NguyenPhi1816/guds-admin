import credentials from "next-auth/providers/credentials";
import { authenticate, refreshToken } from "./services/auth";
import { getProfile } from "./services/user";
import NextAuth from "next-auth";
import { UserRoles } from "./constant/enum/userRoles";
import { AccountStatus } from "./constant/enum/accountStatus";

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const exp = payload.exp * 1000;
    return Date.now() > exp;
  } catch (error) {
    console.error("Invalid token", error);
    return true;
  }
}

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
          role: profile.role,
          status: profile.status,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        };
        return response;
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (
        user?.role !== UserRoles.ADMIN ||
        user.status !== AccountStatus.ACTIVE
      ) {
        return false;
      }
      return true;
    },
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

      if (session.user.access_token) {
        if (isTokenExpired(session.user.access_token)) {
          const newToken = await refreshToken(session.user.refresh_token);
          if (newToken) {
            session.user.access_token = newToken.access_token;
          }
        }
      }

      return session;
    },
  },
});
