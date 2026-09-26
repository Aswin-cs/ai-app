/**
 * JurisAI Server Authentication Helper Utility
 * Provides a clean, reusable helper to authenticate server-side API requests via NextAuth
 * and fetch the associated database user document.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/config/db";
import User, { IUser } from "@/models/user.model";
import { logger } from "@/lib/logger";

export interface AuthUserResult {
  user: IUser | null;
  errorResponse: NextResponse | null;
}


declare global {
  // eslint-disable-next-line no-var
  var __mockAuthResult: AuthUserResult | undefined;
}

/**
 * Authenticates the current server request and retrieves the corresponding database user.
 * Returns either `{ user, errorResponse: null }` on success or `{ user: null, errorResponse }` on failure.
 */
export async function getAuthenticatedUser(): Promise<AuthUserResult> {
  if (globalThis.__mockAuthResult !== undefined) {
    return globalThis.__mockAuthResult;
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { error: "Unauthorized. Please sign in to continue." },
          { status: 401 }
        ),
      };
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { error: "User profile not found in database." },
          { status: 404 }
        ),
      };
    }

    return { user, errorResponse: null };
  } catch (error) {
    const isRequestScopeError = error instanceof Error && error.message.includes("headers");
    if (!isRequestScopeError) {
      logger.error("❌ [getAuthenticatedUser] Authentication error:", error);
    }
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Authentication failed. Please sign in again." },
        { status: 401 }
      ),
    };
  }
}
