import { YnsLink } from "@/ui/yns-link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Simple Admin Header */}
			<header className="bg-white shadow-sm border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<YnsLink href="/" className="text-xl font-bold">
								TELY Admin
							</YnsLink>
							<nav className="flex space-x-4">
								<YnsLink
									href="/admin/products"
									className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
								>
									Products
								</YnsLink>
							</nav>
						</div>
						<YnsLink href="/" className="text-sm text-gray-500 hover:text-gray-700">
							← Back to Store
						</YnsLink>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto py-8">{children}</main>
		</div>
	);
}
