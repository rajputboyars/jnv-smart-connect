import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/lib/utils/api-error";

export type RouteHandler<Ctx = unknown> = (
  req: NextRequest,
  ctx: Ctx
) => Promise<NextResponse>;

export function withErrorHandling<Ctx = unknown>(
  handler: RouteHandler<Ctx>
): RouteHandler<Ctx> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { success: false, message: error.message, details: error.details },
          { status: error.statusCode }
        );
      }

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            details: error.flatten().fieldErrors,
          },
          { status: 422 }
        );
      }

      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: unknown }).code === 11000
      ) {
        return NextResponse.json(
          { success: false, message: "A record with these details already exists" },
          { status: 409 }
        );
      }

      console.error("[api-error]", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
