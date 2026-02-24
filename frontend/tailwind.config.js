/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Frutiger Aero - Sky blues
        aero: {
          50: '#f0faff',
          100: '#e0f4fe',
          200: '#b9ecfe',
          300: '#7cdffd',
          400: '#36cffa',
          500: '#0cb8eb',
          600: '#0093c9',
          700: '#0175a3',
          800: '#066286',
          900: '#0b516f',
          950: '#07344a',
        },
        // Frutiger Aero - Nature greens
        nature: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Frutiger Aero - Warm accents
        sunshine: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Glass effect colors
        glass: {
          white: 'rgba(255, 255, 255, 0.25)',
          light: 'rgba(255, 255, 255, 0.4)',
          medium: 'rgba(255, 255, 255, 0.6)',
          strong: 'rgba(255, 255, 255, 0.8)',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Frutiger', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        // Frutiger Aero gradients
        'aero-sky': 'linear-gradient(180deg, #87CEEB 0%, #00BFFF 50%, #1E90FF 100%)',
        'aero-aurora': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'aero-nature': 'linear-gradient(180deg, #87CEEB 0%, #98FB98 50%, #90EE90 100%)',
        'aero-sunset': 'linear-gradient(180deg, #FFB347 0%, #FF6B6B 50%, #4ECDC4 100%)',
        'aero-ocean': 'linear-gradient(180deg, #a8edea 0%, #fed6e3 100%)',
        'aero-meadow': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        'aero-glass': 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
      },
      boxShadow: {
        'aero': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'aero-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.2)',
        'aero-glow': '0 0 20px rgba(0, 191, 255, 0.3)',
        'aero-inner': 'inset 0 1px 1px rgba(255, 255, 255, 0.6)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'aero': '16px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 191, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 191, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
