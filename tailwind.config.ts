import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1B4332',
          50: '#F0F7F4',
          100: '#D8F3DC',
          200: '#B7E4C7',
          300: '#95D5B2',
          400: '#74C69D',
          500: '#52B788',
          600: '#40916C',
          700: '#2D6A4F',
          800: '#1B4332',
          900: '#081C15',
          950: '#04100c',
        },
        burgundy: {
          DEFAULT: '#581845',
          50: '#FAF0F6',
          100: '#F3E0ED',
          200: '#E6C0DB',
          300: '#D59BC3',
          400: '#BD6D9F',
          500: '#9B457D',
          600: '#792A5F',
          700: '#581845',
          800: '#400D31',
          900: '#26041C',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F9FA',
          border: '#E5E7EB',
        },
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FCF8E3',
          100: '#F9F1C7',
          500: '#D4AF37',
          600: '#AA8C2C',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '24px',
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(27, 67, 50, 0.05)',
        elevated: '0 10px 30px -4px rgba(27, 67, 50, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
