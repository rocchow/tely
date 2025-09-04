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

		// Initialize Stripe
		const stripe = Commerce.provider({
			tagPrefix: undefined,
			secretKey: env.STRIPE_SECRET_KEY,
			cache: "no-store",
		});

		// Get current product to preserve existing metadata
		const currentProduct = await stripe.products.retrieve(productId);

		// Collect all image files from formData
		const imageFiles: File[] = [];
		let index = 0;
		while (formData.get(`image${index}`)) {
			const file = formData.get(`image${index}`) as File;
			if (file) {
				imageFiles.push(file);
			}
			index++;
		}

		if (imageFiles.length === 0) {
			return NextResponse.json({ error: "No images provided" }, { status: 400 });
		}

		// Upload images to Stripe Files API
		const uploadedImages: string[] = [];

		for (const file of imageFiles) {
			// Convert File to Buffer
			const buffer = Buffer.from(await file.arrayBuffer());

			// Upload to Stripe Files API
			const stripeFile = await stripe.files.create({
				file: {
					data: buffer,
					name: file.name,
					type: file.type,
				},
				purpose: "business_icon",
			});

			if (stripeFile.url) {
				uploadedImages.push(stripeFile.url);
			}
		}

		// Prepare metadata with additional images
		const newMetadata: Record<string, string> = { ...currentProduct.metadata };

		// Find the next available image slot (image2, image3, etc.)
		let imageSlot = 2; // Start from image2 since image1 is typically the main image
		for (const imageUrl of uploadedImages) {
			// Find next available slot
			while (newMetadata[`image${imageSlot}`]) {
				imageSlot++;
			}
			newMetadata[`image${imageSlot}`] = imageUrl;
			imageSlot++;
		}

		// Update the product with new metadata
		await stripe.products.update(productId, {
			metadata: newMetadata,
		});

		// If this is the first image and there's no main image, set it as the main image
		if ((!currentProduct.images || currentProduct.images.length === 0) && uploadedImages.length > 0) {
			await stripe.products.update(productId, {
				images: [uploadedImages[0]!], // We know this exists because we checked length > 0
			});
		}

		return NextResponse.json({
			success: true,
			message: `Successfully uploaded ${uploadedImages.length} images`,
			imageUrls: uploadedImages,
		});
	} catch (error) {
		console.error("Error uploading product images:", error);
		return NextResponse.json({ error: "Failed to upload images. Please try again." }, { status: 500 });
	}
}
