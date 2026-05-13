import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";
import { compareSync } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  basePath: "/api/auth",
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers.filter((p) => p.id !== "credentials"),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;
        if (!user.emailVerified) return null;

        const isValid = compareSync(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          trustScore: user.trustScore,
          trustLevel: user.trustLevel,
          availStatus: user.availStatus,
          onboardingDone: user.onboardingDone,
          role: user.role,
          isBlocked: user.isBlocked,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.onboardingDone = (user as any).onboardingDone;
        token.trustScore = (user as any).trustScore;
        token.trustLevel = (user as any).trustLevel;
      }

      // Handle session update from client
      if (trigger === "update" && session) {
        if (session.onboardingDone !== undefined) token.onboardingDone = session.onboardingDone;
        if (session.role !== undefined) token.role = session.role;
        if (session.trustScore !== undefined) token.trustScore = session.trustScore;
        if (session.trustLevel !== undefined) token.trustLevel = session.trustLevel;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        try {
          // Keep DB sync here for client-side fresh data (Node.js runtime)
          const results = await prisma.$queryRawUnsafe<any[]>(
            `SELECT id, name, username, image, role, "trustScore", "trustLevel", "availStatus", "onboardingDone", "isBlocked" FROM "User" WHERE id = $1`,
            token.id
          );
          const dbUser = results && results[0];
          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.name = dbUser.name;
            (session.user as any).username = dbUser.username;
            session.user.image = dbUser.image;
            session.user.role = dbUser.role;
            session.user.trustScore = dbUser.trustScore;
            session.user.trustLevel = dbUser.trustLevel;
            session.user.availStatus = dbUser.availStatus;
            session.user.onboardingDone = dbUser.onboardingDone;
            session.user.isBlocked = dbUser.isBlocked;
          }
        } catch (error) {
          console.error("Session sync error:", error);
          // Fallback to token
          session.user.id = token.id as string;
          session.user.role = token.role as any;
          session.user.onboardingDone = token.onboardingDone as boolean;
        }
      }
      return session;
    },
  },
});
