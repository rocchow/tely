"use client";

import { MenuIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

export const NavMobileMenu = ({ children }: { children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<DrawerTrigger className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2">
				<MenuIcon className="h-6 w-6" />
				<span className="sr-only">Open menu</span>
			</DrawerTrigger>
			<DrawerContent className="max-h-[85vh]">
				<DrawerHeader className="pb-4">
					<DrawerTitle className="text-center text-lg font-semibold">Menu</DrawerTitle>
					<DrawerDescription className="sr-only">Navigation menu</DrawerDescription>
				</DrawerHeader>
				<div
					className="px-4 pb-6 overflow-y-auto"
					onClick={(e) => {
						if (e.target instanceof HTMLElement && e.target.closest("a")) {
							setIsOpen(false);
						}
					}}
				>
					{children}
				</div>
			</DrawerContent>
		</Drawer>
	);
};
