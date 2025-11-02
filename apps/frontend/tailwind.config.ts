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
          'PingFang SC', // macOS & iOS
          'Hiragino Sans GB', // Older macOS
          'Microsoft YaHei', // Windows
          'WenQuanYi Micro Hei', // Linux
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
  plugins: [
    function ({ addBase, addUtilities }) {
      addBase({
        // High contrast mode support
        '.high-contrast': {
          '--tw-prose-body': 'black',
          '--tw-prose-headings': 'black',
          '--tw-prose-links': 'blue',
          '--tw-prose-bold': 'black',
          '--tw-prose-counters': 'black',
          '--tw-prose-bullets': 'black',
          '--tw-prose-quotes': 'black',
        },
        '.high-contrast.dark': {
          '--tw-prose-body': 'white',
          '--tw-prose-headings': 'white',
          '--tw-prose-links': 'yellow',
          '--tw-prose-bold': 'white',
          '--tw-prose-counters': 'white',
          '--tw-prose-bullets': 'white',
          '--tw-prose-quotes': 'white',
        },
      })

      addUtilities({
        // Screen reader only utility
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        },
        '.not-sr-only': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: '0',
          margin: '0',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        },
        // Reduced motion support
        '@media (prefers-reduced-motion: reduce)': {
          '.reduce-motion *': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
        // Focus visible utilities for better keyboard navigation
        '.focus-visible-ring': {
          '&:focus-visible': {
            outline: '2px solid currentColor',
            outlineOffset: '2px',
          },
        },
      })
    },
  ],
} satisfies Config
