/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        dnd: {
          dark: '#0a0e1a',
          panel: '#111827',
          border: '#1e293b',
          accent: '#f59e0b',
          fire: '#ef4444',
          frost: '#3b82f6',
          holy: '#fbbf24',
          necrotic: '#8b5cf6',
          lightning: '#eab308',
          physical: '#94a3b8',
          heal: '#22c55e',
        }
      }
    },
  },
  plugins: [],
};
