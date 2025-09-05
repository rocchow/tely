import type * as Commerce from "commerce-kit";
import { formatMoney } from "commerce-kit/currencies";
import { cn } from "@/lib/utils";
import { MainProductImage } from "@/ui/products/main-product-image";
import { AddToCartButton } from "./add-to-cart-button";

export const ProductBottomStickyCard = ({
	product,
	locale,
	show,
}: {
	product: Commerce.MappedProduct;
	locale: string;
	show: boolean;
}) => {
	return (
		<div
			tabIndex={show ? 0 : -1}
			className={cn(
				"fixed bottom-0 max-w-[100vw] left-0 right-0 bg-white/95 backdrop-blur-sm border-t py-3 sm:py-4 transition-all duration-300 ease-out z-10 safe-area-inset-bottom",
				show
					? "transform translate-y-0 shadow-[0_-4px_6px_-1px_rgb(0_0_0_/_0.1),_0_-2px_4px_-2px_rgb(0_0_0_/_0.1)]"
					: "transform translate-y-full",
			)}
		>
			<div className="mx-auto w-full max-w-7xl gap-x-2 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
				<div className="flex items-center gap-x-2 sm:gap-x-4 min-w-0">
					<div className="shrink-0">
						{product.images[0] && (
							<MainProductImage
								className="w-16 h-16 rounded-lg bg-neutral-100 object-cover object-center"
								src={product.images[0]}
								loading="eager"
								priority
								alt=""
							/>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-sm sm:text-base md:text-lg whitespace-nowrap text-ellipsis overflow-clip">
							{product.name}
						</h3>

						{product.default_price.unit_amount && (
							<p className="text-sm sm:text-base font-medium text-neutral-700">
								{formatMoney({
									amount: product.default_price.unit_amount,
									currency: product.default_price.currency,
									locale,
								})}
							</p>
						)}
					</div>
				</div>

				<AddToCartButton
					productId={product.id}
					disabled={product.metadata.stock <= 0}
					className="px-4 text-sm sm:text-base sm:px-8 shrink-0 min-h-[44px] sm:h-12 font-medium"
				/>
			</div>
		</div>
	);
};
