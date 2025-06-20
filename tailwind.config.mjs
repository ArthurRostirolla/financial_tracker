// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Suas cores aqui...
        'sidebar-light': '#63783d',
        'background-light': '#fdfaf5',
        'card-light': '#ffffff',
        'text-light': '#171717',
        'text-on-sidebar': '#ffffff',
        'sidebar-dark': '#2a3b2a',
        'background-dark': '#1c1c1c',
        'card-dark': '#242424',
        'text-dark': '#ededed',
      },
    },
  },
  plugins: [],
};

export default config;