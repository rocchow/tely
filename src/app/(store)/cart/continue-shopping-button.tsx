"use client";

import { Button } from "@/components/ui/button";
import { useCartModal } from "@/context/cart-modal";

export function ContinueShoppingButton() {
	const { setOpen } = useCartModal();

	return (
		<Button
			variant="outline"
			size="sm"
			className="w-full rounded-md text-sm"
			onClick={() => {
				setOpen(false);
			}}
		>
			Continue Shopping
		</Button>
	);
}
