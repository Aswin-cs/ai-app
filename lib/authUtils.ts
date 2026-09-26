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


export const authService = {
  async getSession() {
    return getServerSession(authOptions);
  },
  async findUserByEmail(email: string) {
    await connectDB();
    return User.findOne({ email });
  },
};

/**
 * Authenticates the current server request and retrieves the corresponding database user.
 * 
 * @returns {Promise<AuthUserResult>} Object containing `{ user, errorResponse: null }` on success,
 * or `{ user: null, errorResponse }` with a 401/404 NextResponse on failure.
 */
export async function getAuthenticatedUser(): Promise<AuthUserResult> {
  try {
    const session = await authService.getSession();
    if (!session?.user?.email) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { error: "Unauthorized. Please sign in to continue." },
          { status: 401 }
        ),
      };
    }

    const user = await authService.findUserByEmail(session.user.email);
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

export type RouteContext<Params = Record<string, string | string[]>> = {
  params?: Promise<Params> | Params;
};

export type AuthenticatedHandler<Params = Record<string, string | string[]>> = (
  request: NextRequest,
  context: { user: IUser; params: Params }
) => Promise<NextResponse | Response>;

/**
 * Higher-order function wrapper for Next.js API route handlers. Automatically executes
 * session authentication and database user retrieval, passing the authenticated user and
 * resolved route params into the handler body. Returns a 401/404 response automatically on failure.
 *
 * @template Params Route parameter type signature (e.g. `{ id: string }`)
 * @param handler Function executing business logic with authenticated `{ user, params }` context.
 * @returns Standard Next.js route handler function `(request, routeContext) => Promise<Response>`
 */
export function withAuth<Params = Record<string, string | string[]>>(
  handler: AuthenticatedHandler<Params>
) {
  return async (
    request: NextRequest,
    routeContext?: RouteContext<Params>
  ): Promise<NextResponse | Response> => {
    const { user, errorResponse } = await getAuthenticatedUser();
    if (errorResponse || !user) {
      return errorResponse!;
    }
    const resolvedParams = routeContext?.params
      ? await Promise.resolve(routeContext.params)
      : ({} as Params);
    return handler(request, { user, params: resolvedParams });
  };
}
