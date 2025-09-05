import type { SVGAttributes } from "react";
import { getTranslations } from "@/i18n/server";
import StoreConfig from "@/store.config";
import { Newsletter } from "@/ui/footer/newsletter.client";
import { YnsLink } from "@/ui/yns-link";

const sections = [
	{
		header: "Products",
		links: StoreConfig.categories.map(({ name, slug }) => ({
			label: name,
			href: `/category/${slug}`,
		})),
	},
	{
		header: "Support",
		links: [
			{
				label: "Contact Us",
				href: "mailto:support@asianpowder.com",
			},
			{
				label: "Shipping Info",
				href: "/shipping",
			},
			{
				label: "Returns",
				href: "/returns",
			},
		],
	},
];

export async function Footer() {
	const t = await getTranslations("Global.footer");

	return (
		<footer className="w-full bg-neutral-50 p-6 text-neutral-800 md:py-12">
			<div className="container flex max-w-7xl flex-col gap-8 text-sm sm:flex-row sm:justify-between sm:gap-16">
				<div className="w-full sm:w-auto">
					<div className="flex w-full max-w-sm flex-col gap-3">
						<h3 className="font-semibold text-base">{t("newsletterTitle")}</h3>
						<Newsletter />
					</div>
				</div>

				<nav className="grid grid-cols-2 gap-8 sm:gap-16 w-full sm:w-auto">
					{sections.map((section) => (
						<section key={section.header}>
							<h3 className="mb-3 font-semibold text-base">{section.header}</h3>
							<ul role="list" className="grid gap-2">
								{section.links.map((link) => (
									<li key={link.label}>
										<YnsLink
											className="inline-flex min-h-[44px] items-center underline-offset-4 hover:underline focus:outline-none focus:underline"
											href={link.href}
										>
											{link.label}
										</YnsLink>
									</li>
								))}
							</ul>
						</section>
					))}
				</nav>
			</div>
			<div className="container mt-8 flex max-w-7xl flex-col items-center justify-between gap-6 text-sm text-neutral-500 md:flex-row">
				<div className="text-center md:text-left">
					<p>© 2024 AsianPowder Beauty</p>
					<p>Authentic Asian beauty for everyone</p>
				</div>
				<div className="flex items-center gap-6">
					<YnsLink
						className="inline-flex min-h-[44px] items-center gap-2 transition-colors hover:text-neutral-700 focus:outline-none focus:text-neutral-700"
						href="https://x.com/asianpowder"
					>
						<TwitterIcon className="h-4 w-4" /> @asianpowder
						<span className="sr-only">Twitter</span>
					</YnsLink>
					<YnsLink
						className="inline-flex min-h-[44px] items-center gap-2 transition-colors hover:text-neutral-700 focus:outline-none focus:text-neutral-700"
						href="https://instagram.com/asianpowder"
					>
						<TwitterIcon className="h-4 w-4" /> @asianpowder
						<span className="sr-only">Instagram</span>
					</YnsLink>
				</div>
			</div>
		</footer>
	);
}

function TwitterIcon(props: SVGAttributes<SVGSVGElement>) {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 596 596" fill="none">
			<path
				fill="#fff"
				d="m1 19 230 307L0 577h52l203-219 164 219h177L353 252 568 19h-52L329 221 179 19H1Zm77 38h82l359 481h-81L78 57Z"
			/>
		</svg>
	);
}
