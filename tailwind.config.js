// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    // ... other configurations
    theme: {
      extend: {
        fontFamily: {
          sans: ['var(--font-geist-sans)', 'sans-serif'], // Ensure this or similar is present
          mono: ['var(--font-geist-mono)', 'monospace'],
        },
        // ... other theme extensions
      },
    },
    // ...
  }