/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      // Custom color palette for course sections
      colors: {
        // Primary educational brand colors
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
          950: '#082f49'
        },
        // Course part color coding
        part: {
          // Part 1 - Foundations (Blue)
          foundation: {
            light: '#dbeafe',
            DEFAULT: '#3b82f6',
            dark: '#1e40af'
          },
          // Part 2 - Intermediate (Green)
          intermediate: {
            light: '#dcfce7',
            DEFAULT: '#22c55e',
            dark: '#15803d'
          },
          // Part 3 - Advanced (Purple)
          advanced: {
            light: '#f3e8ff',
            DEFAULT: '#a855f7',
            dark: '#7e22ce'
          },
          // Part 4 - Expert (Orange)
          expert: {
            light: '#fed7aa',
            DEFAULT: '#f97316',
            dark: '#c2410c'
          }
        },
        // Semantic colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d'
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309'
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c'
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        // Neutral grays
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a'
        }
      },
      // Typography optimized for Chinese fonts (system fonts only, no CDN)
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Microsoft YaHei',
          'PingFang SC',
          'Hiragino Sans GB',
          'Source Han Sans SC',
          'Noto Sans CJK SC',
          'sans-serif'
        ],
        serif: [
          'Georgia',
          'Songti SC',
          'SimSun',
          'serif'
        ],
        mono: [
          'SFMono-Regular',
          'Consolas',
          'Liberation Mono',
          'Menlo',
          'Monaco',
          'Courier New',
          'monospace'
        ]
      },
      fontSize: {
        // Enhanced scale for readability
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.75', letterSpacing: '0.01em' }],
        'lg': ['1.125rem', { lineHeight: '1.75', letterSpacing: '0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75', letterSpacing: '0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '1.6', letterSpacing: '0' }],
        '3xl': ['1.875rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        '4xl': ['2.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        '5xl': ['3rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }]
      },
      // Custom spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem'
      },
      // Enhanced shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)'
      },
      // Transition defaults
      transitionDuration: {
        DEFAULT: '200ms'
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      // Border radius
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem'
      },
      // Max width constraints for content
      maxWidth: {
        'prose': '65ch',
        'content': '75rem'
      }
    }
  },
  plugins: [
    // Print styles plugin
    function({ addBase, theme }) {
      addBase({
        '@media print': {
          'body': {
            'color': theme('colors.neutral.900'),
            'background': 'white'
          },
          'a': {
            'text-decoration': 'underline',
            'color': theme('colors.neutral.900')
          },
          '.no-print': {
            'display': 'none !important'
          },
          '.print-break-before': {
            'page-break-before': 'always'
          },
          '.print-break-after': {
            'page-break-after': 'always'
          },
          '.print-break-avoid': {
            'page-break-inside': 'avoid'
          }
        }
      })
    }
  ]
}
