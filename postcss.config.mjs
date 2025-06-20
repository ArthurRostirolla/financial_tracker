// postcss.config.mjs
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Usando o plugin correto para Tailwind v4
    'autoprefixer': {},        // Adicionando o autoprefixer que é essencial
  },
};

export default config;