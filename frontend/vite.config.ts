import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the Python Worker (`uv run pywrangler dev` in backend/)
    proxy: { '/api': 'http://localhost:8787' },
  },
})
