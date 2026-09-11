/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#070A12',
          900: '#0A0F1D',
          850: '#0E162B',
          800: '#141D36',
          700: '#1F2B4D',
          600: '#2E3D66',
        },
        brand: {
          50: '#EEF4FF',
          100: '#DDE9FF',
          200: '#C1D6FE',
          300: '#94B7FD',
          400: '#6090FA',
          500: '#3B6FF6',
          600: '#1D4ED8',
          700: '#1A40BD',
          800: '#193598',
          900: '#1A3078',
          950: '#111D4A',
        },
        electric: {
          indigo: '#4F46E5',
          violet: '#7C3AED',
          cyan: '#06B6D4',
          emerald: '#10B981',
          coral: '#F43F5E',
          amber: '#F59E0B'
        },
        surface: {
          ground: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#F1F5F9',
          border: 'rgba(226, 232, 240, 0.85)',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 2px 8px -2px rgba(10, 15, 29, 0.05), 0 1px 3px 0 rgba(10, 15, 29, 0.03)',
        'card-hover': '0 14px 28px -6px rgba(10, 15, 29, 0.09), 0 6px 12px -4px rgba(10, 15, 29, 0.04)',
        'glow-brand': '0 0 24px -4px rgba(59, 111, 246, 0.25)',
        'glow-purple': '0 0 24px -4px rgba(124, 58, 237, 0.25)',
        'modal': '0 25px 50px -12px rgba(10, 15, 29, 0.18)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
