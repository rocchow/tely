import AccessoriesImage from "@/images/accessories.jpg";

export const config = {
	categories: [{ name: "Puzzle Mats", slug: "puzzle-mats", image: AccessoriesImage }],

	social: {
		x: "https://x.com/telystore",
		facebook: "https://facebook.com/telystore",
	},

	contact: {
		email: "support@tely.com",
		phone: "+1 (555) 835-9000",
		address: "Tely Headquarters, Puzzle City, USA",
	},
};

export type StoreConfig = typeof config;
export default config;
