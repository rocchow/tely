"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCartModal } from "@/context/cart-modal";
import { YnsLink } from "../yns-link";

export const CartLink = ({ children }: { children: ReactNode }) => {
	const pathname = usePathname();
	const { setOpen } = useCartModal();
	return (
		<YnsLink
			href="/cart"
			onClick={(e) => {
				e.preventDefault();
				if (pathname === "/cart") {
					return;
				}
				setOpen(true);
			}}
			scroll={false}
			className="relative flex min-h-[44px] min-w-[44px] items-center justify-center -mr-2 sm:mr-0"
			prefetch={true}
		>
			{children}
		</YnsLink>
	);
};
