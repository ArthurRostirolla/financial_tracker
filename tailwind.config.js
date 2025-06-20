/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores do Modo Claro
        'sidebar-light': '#63783d',
        'background-light': '#fdfaf5', // Tom de areia/off-white
        'card-light': '#ffffff',
        'text-light': '#171717',
        'text-on-sidebar': '#ffffff',

        // Cores do Modo Escuro
        'sidebar-dark': '#2a3b2a',
        'background-dark': '#1c1c1c',
        'card-dark': '#242424',
        'text-dark': '#ededed',
      },
    },
  },
  plugins: [],
};