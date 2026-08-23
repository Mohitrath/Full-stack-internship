/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#0B0F14', 900: '#10161D', 800: '#161E27', 700: '#212B37', 600: '#334155' },
        paper: '#F6F5F1',
        line: { teal: '#14B8A6', violet: '#7C3AED' },
        status: { todo: '#64748B', progress: '#D97706', done: '#16A34A' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: { 'flow-gradient': 'linear-gradient(90deg, #14B8A6 0%, #7C3AED 100%)' },
      boxShadow: { card: '0 1px 2px rgba(16,22,29,0.06), 0 8px 24px -12px rgba(16,22,29,0.15)' },
    },
  },
  plugins: [],
};
