import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
	plugins: [react()],
	base: '/entertainment-design-catalog/',
  	build: {
    	outDir: '../docs',
  	},
})