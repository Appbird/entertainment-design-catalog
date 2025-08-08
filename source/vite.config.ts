import { defineConfig } from "vite"
import { resolve } from "path"
import react from "@vitejs/plugin-react"

export default defineConfig(({ command }) => {
	const base = command === 'build' ? '/entertainment-design-catalog/' : '/public/';
	return {
		plugins: [react()],
		publicDir: 'public',
		base: base,
		build: {
			outDir: '../docs',
			rollupOptions: {
				input: {
					index: resolve(__dirname, 'index.html'),
					landscape: resolve(__dirname, 'landscape.html'),
					help: resolve(__dirname, 'help.html'),
				},
			},
		},
	}
})