import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#a78bfa',
          500: '#a78bfa',
        },
      },
      fontFamily: {
        grotesk: ['ui-sans-serif', 'system-ui', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        ubuntu: ['Ubuntu', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        futura: ['Futura PT', 'Futura', 'Avenir', 'Helvetica Neue', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        lift: '0 10px 25px -15px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
    },
  },
  plugins: [],
};

export default config;


