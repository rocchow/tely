import * as Commerce from "commerce-kit";
import Image from "next/image";
import type { Metadata } from "next/types";
import { publicUrl } from "@/env.mjs";
import { getTranslations } from "@/i18n/server";
import { ProductList } from "@/ui/products/product-list";
import { YnsLink } from "@/ui/yns-link";

export const metadata = {
	alternates: { canonical: publicUrl },
} satisfies Metadata;

export default async function Home() {
	const products = await Commerce.productBrowse({ first: 6 });
	const t = await getTranslations("/");

	return (
		<main>
			<section className="rounded bg-neutral-100 py-8 sm:py-12">
				<div className="mx-auto grid grid-cols-1 items-center justify-items-center gap-6 sm:gap-8 px-6 sm:px-8 md:px-16 md:grid-cols-2">
					<div className="max-w-md space-y-4 text-center md:text-left">
						<h2 className="text-balance text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
							{t("hero.title")}
						</h2>
						<p className="text-pretty text-neutral-600 text-base sm:text-lg">{t("hero.description")}</p>
						<YnsLink
							className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-neutral-900 px-8 font-medium text-neutral-50 transition-all hover:bg-neutral-900/90 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-95"
							href={t("hero.link")}
						>
							{t("hero.action")}
						</YnsLink>
					</div>
					<Image
						alt="AsianPowder Beauty Products - Premium Quality Cosmetics"
						loading="eager"
						priority={true}
						className="rounded"
						height={450}
						width={1125}
						src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
						style={{
							objectFit: "cover",
						}}
						sizes="(max-width: 640px) 70vw, 450px"
					/>
				</div>
			</section>

			<ProductList products={products} />
		</main>
	);
}
