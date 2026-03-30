import { ZodError } from "zod";
import { NextResponse } from "next/server";

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export function success<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { status });
}

export function failure(
  message: string,
  status = 400,
  code?: string,
  details?: unknown,
) {
  return NextResponse.json<ApiFailure>(
    {
      ok: false,
      error: {
        message,
        code,
        details,
      },
    },
    { status },
  );
}

export function fromZodError(error: ZodError) {
  return failure("Validation failed", 400, "VALIDATION_ERROR", error.flatten());
}
