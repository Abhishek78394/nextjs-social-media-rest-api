import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function middleware(NextRequest) {
  const url = NextRequest.nextUrl;
  const isLoginSignup =
    url.pathname.includes("/login") || url.pathname.includes("/sign-up");
  const isApi = url.pathname.includes("/api");

  if (isLoginSignup) {
    return NextResponse.next();
  }

  const token = cookies().get("token");
  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: "Access denied" }, { status: 401 });
    } else {
      return NextResponse.next();
    }
  } else {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/', '/profile',],
};