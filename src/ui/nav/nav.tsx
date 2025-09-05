import { UserIcon } from "lucide-react";
import { CartSummaryNav } from "@/ui/nav/cart-summary-nav";
import { NavMenu } from "@/ui/nav/nav-menu";
import { SearchNav } from "@/ui/nav/search-nav";
import { SeoH1 } from "@/ui/seo-h1";
import { YnsLink } from "@/ui/yns-link";

export const Nav = async () => {
	return (
		<header className="z-50 py-3 sm:py-4 sticky top-0 bg-white/90 backdrop-blur-xs nav-border-reveal">
			<div className="mx-auto flex max-w-7xl items-center gap-2 px-4 flex-row sm:px-6 lg:px-8">
				<YnsLink
					href="/"
					className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 sm:ml-0"
				>
					<SeoH1 className="-mt-0.5 whitespace-nowrap text-xl font-bold">AsianPowder</SeoH1>
				</YnsLink>

				<div className="max-w-full flex shrink w-auto sm:mr-auto overflow-auto max-sm:order-2">
					<NavMenu />
				</div>
				<div className="mr-2 sm:mr-3 ml-auto sm:ml-0">
					<SearchNav />
				</div>
				<CartSummaryNav />
				<YnsLink
					href="/login"
					className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 sm:mr-0"
				>
					<UserIcon className="hover:text-neutral-500 h-6 w-6" />
				</YnsLink>
			</div>
		</header>
	);
};
