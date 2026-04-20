import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Auth is temporarily disabled while dashboard setup is in progress.
  // Keep middleware active but bypass all session checks and redirects.
  return NextResponse.next({ request });
}
