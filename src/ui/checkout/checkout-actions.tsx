"use server";

import type { AddressSchema } from "@/ui/checkout/checkout-form-schema";

export const saveShippingRateAction = async ({ shippingRateId }: { shippingRateId: string }) => {
	// For our custom cart system, shipping is handled differently
	console.warn("saveShippingRateAction called but not implemented for custom cart system");
	// For now, we'll just silently succeed since shipping is handled by Stripe Elements
	return;
};

export const saveBillingAddressAction = async ({ billingAddress }: { billingAddress: AddressSchema }) => {
	// For our custom cart system, billing address is handled differently
	console.warn("saveBillingAddressAction called but not implemented for custom cart system");
	// For now, we'll just silently succeed since billing is handled by Stripe Elements
	return;
};
