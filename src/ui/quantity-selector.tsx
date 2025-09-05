"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuantitySelectorProps {
	initialQuantity?: number;
	min?: number;
	max?: number;
	onQuantityChange?: (quantity: number) => void;
	className?: string;
}

export function QuantitySelector({
	initialQuantity = 1,
	min = 1,
	max = 99,
	onQuantityChange,
	className,
}: QuantitySelectorProps) {
	const [quantity, setQuantity] = useState(initialQuantity);

	const updateQuantity = (newQuantity: number) => {
		const clampedQuantity = Math.max(min, Math.min(max, newQuantity));
		setQuantity(clampedQuantity);
		onQuantityChange?.(clampedQuantity);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		if (!isNaN(value)) {
			updateQuantity(value);
		}
	};

	const increment = () => updateQuantity(quantity + 1);
	const decrement = () => updateQuantity(quantity - 1);

	return (
		<div className={`flex items-center space-x-3 ${className || ""}`}>
			<Button
				type="button"
				variant="outline"
				size="icon"
				onClick={decrement}
				disabled={quantity <= min}
				className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-lg active:scale-95 transition-transform"
			>
				<Minus className="h-4 w-4 sm:h-5 sm:w-5" />
				<span className="sr-only">Decrease quantity</span>
			</Button>
			<div className="flex-1 min-w-0">
				<Input
					type="number"
					value={quantity}
					onChange={handleInputChange}
					min={min}
					max={max}
					className="h-10 sm:h-12 w-full text-center text-base sm:text-lg font-medium border-2 focus:border-primary"
				/>
			</div>
			<Button
				type="button"
				variant="outline"
				size="icon"
				onClick={increment}
				disabled={quantity >= max}
				className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-lg active:scale-95 transition-transform"
			>
				<Plus className="h-4 w-4 sm:h-5 sm:w-5" />
				<span className="sr-only">Increase quantity</span>
			</Button>
		</div>
	);
}
