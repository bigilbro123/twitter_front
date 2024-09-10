// tailwind.config.js
import daisyui from 'daisyui';
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",  // Path to your HTML files
    "./src/**/*.{js,jsx,ts,tsx}",  // Paths to your JavaScript/TypeScript files
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui
  ],
};
