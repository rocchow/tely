import { type NextRequest, NextResponse } from "next/server";
import { setAdminSession, validateAdminCredentials } from "../../../admin/auth";

export async function POST(request: NextRequest) {
	try {
		const { username, password } = await request.json();

		if (!username || !password) {
			return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
		}

		if (validateAdminCredentials(username, password)) {
			await setAdminSession();
			return NextResponse.json({ success: true });
		} else {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
		}
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
