import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves from /<repo>/; set by the deploy workflow.
  base: process.env.BASE_PATH ?? '/',
})
