import { calculateCartTotalNetWithoutShipping } from "commerce-kit";
import Image from "next/image";
import { getCartFromCookiesAction } from "@/actions/cart-actions";
import { Button } from "@/components/ui/button";
import { getLocale, getTranslations } from "@/i18n/server";
import { formatMoney, formatProductName } from "@/lib/utils";
import { YnsLink } from "@/ui/yns-link";
import { CartAsideContainer } from "./cart-aside";
import { ContinueShoppingButton } from "./continue-shopping-button";

export async function CartModalPage() {
	// const searchParams = await props.searchParams;
	const originalCart = await getCartFromCookiesAction();
	// TODO fix type
	// const cart = await Commerce.cartAddOptimistic({ add: searchParams.add, cart: originalCart! });
	const cart = originalCart;

	if (!cart || cart.lines.length === 0) {
		return null;
	}

	const currency = cart.lines[0]!.product.default_price.currency;
	const total = calculateCartTotalNetWithoutShipping(cart);
	const t = await getTranslations("/cart.modal");
	const locale = await getLocale();

	return (
		<CartAsideContainer>
			<div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4">
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-sm font-semibold text-neutral-700">{t("title")}</h2>
					<YnsLink replace href="/cart" className="text-xs text-muted-foreground underline">
						{t("openFullView")}
					</YnsLink>
				</div>

				<div className="mt-3">
					<ul role="list" className="-my-3 divide-y divide-neutral-200">
						{cart.lines.map((line) => (
							<li
								key={line.product.id}
								className="grid grid-cols-[3rem_1fr_max-content] grid-rows-[auto_auto] gap-x-3 gap-y-1 py-3"
							>
								{line.product.images[0] ? (
									<div className="col-span-1 row-span-2 bg-neutral-100">
										<Image
											className="aspect-square rounded-md object-cover"
											src={line.product.images[0]}
											width={48}
											height={48}
											alt=""
										/>
									</div>
								) : (
									<div className="col-span-1 row-span-2" />
								)}

								<h3 className="-mt-1 text-sm font-medium leading-tight">
									{formatProductName(line.product.name, line.product.metadata.variant)}
								</h3>
								<p className="text-xs font-medium leading-none">
									{formatMoney({
										amount: line.product.default_price.unit_amount ?? 0,
										currency: line.product.default_price.currency,
										locale,
									})}
								</p>
								<p className="self-end text-xs font-medium text-muted-foreground">
									{t("quantity", { quantity: line.quantity })}
								</p>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className="border-t border-neutral-200 px-3 py-3 sm:px-4">
				<div
					id="cart-overlay-description"
					className="flex justify-between text-sm font-medium text-neutral-900"
				>
					<p>{t("total")}</p>
					<p>
						{formatMoney({
							amount: total,
							currency,
							locale,
						})}
					</p>
				</div>
				<p className="mt-1 text-xs text-neutral-500">{t("shippingAndTaxesInfo")}</p>
				<div className="mt-3 space-y-2">
					<Button asChild={true} size={"sm"} className="w-full rounded-md text-sm">
						<YnsLink href="/cart">{t("goToPaymentButton")}</YnsLink>
					</Button>
					<ContinueShoppingButton />
				</div>
			</div>
			{/* {searchParams.add && <CartModalAddSideEffect productId={searchParams.add} />} } */}
		</CartAsideContainer>
	);
}
