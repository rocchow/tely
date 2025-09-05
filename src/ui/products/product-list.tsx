import type * as Commerce from "commerce-kit";
import Image from "next/image";
import { getLocale } from "@/i18n/server";
import { formatMoney } from "@/lib/utils";
import { JsonLd, mappedProductsToJsonLd } from "@/ui/json-ld";
import { YnsLink } from "@/ui/yns-link";

export const ProductList = async ({ products }: { products: Commerce.MappedProduct[] }) => {
	const locale = await getLocale();

	// Filter out products marked as hidden
	const visibleProducts = products.filter((product) => {
		const metadata = product.metadata as typeof product.metadata & { hidden?: string | boolean };
		return !metadata.hidden && product.metadata.slug && product.metadata.slug !== "hidden";
	});

	return (
		<>
			<ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{visibleProducts.map((product, idx) => {
					return (
						<li key={product.id} className="group">
							<YnsLink
								href={`/product/${product.metadata.slug}`}
								className="block min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
							>
								<article className="overflow-hidden bg-white rounded-lg transition-transform active:scale-95">
									{product.images[0] && (
										<div className="rounded-lg aspect-square w-full overflow-hidden bg-neutral-100">
											<Image
												className="group-hover:rotate hover-perspective w-full bg-neutral-100 object-cover object-center transition-opacity group-hover:opacity-75"
												src={product.images[0]}
												width={768}
												height={768}
												loading={idx < 3 ? "eager" : "lazy"}
												priority={idx < 3}
												sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 400px"
												alt={`${product.name} product image`}
											/>
										</div>
									)}
									<div className="p-2 sm:p-4">
										<h2 className="text-sm sm:text-lg lg:text-xl font-medium text-neutral-700 line-clamp-2 leading-tight">
											{product.name}
										</h2>
										<footer className="text-sm sm:text-base font-semibold text-neutral-900 mt-1">
											{product.default_price.unit_amount && (
												<p>
													{formatMoney({
														amount: product.default_price.unit_amount,
														currency: product.default_price.currency,
														locale,
													})}
												</p>
											)}
										</footer>
									</div>
								</article>
							</YnsLink>
						</li>
					);
				})}
			</ul>
			<JsonLd jsonLd={mappedProductsToJsonLd(visibleProducts)} />
		</>
	);
};
