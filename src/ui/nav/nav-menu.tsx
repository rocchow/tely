import Link from "next/link";
import StoreConfig from "@/store.config";
import { NavMobileMenu } from "@/ui/nav/nav-mobile-menu.client";

const links = [
	{
		label: "Home",
		href: "/",
	},
	...StoreConfig.categories.map(({ name, slug }) => ({
		label: name,
		href: `/category/${slug}`,
	})),
];

export const NavMenu = () => {
	return (
		<>
			<div className="sm:block hidden">
				<ul className="flex flex-row items-center justify-center gap-x-1">
					{links.map((link) => (
						<li key={link.href}>
							<Link
								href={link.href}
								className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-hidden"
							>
								{link.label}
							</Link>
						</li>
					))}
				</ul>
			</div>
			<div className="sm:hidden flex items-center">
				<NavMobileMenu>
					<ul className="flex flex-col items-stretch justify-center space-y-1">
						{links.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="group flex min-h-[48px] w-full items-center justify-center rounded-lg bg-transparent px-6 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-hidden active:bg-accent/80"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</NavMobileMenu>
			</div>
		</>
	);
};
