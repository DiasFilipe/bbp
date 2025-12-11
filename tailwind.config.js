/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pm-dark': '#0a0e1a',
        'pm-light-dark': '#1e2230',
        'pm-gray': '#9ca3af',
        'pm-light-gray': '#4b5563',
        'pm-blue': '#0062ff',
        'pm-green': '#22c55e',
        'pm-red': '#ef4444',
      },
    },
  },
  plugins: [],
};
module.exports = config;
