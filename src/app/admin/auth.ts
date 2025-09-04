import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

// Simple admin authentication
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "tely2024!";
const ADMIN_SESSION_TOKEN = "admin_session";

export async function checkAdminAuth(): Promise<boolean> {
	const cookieStore = await cookies();
	const sessionToken = cookieStore.get(ADMIN_SESSION_TOKEN);

	// Check if session token exists and is valid
	return sessionToken?.value === "authenticated";
}

export async function setAdminSession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(ADMIN_SESSION_TOKEN, "authenticated", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 60 * 24, // 24 hours
	});
}

export async function clearAdminSession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(ADMIN_SESSION_TOKEN);
}

export function validateAdminCredentials(username: string, password: string): boolean {
	return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function requireAdminAuth(request?: NextRequest): Promise<NextResponse | null> {
	const isAuthenticated = await checkAdminAuth();

	if (!isAuthenticated) {
		const url = request
			? new URL("/admin/login", request.url)
			: new URL("/admin/login", process.env.NEXT_PUBLIC_URL || "http://localhost:3000");
		return NextResponse.redirect(url);
	}

	return null;
}
