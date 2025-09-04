import * as Commerce from "commerce-kit";
import { redirect } from "next/navigation";
import { checkAdminAuth } from "../auth";
import { ProductImageUploader } from "./product-image-uploader";

export default async function AdminProductsPage() {
	const isAuthenticated = await checkAdminAuth();

	if (!isAuthenticated) {
		redirect("/admin/login");
	}
	const products = await Commerce.productBrowse({ first: 100 });

	return (
		<div className="container mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold mb-8">Product Image Management</h1>
			<p className="text-gray-600 mb-8">
				Upload multiple images for your products. The first image will be the main product image, additional
				images will be stored in metadata for gallery display.
			</p>

			<div className="grid gap-8">
				{products.map((product) => (
					<div key={product.id} className="border rounded-lg p-6 bg-white shadow-sm">
						<div className="flex items-start gap-6">
							{/* Current Product Info */}
							<div className="flex-shrink-0">
								{product.images[0] && (
									<img
										src={product.images[0]}
										alt={product.name}
										className="w-24 h-24 object-cover rounded-lg border"
									/>
								)}
							</div>

							<div className="flex-grow">
								<h3 className="text-xl font-semibold mb-2">{product.name}</h3>
								<p className="text-gray-600 mb-4">ID: {product.id}</p>
								<p className="text-sm text-gray-500 mb-4">
									Slug: {product.metadata.slug} | Category: {product.metadata.category}
								</p>

								{/* Image Uploader Component */}
								<ProductImageUploader product={product} />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
