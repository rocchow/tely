import AccessoriesImage from "@/images/accessories.jpg";

export const config = {
	categories: [
		{ name: "Face Powder", slug: "face-powder", image: AccessoriesImage },
		{ name: "Foundation", slug: "foundation", image: AccessoriesImage },
		{ name: "Blush & Bronzer", slug: "blush-bronzer", image: AccessoriesImage },
		{ name: "Eye Shadow", slug: "eye-shadow", image: AccessoriesImage },
	],

	social: {
		x: "https://x.com/asianpowder",
		facebook: "https://facebook.com/asianpowder",
	},

	contact: {
		email: "support@asianpowder.com",
		phone: "+1 (555) 279-3337",
		address: "AsianPowder Beauty, Los Angeles, CA, USA",
	},
};

export type StoreConfig = typeof config;
export default config;
