/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16a34a', // Agriculture Green
          light: '#22c55e',
          dark: '#15803d',
        },
        secondary: {
          DEFAULT: '#2563eb', // Trust Blue
          light: '#3b82f6',
          dark: '#1d4ed8',
        },
        earthy: {
          50: '#fafaf9', // Warm background
          100: '#f5f5f4', // Subtle background/borders
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
        },
        warning: '#f97316', // Orange alert
        danger: '#ef4444', // Red alert
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Standardized Global Typography Scale
        'page-title': ['clamp(1.625rem, 3.5vw, 2.375rem)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }], // 26px - 38px
        'section-title': ['clamp(1.375rem, 2.5vw, 1.875rem)', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '700' }], // 22px - 30px
        'card-title': ['1.1875rem', { lineHeight: '1.35', fontWeight: '600' }], // 19px
        'card-desc': ['0.9375rem', { lineHeight: '1.5', fontWeight: '400' }], // 15px
        'body-base': ['0.9375rem', { lineHeight: '1.55', fontWeight: '400' }], // 15px
        'small-meta': ['0.8125rem', { lineHeight: '1.4', fontWeight: '400' }], // 13px
        'form-label': ['0.84375rem', { lineHeight: '1.4', fontWeight: '600' }], // 13.5px
        'btn': ['0.9375rem', { lineHeight: '1.4', fontWeight: '600' }], // 15px
        'badge': ['0.75rem', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '0.02em' }], // 12px
      },
    },
  },
  plugins: [],
}
