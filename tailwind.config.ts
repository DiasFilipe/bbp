import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pm-dark': '#111111',
        'pm-light-dark': '#1c1c1e',
        'pm-gray': '#8e8e93',
        'pm-light-gray': '#3a3a3c',
        'pm-blue': '#007aff',
        'pm-green': '#34c759',
        'pm-red': '#ff3b30',
      },
    },
  },
  plugins: [],
}
export default config
