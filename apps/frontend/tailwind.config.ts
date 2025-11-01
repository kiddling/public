import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Chinese typography support with font-display: swap strategy
        // Using system fonts by default to avoid CDN blocking in China
        // For self-hosted fonts, uncomment Source Han Sans CN in assets/css/fonts.css
        sans: [
          // 'Source Han Sans CN', // Self-hosted font (when configured)
          'PingFang SC',           // macOS & iOS
          'Hiragino Sans GB',      // Older macOS
          'Microsoft YaHei',       // Windows
          'WenQuanYi Micro Hei',   // Linux
          'sans-serif',
        ],
      },
      colors: {
        // Add custom colors for branding
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
