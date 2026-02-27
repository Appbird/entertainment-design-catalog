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
					ec2025: resolve(__dirname, "ec2025.html"),
					ec2026si: resolve(__dirname, "ec2026si.html"),
				},
			},
		},
	}
})
