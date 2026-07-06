import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Use a function-based ignored check (most reliable on Windows)
      // to prevent Vite from reloading the page when runtime data files change
      ignored: (filePath) => {
        const normalized = filePath.replace(/\\/g, '/');
        const dataFiles = [
          'user_profiles.json',
          'applied_jobs.json',
          'mock_calendar_events.json',
          'demo_calendar_events.json',
          'google_tokens.json',
          'google_config.json',
          '/.data/',
          'google_tokens_'
        ];
        return dataFiles.some(pat => normalized.includes(pat));
      }
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

