"use client";

import type * as Commerce from "commerce-kit";
import Image from "next/image";
import { formatMoney } from "@/lib/utils";
import { YnsLink } from "@/ui/yns-link";

export const ProductList = ({ products }: { products: Commerce.MappedProduct[] }) => {
	// Filter out products marked as hidden
	const visibleProducts = products.filter((product) => {
		const metadata = product.metadata as typeof product.metadata & { hidden?: string | boolean };
		return !metadata.hidden && product.metadata.slug && product.metadata.slug !== "hidden";
	});

	return (
		<>
			<ul className="max-w-(--breakpoint-lg) grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{visibleProducts.map((product, idx) => {
					return (
						<li key={product.id} className="group">
							<YnsLink href={`/product/${product.metadata.slug}`}>
								<article className="overflow-hidden rounded border bg-white">
									{product.images[0] && (
										<div className="aspect-square w-full overflow-hidden bg-neutral-100">
											<Image
												className="group-hover:rotate hover-perspective w-full bg-neutral-100 object-cover object-center transition-opacity group-hover:opacity-75"
												src={product.images[0]}
												width={768}
												height={768}
												loading={idx < 3 ? "eager" : "lazy"}
												priority={idx < 3}
												sizes="(max-width: 1024x) 100vw, (max-width: 1280px) 50vw, 700px"
												alt=""
											/>
										</div>
									)}
									<div className="p-2 sm:p-4">
										<h2 className="text-sm sm:text-lg font-semibold text-neutral-700 line-clamp-2">
											{product.name}
										</h2>
										<footer className="text-sm font-medium text-neutral-900">
											{product.default_price.unit_amount && (
												<p>
													{formatMoney({
														amount: product.default_price.unit_amount,
														currency: product.default_price.currency,
														locale: "en-US",
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
		</>
	);
};
