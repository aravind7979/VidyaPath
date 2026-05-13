export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        primary: '#0EA5E9',
        secondary: '#1E293B',
        background: '#0F172A',
        textMain: '#F8FAFC',
        textMuted: '#94A3B8'
      }
    },
  },
  plugins: [],
}
