import { defineConfig } from "vite"
import { resolve } from "path"
import react from "@vitejs/plugin-react"

export default defineConfig(({ command }) => {
	return {
		plugins: [react()],
		publicDir: "public",
		base: "",
		build: {
			outDir: 'docs',
			rollupOptions: {
				input: {
					index: resolve(__dirname, "index.html"),
					"pages/ec2025": resolve(__dirname, "pages/ec2025.html"),
					"pages/ec2026si": resolve(__dirname, "pages/ec2026si.html"),
					"pages/landscape": resolve(__dirname, "pages/landscape.html"),
					"pages/help": resolve(__dirname, "pages/help.html"),
				},
			},
		},
	}
})
