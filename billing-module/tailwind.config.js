/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-primary': '#3b82f6',
        'medical-secondary': '#14b8a6',
        'medical-bg': '#f8fafc',
        'medical-card': '#ffffff',
        'medical-text': '#1e293b',
        'medical-muted': '#64748b',
        'aesthetic-black': '#09090b',
        'aesthetic-card': '#111113',
        'aesthetic-border': '#27272a',
        'aesthetic-accent': '#60a5fa',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
