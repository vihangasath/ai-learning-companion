import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, defineManifest } from '@crxjs/vite-plugin'

const manifest = defineManifest({
  manifest_version: 3,
  name: 'LearnFlow AI',
  version: '1.0.0',
  description: 'AI-Powered Personalized Learning Ecosystem',
  action: {
    default_title: 'Open LearnFlow AI'
  },
  side_panel: {
    default_path: 'index.html'
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  permissions: [
    'sidePanel',
    'tabs',
    'storage',
    'activeTab'
  ],
  host_permissions: [
    'http://localhost:8000/*'
  ],
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content-scripts/index.ts'],
      run_at: 'document_idle'
    }
  ]
})

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
})
