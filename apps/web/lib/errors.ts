/**
 * Structured error types for the application.
 * Server actions return ActionResult<T> instead of throwing raw errors.
 */
import { logger } from "@crewchat/logger";

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = AppError.codeToStatus(code);
  }

  private static codeToStatus(code: ErrorCode): number {
    switch (code) {
      case "UNAUTHORIZED":   return 401;
      case "FORBIDDEN":      return 403;
      case "NOT_FOUND":      return 404;
      case "VALIDATION_ERROR": return 400;
      case "CONFLICT":       return 409;
      case "RATE_LIMITED":   return 429;
      case "INTERNAL":       return 500;
    }
  }
}

/** Discriminated union result type for server actions */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ErrorCode; message: string } };

function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

function failure<T>(code: ErrorCode, message: string): ActionResult<T> {
  return { success: false, error: { code, message } };
}

/**
 * Wraps a server action function with:
 * 1. Structured error handling (catches and classifies errors)
 * 2. Consistent ActionResult<T> return type
 * 3. Safe error messages (no internal details leaked to client)
 *
 * Usage:
 *   export const myAction = withAction(async (input: string) => {
 *     // ... business logic
 *     return result;
 *   });
 */
export function withAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<ActionResult<TResult>> {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    try {
      const result = await fn(...args);
      return success(result);
    } catch (err: unknown) {
      // Known application errors — return structured response
      if (err instanceof AppError) {
        return failure(err.code, err.message);
      }

      // Zod validation errors — return field-level details
      if (
        err &&
        typeof err === "object" &&
        "name" in err &&
        (err as any).name === "ZodError"
      ) {
        const zodErr = err as any;
        const message = zodErr.issues ? zodErr.issues.map((i: any) => i.message).join("; ") : "Validation failed";
        return failure("VALIDATION_ERROR", message);
      }

      // Domain errors thrown as plain Error (from packages)
      if (err instanceof Error) {
        const msg = err.message;

        // Classify known domain error messages
        if (msg === "Unauthorized" || msg.includes("Unauthorized")) {
          return failure("UNAUTHORIZED", "Authentication required");
        }
        if (msg === "Forbidden" || msg.includes("Only admins")) {
          return failure("FORBIDDEN", msg);
        }
        if (msg.includes("not found") || msg.includes("Not found")) {
          return failure("NOT_FOUND", msg);
        }
        if (msg.includes("Cannot") || msg.includes("already")) {
          return failure("CONFLICT", msg);
        }

        // Unknown errors — log internally but return generic message
        logger.error({ err }, "[ActionError] Unhandled error in server action");
        return failure("INTERNAL", "Something went wrong. Please try again.");
      }

      // Completely unknown error shape
      logger.error({ err }, "[ActionError] Unknown error shape in server action");
      return failure("INTERNAL", "An unexpected error occurred.");
    }
  };
}
