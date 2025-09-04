"use server";

import * as Commerce from "commerce-kit";
import { revalidateTag } from "next/cache";
import { clearCartCookie, getCartCookieJson, setCartCookieJson } from "@/lib/cart";

export async function getCartFromCookiesAction() {
	const cartJson = await getCartCookieJson();
	if (!cartJson) {
		return null;
	}

	try {
		// Since we're now using payment intent IDs, try to get the payment intent instead
		const stripe = Commerce.provider({
			secretKey: process.env.STRIPE_SECRET_KEY,
			tagPrefix: undefined,
			cache: "no-store",
		});

		const paymentIntent = await stripe.paymentIntents.retrieve(cartJson.id, {
			expand: ["payment_method", "customer"],
		});

		if (paymentIntent) {
			// Create a mock cart structure from the payment intent
			const productIds = paymentIntent.metadata.productIds;
			const productQuantities = paymentIntent.metadata.productQuantities;

			if (productIds) {
				const productIdArray = productIds.split(",");
				const quantityArray = productQuantities
					? productQuantities.split(",").map((q) => parseInt(q, 10))
					: [];
				const lines = [];

				// Retrieve all products in the cart
				for (let i = 0; i < productIdArray.length; i++) {
					const productId = productIdArray[i];
					const quantity = quantityArray[i] || 1; // Default to 1 if quantity not found

					const product = await stripe.products.retrieve(productId.trim(), {
						expand: ["default_price"],
					});

					lines.push({
						product: JSON.parse(JSON.stringify(product)), // Serialize for client safety
						quantity: quantity,
					});
				}

				const mockCart = {
					id: paymentIntent.id,
					cart: {
						id: paymentIntent.id,
						client_secret: paymentIntent.client_secret,
						currency: paymentIntent.currency,
						amount: paymentIntent.amount,
						metadata: paymentIntent.metadata,
						taxBreakdown: [], // Add empty tax breakdown to prevent errors
					},
					lines: lines,
					metadata: {
						productCount: lines.length,
					},
				};

				return structuredClone(mockCart);
			}
		}
	} catch (error) {
		// Silently handle cart retrieval errors
		console.error("Cart retrieval error:", error);
	}

	return null;
}

export async function setInitialCartCookiesAction(cartId: string, linesCount: number) {
	await setCartCookieJson({
		id: cartId,
		linesCount,
	});
	revalidateTag(`cart-${cartId}`);
}

export async function findOrCreateCartIdFromCookiesAction() {
	const cart = await getCartFromCookiesAction();
	if (cart) {
		return structuredClone(cart);
	}

	// Create a simple cart ID for our custom system
	// We'll create an actual payment intent when items are added
	const cartId = `temp_cart_${Date.now()}`;
	await setCartCookieJson({
		id: cartId,
		linesCount: 0,
	});

	return cartId;
}

export async function clearCartCookieAction() {
	const cookie = await getCartCookieJson();
	if (!cookie) {
		return;
	}

	await clearCartCookie();
	revalidateTag(`cart-${cookie.id}`);
	// FIXME not ideal, revalidate per domain instead (multi-tenant)
	revalidateTag(`admin-orders`);
}

export async function addToCartAction(formData: FormData) {
	try {
		const productId = formData.get("productId");
		const quantityStr = formData.get("quantity");

		if (!productId || typeof productId !== "string") {
			throw new Error("Invalid product ID");
		}

		const quantity = quantityStr ? parseInt(quantityStr.toString(), 10) : 1;
		if (isNaN(quantity) || quantity < 1) {
			throw new Error("Invalid quantity");
		}

		const stripe = Commerce.provider({
			secretKey: process.env.STRIPE_SECRET_KEY,
			tagPrefix: undefined,
			cache: "no-store",
		});

		// Get the product details
		const product = await stripe.products.retrieve(productId, {
			expand: ["default_price"],
		});

		if (!product.default_price || typeof product.default_price === "string") {
			throw new Error("Product price not found");
		}

		// Check if there's an existing cart
		const existingCart = await getCartFromCookiesAction();
		let paymentIntent;
		let cartLines = [];
		let totalAmount = product.default_price.unit_amount || 0;

		if (existingCart?.cart.client_secret) {
			// Update existing payment intent

			// Add to existing lines
			cartLines = [...existingCart.lines];

			// Check if product already exists in cart
			const existingLineIndex = cartLines.findIndex((line) => line.product.id === productId);
			if (existingLineIndex >= 0) {
				// Increase quantity by the requested amount
				cartLines[existingLineIndex].quantity += quantity;
			} else {
				// Add new product line with requested quantity
				cartLines.push({
					product: JSON.parse(JSON.stringify(product)),
					quantity: quantity,
				});
			}

			// Calculate new total amount
			totalAmount = cartLines.reduce((total, line) => {
				const price =
					typeof line.product.default_price === "object" ? line.product.default_price.unit_amount || 0 : 0;
				return total + price * line.quantity;
			}, 0);

			// Update the payment intent with new amount and metadata
			paymentIntent = await stripe.paymentIntents.update(existingCart.id, {
				amount: totalAmount,
				metadata: {
					...existingCart.cart.metadata,
					productIds: cartLines.map((line) => line.product.id).join(","),
					productQuantities: cartLines.map((line) => line.quantity).join(","),
					productCount: cartLines.length.toString(),
				},
			});
		} else {
			// Create new payment intent

			cartLines = [
				{
					product: JSON.parse(JSON.stringify(product)),
					quantity: quantity,
				},
			];

			// Calculate total amount for new cart
			totalAmount = (product.default_price.unit_amount || 0) * quantity;

			paymentIntent = await stripe.paymentIntents.create({
				amount: totalAmount,
				currency: product.default_price.currency,
				metadata: {
					productIds: productId,
					productQuantities: quantity.toString(),
					productCount: "1",
				},
			});
		}

		// Store the payment intent ID as the cart ID
		await setCartCookieJson({
			id: paymentIntent.id,
			linesCount: cartLines.length,
		});

		revalidateTag(`cart-${paymentIntent.id}`);

		// Return updated cart structure
		return {
			id: paymentIntent.id,
			cart: {
				id: paymentIntent.id,
				client_secret: paymentIntent.client_secret,
				currency: paymentIntent.currency,
				amount: paymentIntent.amount,
				metadata: paymentIntent.metadata,
				taxBreakdown: [], // Add empty tax breakdown to prevent errors
			},
			lines: cartLines,
			metadata: {
				productCount: cartLines.length,
			},
		};
	} catch (error) {
		console.error("Add to cart error:", error);
		throw new Error("Failed to add product to cart. Please try again.");
	}
}

export async function increaseQuantity(productId: string) {
	// For our custom cart system, we'll handle quantity changes differently
	// This function is not used in our current implementation
	console.warn("increaseQuantity called but not implemented for custom cart system");
	throw new Error("Quantity changes should be handled through the add to cart action");
}

export async function decreaseQuantity(productId: string) {
	// For our custom cart system, we'll handle quantity changes differently
	// This function is not used in our current implementation
	console.warn("decreaseQuantity called but not implemented for custom cart system");
	throw new Error("Quantity changes should be handled through the add to cart action");
}

export async function setQuantity({
	productId,
	cartId,
	quantity,
}: {
	productId: string;
	cartId: string;
	quantity: number;
}) {
	// For our custom cart system, we'll handle quantity changes differently
	// This function is not used in our current implementation
	console.warn("setQuantity called but not implemented for custom cart system");
	throw new Error("Quantity changes should be handled through the add to cart action");
}

export async function commerceGPTRevalidateAction() {
	const cart = await getCartCookieJson();
	if (cart) {
		revalidateTag(`cart-${cart.id}`);
	}
}
