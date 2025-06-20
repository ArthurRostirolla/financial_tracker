/** @type {import('tailwindcss').Config} */
module.exports = {
  // Ativa o modo escuro para que possamos usar classes como "dark:bg-gray-800"
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores do Modo Claro
        'sidebar-light': '#63783d',
        'background-light': '#fdfaf5', // Tom de areia/off-white
        'card-light': '#ffffff',
        'text-light': '#171717',
        'text-on-sidebar': '#ffffff', // Texto branco para a sidebar verde

        // Cores do Modo Escuro (tons sóbrios derivados do verde)
        'sidebar-dark': '#2a3b2a',
        'background-dark': '#1c1c1c',
        'card-dark': '#242424',
        'text-dark': '#ededed',
      },
    },
  },
  plugins: [],
};