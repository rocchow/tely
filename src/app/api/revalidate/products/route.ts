import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	try {
		// Revalidate product-related caches
		revalidateTag("search");
		revalidateTag("products");
		revalidateTag("getRecommendedProducts");

		// You can also revalidate specific product tags if needed
		// revalidateTag(`product-${productId}`);

		return Response.json({
			message: "Product cache revalidated successfully",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error revalidating product cache:", error);
		return Response.json({ error: "Failed to revalidate cache" }, { status: 500 });
	}
}

// Optional: Add GET method for easy browser testing
export async function GET() {
	return POST(new NextRequest("http://localhost:3000/api/revalidate/products"));
}
