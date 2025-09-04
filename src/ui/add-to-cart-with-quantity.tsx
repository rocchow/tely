"use client";

import { useState } from "react";
import { AddToCartButton } from "@/ui/add-to-cart-button";
import { QuantitySelector } from "@/ui/quantity-selector";

interface AddToCartWithQuantityProps {
	productId: string;
	disabled?: boolean;
	className?: string;
}

export function AddToCartWithQuantity({ productId, disabled, className }: AddToCartWithQuantityProps) {
	const [quantity, setQuantity] = useState(1);

	return (
		<div className={`space-y-4 ${className || ""}`}>
			<div>
				<label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
					Quantity
				</label>
				<QuantitySelector initialQuantity={1} onQuantityChange={setQuantity} className="w-32" />
			</div>
			<AddToCartButton productId={productId} quantity={quantity} disabled={disabled} className="w-full" />
		</div>
	);
}
