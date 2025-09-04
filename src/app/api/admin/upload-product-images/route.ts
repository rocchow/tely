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

		// Add more detailed logging
		console.log(`Processing upload for product: ${productId}`);
		console.log(`Number of images to upload: ${formData.getAll("images").length}`);

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
			try {
				console.log(`Uploading file: ${file.name} (${file.type}, ${file.size} bytes)`);

				// Convert File to Buffer
				const buffer = Buffer.from(await file.arrayBuffer());
				console.log(`Buffer created, size: ${buffer.length} bytes`);

				// Upload to Stripe Files API
				console.log("Starting Stripe file upload...");
				const stripeFile = await stripe.files.create({
					file: {
						data: buffer,
						name: file.name,
						type: file.type,
					},
					purpose: "dispute_evidence",
				});

				console.log(`Stripe file uploaded successfully: ${stripeFile.id}`);
				if (stripeFile.url) {
					uploadedImages.push(stripeFile.url);
					console.log(`File URL added: ${stripeFile.url}`);
				}
			} catch (fileError) {
				console.error(`Failed to upload file ${file.name}:`, fileError);
				// Continue with other files instead of failing completely
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
