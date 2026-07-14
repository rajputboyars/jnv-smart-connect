import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: { status?: number; message?: string }) {
  return NextResponse.json(
    { success: true, message: init?.message, data },
    { status: init?.status ?? 200 }
  );
}

export function paginated<T>(
  items: T[],
  meta: { page: number; limit: number; total: number }
) {
  return NextResponse.json({
    success: true,
    data: items,
    pagination: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: Math.max(1, Math.ceil(meta.total / meta.limit)),
    },
  });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, message, details }, { status });
}
