"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleLogout = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/admin/logout", {
				method: "POST",
			});

			if (response.ok) {
				router.push("/admin/login");
				router.refresh();
			}
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			onClick={handleLogout}
			disabled={loading}
			className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
		>
			{loading ? "Logging out..." : "Logout"}
		</button>
	);
}
