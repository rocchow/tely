import * as Commerce from "commerce-kit";
import { cartMetadataSchema } from "commerce-kit/internal";
import { revalidateTag } from "next/cache";
import { env } from "@/env.mjs";
import { unpackPromise } from "@/lib/utils";

export async function POST(request: Request) {
	if (!env.STRIPE_WEBHOOK_SECRET) {
		return new Response("STRIPE_WEBHOOK_SECRET is not configured", { status: 500 });
	}

	const signature = (await request.headers).get("Stripe-Signature");
	if (!signature) {
		return new Response("No signature", { status: 401 });
	}

	const stripe = Commerce.provider({
		tagPrefix: undefined,
		secretKey: undefined,
		cache: "no-store",
	});

	const [error, event] = await unpackPromise(
		stripe.webhooks.constructEventAsync(await (await request.text)(), signature, env.STRIPE_WEBHOOK_SECRET),
	);

	if (error) {
		console.error(error);
		return new Response("Invalid signature", { status: 401 });
	}

	switch (event.type) {
		case "payment_intent.succeeded":
			try {
				// Check if this is our custom cart system or the original commerce-kit system
				const metadata = event.data.object.metadata;

				// If it has our custom fields, handle it differently
				if (metadata.productIds && metadata.productQuantities) {
					console.log("Processing custom cart payment intent:", event.data.object.id);

					// Handle stock reduction for our custom cart
					const productIds = metadata.productIds.split(",");
					const quantities = metadata.productQuantities.split(",").map((q) => parseInt(q, 10));

					for (let i = 0; i < productIds.length; i++) {
						const productId = productIds[i];
						const quantity = quantities[i] || 1;

						if (!productId) {
							continue; // Skip if productId is undefined
						}

						try {
							const product = await stripe.products.retrieve(productId.trim());
							if (product && product.metadata.stock !== undefined && product.metadata.stock !== "Infinity") {
								const currentStock = parseInt(product.metadata.stock.toString(), 10);
								const newStock = Math.max(0, currentStock - quantity);

								await stripe.products.update(productId, {
									metadata: {
										...product.metadata,
										stock: newStock.toString(),
									},
								});

								revalidateTag(`product-${productId}`);
							}
						} catch (productError) {
							console.error(`Error updating stock for product ${productId}:`, productError);
						}
					}
				} else {
					// Handle original commerce-kit system
					const parsedMetadata = cartMetadataSchema.parse(metadata);
					if (parsedMetadata.taxCalculationId) {
						await stripe.tax.transactions.createFromCalculation({
							calculation: parsedMetadata.taxCalculationId,
							reference: event.data.object.id.slice(3),
						});
					}

					const products = await Commerce.getProductsFromMetadata(parsedMetadata);
					for (const { product } of products) {
						if (product && product.metadata.stock !== Infinity) {
							await stripe.products.update(product.id, {
								metadata: {
									stock: product.metadata.stock - 1,
								},
							});
							revalidateTag(`product-${product.id}`);
						}
					}
				}

				revalidateTag(`cart-${event.data.object.id}`);
			} catch (webhookError) {
				console.error("Webhook processing error:", webhookError);
				// Don't fail the webhook for processing errors
				return Response.json({ received: true, error: "Processing failed but acknowledged" });
			}

			break;

		default:
			console.log(`Unhandled event type: ${event.type}`);
	}
	return Response.json({ received: true });
}
