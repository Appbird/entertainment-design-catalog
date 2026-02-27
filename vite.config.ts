import { defineConfig } from "vite"
import { resolve } from "path"
import react from "@vitejs/plugin-react"

export default defineConfig(({ command }) => {
	return {
		plugins: [react()],
		publicDir: './source',
		base: "",
		build: {
			outDir: 'docs'
		},
	}
})