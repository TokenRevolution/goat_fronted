/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'goat-gold': '#FFD700',
        'goat-silver': '#C0C0C0',
        'goat-bronze': '#CD7F32',
        'goat-green': '#00FF00',
        'goat-blue': '#0066CC',
        'goat-red': '#FF0000',
        'goat-purple': '#800080',
        'goat-dark': '#1a1a1a',
        'goat-light': '#f8f9fa'
      },
      animation: {
        'trophy-glow': 'trophy-glow 2s ease-in-out infinite alternate',
        'rank-up': 'rank-up 0.5s ease-out',
        'deposit-success': 'deposit-success 0.6s ease-out'
      },
      keyframes: {
        'trophy-glow': {
          '0%': { boxShadow: '0 0 5px #FFD700' },
          '100%': { boxShadow: '0 0 20px #FFD700, 0 0 30px #FFD700' }
        },
        'rank-up': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'deposit-success': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' }
        }
      }
    },
  },
  plugins: [],
}
