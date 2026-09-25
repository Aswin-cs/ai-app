import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/user.model";
import crypto from "crypto";

// Ensure a strong random secret if NEXTAUTH_SECRET is missing in environment
let fallbackSecret: string | undefined;
function getAuthSecret(): string {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    console.error("⚠️ CRITICAL SECURITY WARNING: NEXTAUTH_SECRET is not set in environment variables!");
  }
  if (!fallbackSecret) {
    fallbackSecret = crypto.randomBytes(32).toString("hex");
  }
  return fallbackSecret;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const { email, name, image } = user;

          if (!email) return false;

          let existingUser = await User.findOne({ email });

          if (!existingUser) {
            existingUser = await User.create({
              name: name || "User",
              email: email,
              image: image || "",
              googleId: account.providerAccountId || "",
              role: "user",
            });
          } else {
            let isModified = false;
            if (!existingUser.googleId && account.providerAccountId) {
              existingUser.googleId = account.providerAccountId;
              isModified = true;
            }
            if (image && !existingUser.image) {
              existingUser.image = image;
              isModified = true;
            }
            if (isModified) {
              await existingUser.save();
            }
          }
          return true;
        } catch (error) {
          console.error("Error saving user to DB during Google sign in:", error);
          return true;
        }
      }
      return true;
    },

    async session({ session }) {
      try {
        await connectDB();
        if (session.user?.email) {
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            session.user.id = dbUser._id.toString();
            session.user.role = dbUser.role;
          }
        }
      } catch (error) {
        console.error("Error attaching user data to session:", error);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: getAuthSecret(),
};

const handler = NextAuth(authOptions);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const resolvedParams = await context.params;
  return handler(req, { params: resolvedParams });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const resolvedParams = await context.params;
  return handler(req, { params: resolvedParams });
}

