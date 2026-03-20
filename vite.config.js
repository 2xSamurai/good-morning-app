import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	base: "/good-morning-app/",
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				name: "Good Morning App",
				short_name: "Good Morning",
				description: "Add a Good Morning message to your photos and share",
				theme_color: "#233d4d",
				background_color: "#233d4d",
				display: "standalone",
				orientation: "portrait",
				start_url: "/good-morning-app/",
				scope: "/good-morning-app/",
				icons: [
					{
						src: "icons/icon-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "icons/icon-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
			},
		}),
	],
});
