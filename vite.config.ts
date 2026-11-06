import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { profile } from './src/data'

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char] ?? char,
  )

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'portfolio-metadata',
      transformIndexHtml(html) {
        const title = `${profile.name} ${profile.englishName} — 不止于代码`
        return html
          .replaceAll('__PROFILE_TITLE__', () => escapeHtml(title))
          .replaceAll('__PROFILE_DESCRIPTION__', () =>
            escapeHtml(profile.seoDescription),
          )
      },
    },
  ],
  base: './',
})
