// import { ProductModel3D } from "@/app/(store)/product/[slug]/product-model3d";

import * as Commerce from "commerce-kit";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";
import { ProductImageModal } from "@/app/(store)/product/[slug]/product-image-modal";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { publicUrl } from "@/env.mjs";
import { getLocale, getTranslations } from "@/i18n/server";
import { getRecommendedProducts } from "@/lib/search/trieve";
import { cn, deslugify, formatMoney, formatProductName } from "@/lib/utils";
import type { TrieveProductMetadata } from "@/scripts/upload-trieve";
import { AddToCartWithQuantity } from "@/ui/add-to-cart-with-quantity";
import { JsonLd, mappedProductToJsonLd } from "@/ui/json-ld";
import { Markdown } from "@/ui/markdown";
import { ProductImageGallery } from "@/ui/products/product-image-gallery";
import { StickyBottom } from "@/ui/sticky-bottom";
import { YnsLink } from "@/ui/yns-link";

export const generateMetadata = async (props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ variant?: string }>;
}): Promise<Metadata> => {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const variants = await Commerce.productGet({ slug: params.slug });

	const selectedVariant = searchParams.variant || variants[0]?.metadata.variant;
	const product = variants.find((variant) => variant.metadata.variant === selectedVariant);
	if (!product) {
		return notFound();
	}
	const t = await getTranslations("/product.metadata");

	const canonical = new URL(`${publicUrl}/product/${product.metadata.slug}`);
	if (selectedVariant) {
		canonical.searchParams.set("variant", selectedVariant);
	}

	const productName = formatProductName(product.name, product.metadata.variant);

	return {
		title: t("title", { productName }),
		description: product.description,
		alternates: { canonical },
	} satisfies Metadata;
};

export default async function SingleProductPage(props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ variant?: string; image?: string }>;
}) {
	const params = await props.params;
	const searchParams = await props.searchParams;

	const variants = await Commerce.productGet({ slug: params.slug });
	const selectedVariant = (variants.length > 1 && searchParams.variant) || variants[0]?.metadata.variant;
	const product = variants.find((variant) => variant.metadata.variant === selectedVariant);

	if (!product) {
		return notFound();
	}

	const t = await getTranslations("/product.page");
	const locale = await getLocale();

	const category = product.metadata.category;

	// Combine main product images with additional images from metadata
	const additionalImages = Object.entries(product.metadata)
		.filter(([key]) => key.startsWith("image") && key !== "image1")
		.sort(([a], [b]) => {
			const numA = parseInt(a.replace("image", ""), 10);
			const numB = parseInt(b.replace("image", ""), 10);
			return numA - numB;
		})
		.map(([, value]) => value)
		.filter((url): url is string => typeof url === "string" && url.startsWith("http"));

	const images = [...product.images, ...additionalImages];

	return (
		<article className="pb-12">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild className="inline-flex min-h-12 min-w-12 items-center justify-center">
							<YnsLink href="/products">{t("allProducts")}</YnsLink>
						</BreadcrumbLink>
					</BreadcrumbItem>
					{category && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink className="inline-flex min-h-12 min-w-12 items-center justify-center" asChild>
									<YnsLink href={`/category/${category}`}>{deslugify(category)}</YnsLink>
								</BreadcrumbLink>
							</BreadcrumbItem>
						</>
					)}
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{product.name}</BreadcrumbPage>
					</BreadcrumbItem>
					{selectedVariant && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{deslugify(selectedVariant)}</BreadcrumbPage>
							</BreadcrumbItem>
						</>
					)}
				</BreadcrumbList>
			</Breadcrumb>

			<StickyBottom product={product} locale={locale}>
				<div className="mt-4 grid gap-6 lg:grid-cols-12">
					<div className="lg:col-span-5 lg:col-start-8">
						<h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-foreground">
							{product.name}
						</h1>
						{product.default_price.unit_amount && (
							<p className="mt-3 text-xl sm:text-2xl font-semibold leading-none tracking-tight text-foreground/90">
								{formatMoney({
									amount: product.default_price.unit_amount,
									currency: product.default_price.currency,
									locale,
								})}
							</p>
						)}
						<div className="mt-2">
							{product.metadata.stock <= 0 && <div className="text-red-600 font-medium">Out of stock</div>}
						</div>
					</div>

					<div className="lg:col-span-7 lg:row-span-3 lg:row-start-1">
						<h2 className="sr-only">{t("imagesTitle")}</h2>

						<ProductImageGallery images={images} productName={product.name} className="w-full" />
					</div>

					<div className="grid gap-6 sm:gap-8 lg:col-span-5">
						<section>
							<h2 className="sr-only">{t("descriptionTitle")}</h2>
							<div className="prose prose-sm sm:prose text-secondary-foreground max-w-none">
								<Markdown source={product.description || ""} />
							</div>
						</section>

						{variants.length > 1 && (
							<div className="grid gap-3">
								<p className="text-base font-semibold" id="variant-label">
									{t("variantTitle")}
								</p>
								<ul
									role="list"
									className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
									aria-labelledby="variant-label"
								>
									{variants.map((variant) => {
										const isSelected = selectedVariant === variant.metadata.variant;
										return (
											variant.metadata.variant && (
												<li key={variant.id}>
													<YnsLink
														scroll={false}
														prefetch={true}
														href={`/product/${variant.metadata.slug}?variant=${variant.metadata.variant}`}
														className={cn(
															"flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-all hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95",
															isSelected && "border-black bg-neutral-50 font-semibold shadow-sm",
														)}
														aria-selected={isSelected}
													>
														{deslugify(variant.metadata.variant)}
													</YnsLink>
												</li>
											)
										);
									})}
								</ul>
							</div>
						)}

						<AddToCartWithQuantity productId={product.id} disabled={product.metadata.stock <= 0} />
					</div>
				</div>
			</StickyBottom>

			<Suspense>
				<SimilarProducts id={product.id} />
			</Suspense>

			<Suspense>
				<ProductImageModal images={images} />
			</Suspense>

			<JsonLd jsonLd={mappedProductToJsonLd(product)} />
		</article>
	);
}

async function SimilarProducts({ id }: { id: string }) {
	const products = await getRecommendedProducts({ productId: id, limit: 4 });

	if (!products) {
		return null;
	}

	return (
		<section className="py-8 sm:py-12">
			<div className="mb-6 sm:mb-8">
				<h2 className="text-xl sm:text-2xl font-bold tracking-tight">You May Also Like</h2>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
				{products.map((product) => {
					const trieveMetadata = product.metadata as TrieveProductMetadata;
					return (
						<div key={product.tracking_id} className="bg-card rounded-lg overflow-hidden shadow-sm group">
							{trieveMetadata.image_url && (
								<YnsLink
									href={`${publicUrl}${product.link}`}
									className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
									prefetch={false}
								>
									<Image
										className={
											"w-full aspect-square rounded-t-lg bg-neutral-100 object-cover object-center group-hover:opacity-80 transition-all group-active:scale-95"
										}
										src={trieveMetadata.image_url}
										width={300}
										height={300}
										sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"
										alt={`${trieveMetadata.name} product image`}
									/>
								</YnsLink>
							)}
							<div className="p-2 sm:p-4">
								<h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 line-clamp-2">
									<YnsLink
										href={product.link || "#"}
										className="hover:text-primary focus:outline-none focus:text-primary"
										prefetch={false}
									>
										{trieveMetadata.name}
									</YnsLink>
								</h3>
								<div className="flex items-center justify-between">
									<span className="text-sm sm:text-base font-medium text-neutral-900">
										{formatMoney({
											amount: trieveMetadata.amount,
											currency: trieveMetadata.currency,
										})}
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
