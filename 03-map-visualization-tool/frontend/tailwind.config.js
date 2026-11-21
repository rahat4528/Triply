/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mapstudio: {
          dark: '#0b0f19',
          panel: '#111827',
          border: '#1f2937',
          accent: '#06b6d4',
          highlight: '#38bdf8',
        },
      },
    },
  },
  plugins: [],
};
