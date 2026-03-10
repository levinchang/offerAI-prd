import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

export function ok<T>(data: T, message = "success") {
  return NextResponse.json({
    code: 0,
    message,
    data,
  } satisfies ApiResponse<T>);
}

export function fail(code: number, message: string) {
  const status = code >= 500 ? 500 : (code >= 400 ? code : 400);
  return NextResponse.json(
    { code, message } satisfies ApiResponse,
    { status }
  );
}

export const ErrorCodes = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  INTERNAL: 500,
} as const;
