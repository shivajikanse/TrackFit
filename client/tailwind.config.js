/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        black: '#0A0A0A',
        red: { DEFAULT: '#FF3C2F', dark: '#CC2E23', light: '#FF6B61' },
        muted: { DEFAULT: '#1A1A1A', light: '#2A2A2A', lighter: '#3A3A3A' },
        success: '#39FF14',
        warn: '#FFB800',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        heading: ['Oswald', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.6s ease forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        glow: {
          from: { boxShadow: '0 0 10px #FF3C2F40' },
          to: { boxShadow: '0 0 30px #FF3C2F80, 0 0 60px #FF3C2F20' },
        }
      }
    },
  },
  plugins: [],
}
