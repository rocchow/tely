import { put } from "@vercel/blob";
import * as Commerce from "commerce-kit";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env.mjs";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const productId = formData.get("productId") as string;

		if (!productId) {
			return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
		}

		console.log(`Processing upload for product: ${productId}`);

		// Initialize Stripe
		const stripe = Commerce.provider({
			tagPrefix: undefined,
			secretKey: env.STRIPE_SECRET_KEY,
			cache: "no-store",
		});

		// Get current product
		const currentProduct = await stripe.products.retrieve(productId);
		if (!currentProduct) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		// Check if Vercel Blob token is configured
		if (!env.BLOB_READ_WRITE_TOKEN) {
			return NextResponse.json(
				{
					error: "Vercel Blob Storage not configured",
					message: "Please add BLOB_READ_WRITE_TOKEN to your environment variables",
					instructions: [
						"1. Go to your Vercel dashboard",
						"2. Navigate to Storage > Blob",
						"3. Create a new Blob store if you haven't already",
						"4. Copy the BLOB_READ_WRITE_TOKEN",
						"5. Add it to your .env.local file",
						"6. Restart your development server",
					],
				},
				{ status: 400 },
			);
		}

		// Collect all image files from formData
		const imageFiles: File[] = [];
		let index = 0;
		while (formData.get(`image${index}`)) {
			const file = formData.get(`image${index}`) as File;
			if (file && file.size > 0) {
				imageFiles.push(file);
			}
			index++;
		}

		if (imageFiles.length === 0) {
			return NextResponse.json({ error: "No images provided" }, { status: 400 });
		}

		console.log(`Number of images to upload: ${imageFiles.length}`);

		// Upload images to Vercel Blob Storage
		const uploadedImageUrls: string[] = [];

		for (const file of imageFiles) {
			try {
				console.log(`Uploading file: ${file.name} (${file.type}, ${file.size} bytes)`);

				// Validate file type
				if (!file.type.startsWith("image/")) {
					throw new Error(`File ${file.name} is not an image`);
				}

				// Generate a unique filename
				const timestamp = Date.now();
				const randomId = Math.random().toString(36).substring(2, 15);
				const fileExtension = file.name.split(".").pop() || "jpg";
				const filename = `product-${productId}-${timestamp}-${randomId}.${fileExtension}`;

				console.log(`Uploading to Vercel Blob as: ${filename}`);

				// Upload to Vercel Blob Storage
				const blob = await put(filename, file, {
					access: "public",
					token: env.BLOB_READ_WRITE_TOKEN,
				});

				console.log(`Successfully uploaded to Vercel Blob: ${blob.url}`);
				uploadedImageUrls.push(blob.url);
			} catch (fileError: unknown) {
				console.error(`Failed to upload file ${file.name}:`, fileError);
				// Continue with other files instead of failing completely
			}
		}

		if (uploadedImageUrls.length === 0) {
			return NextResponse.json(
				{
					error: "No images were successfully uploaded",
				},
				{ status: 500 },
			);
		}

		// Get existing images from the product
		const existingImages = currentProduct.images || [];

		// Combine existing images with new ones
		const allImages = [...existingImages, ...uploadedImageUrls];

		console.log(`Updating product with ${allImages.length} total images`);

		// Update the Stripe product with all images
		await stripe.products.update(productId, {
			images: allImages,
		});

		console.log(`Successfully updated product ${productId} with images:`, allImages);

		return NextResponse.json({
			success: true,
			message: `Successfully uploaded ${uploadedImageUrls.length} images`,
			uploadedUrls: uploadedImageUrls,
			totalImages: allImages.length,
			allImages: allImages,
		});
	} catch (error: unknown) {
		console.error("Error uploading product images:", error);
		return NextResponse.json(
			{
				error: "Failed to upload images",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
