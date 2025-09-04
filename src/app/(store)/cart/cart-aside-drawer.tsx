"use client";

import type { ReactNode } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/components/ui/hooks/use-media-query";
import { useCartModal } from "@/context/cart-modal";

export const CartAsideDrawer = ({ children }: { children: ReactNode }) => {
	const { open, setOpen } = useCartModal();

	const isDesktop = useMediaQuery("(min-width: 640px)");

	return (
		<Drawer open={open} shouldScaleBackground={true} direction={isDesktop ? "right" : "bottom"}>
			<DrawerTitle className="sr-only">Shopping cart</DrawerTitle>
			<DrawerContent
				className="sm:fixed sm:top-20 sm:right-4 sm:bottom-auto sm:left-auto sm:mt-0 sm:flex sm:h-auto sm:w-80 sm:max-h-96 sm:flex-col sm:overflow-hidden sm:rounded-lg sm:bg-white sm:shadow-xl border"
				aria-describedby="cart-overlay-description"
				onPointerDownOutside={() => {
					setOpen(false);
				}}
				onEscapeKeyDown={() => {
					setOpen(false);
				}}
			>
				{children}
			</DrawerContent>
		</Drawer>
	);
};
