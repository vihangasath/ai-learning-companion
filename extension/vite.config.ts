import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, defineManifest } from '@crxjs/vite-plugin'

const manifest = defineManifest({
  manifest_version: 3,
  name: 'LearnFlow AI',
  version: '1.0.0',
  description: 'AI-Powered Personalized Learning Ecosystem',
  icons: {
    '16': 'public/icons/icon-16.png',
    '32': 'public/icons/icon-32.png',
    '48': 'public/icons/icon-48.png',
    '128': 'public/icons/icon-128.png'
  },
  action: {
    default_title: 'Open LearnFlow AI',
    default_icon: {
      '16': 'public/icons/icon-16.png',
      '32': 'public/icons/icon-32.png',
      '48': 'public/icons/icon-48.png'
    }
  },
  side_panel: {
    default_path: 'index.html'
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
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
      js: ['src/content-scripts/content.ts'],
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
