import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      colors: {
        // IDE Theme
        ide: {
          bg:        '#0d1117',
          surface:   '#161b22',
          border:    '#30363d',
          text:      '#e6edf3',
          muted:     '#8b949e',
          accent:    '#58a6ff',
          green:     '#3fb950',
          red:       '#f85149',
          yellow:    '#d29922',
          purple:    '#bc8cff',
          cyan:      '#79c0ff',
        },
        // Landing theme
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(228,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.05) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(269,100%,77%,0.1) 0px, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'typing': 'typing 3.5s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#58a6ff' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(88, 166, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(88, 166, 255, 0.6), 0 0 40px rgba(88, 166, 255, 0.2)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(88, 166, 255, 0.4)',
        'glow-purple': '0 0 20px rgba(188, 140, 255, 0.4)',
        'glow-green': '0 0 20px rgba(63, 185, 80, 0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
        'card': '0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2)',
        'card-hover': '0 0 0 1px rgba(88,166,255,0.3), 0 4px 8px rgba(0,0,0,0.4), 0 16px 32px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
