"use client";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { addToCartAction } from "@/actions/cart-actions";
import { Button } from "@/components/ui/button";
import { useCartModal } from "@/context/cart-modal";
import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";

export const AddToCartButton = ({
	productId,
	quantity = 1,
	disabled,
	className,
}: {
	productId: string;
	quantity?: number;
	disabled?: boolean;
	className?: string;
}) => {
	const t = useTranslations("Global.addToCart");
	const [pending, startTransition] = useTransition();
	const isDisabled = disabled || pending;
	const { setOpen } = useCartModal();

	return (
		<Button
			id="button-add-to-cart"
			size="lg"
			type="submit"
			className={cn("rounded-full text-lg relative", className)}
			onClick={(e) => {
				if (isDisabled) {
					e.preventDefault();
					return;
				}

				startTransition(async () => {
					try {
						const formData = new FormData();
						formData.append("productId", productId);
						formData.append("quantity", quantity.toString());
						await addToCartAction(formData);
						toast.success(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart!`);
						// Only open cart modal after successful add
						setOpen(true);
					} catch (error) {
						console.error("Add to cart error:", error);
						const errorMessage = error instanceof Error ? error.message : "Failed to add product to cart";
						toast.error(errorMessage);
					}
				});
			}}
			aria-disabled={isDisabled}
		>
			<span className={cn("transition-opacity ease-in", pending ? "opacity-0" : "opacity-100")}>
				{disabled ? t("disabled") : t("actionButton")}
			</span>
			<span
				className={cn(
					"ease-out transition-opacity pointer-events-none absolute z-10",
					pending ? "opacity-100" : "opacity-0",
				)}
			>
				<Loader2Icon className="h-4 w-4 animate-spin" />
			</span>
		</Button>
	);
};
