"use server";

export const saveTaxIdAction = async ({ taxId }: { taxId: string }) => {
	// For our custom cart system, tax is handled differently
	console.warn("saveTaxIdAction called but not implemented for custom cart system");
	// For now, we'll just silently succeed since tax is handled by Stripe
	return;
};
