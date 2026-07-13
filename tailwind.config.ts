import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#4c1d75',
          950: '#2f0f4d',
        },
        aqua: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        paper: {
          50: '#fdfcfb',
          100: '#faf8f6',
          200: '#f4f1ec',
        },
        ink: {
          50: '#f6f6f7',
          100: '#e7e7e9',
          200: '#c7c7cc',
          300: '#a3a3ab',
          400: '#75757f',
          500: '#57575f',
          600: '#404048',
          700: '#2e2e34',
          800: '#1c1c21',
          900: '#111114',
          950: '#0a0a0c',
        },
        gold: {
          400: '#f5a623',
          500: '#e8940f',
          600: '#c97a06',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,17,20,0.05), 0 8px 24px -10px rgba(17,17,20,0.10)',
        'card-hover': '0 4px 16px rgba(17,17,20,0.06), 0 20px 48px -16px rgba(126,34,206,0.18)',
        glow: '0 0 0 1px rgba(168,85,247,0.12), 0 12px 36px -10px rgba(168,85,247,0.28)',
        'inner-soft': 'inset 0 1px 2px rgba(17,17,20,0.04)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #c026d3 100%)',
        'ink-gradient': 'linear-gradient(180deg, #111114 0%, #1c1c21 100%)',
        'hero-mesh':
          'radial-gradient(ellipse 80% 60% at 15% -10%, rgba(168,85,247,0.16), transparent 60%),' +
          'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(34,211,238,0.14), transparent 55%),' +
          'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(192,38,211,0.08), transparent 60%),' +
          'linear-gradient(180deg, #fdfcfb 0%, #ffffff 100%)',
        'soft-mesh':
          'radial-gradient(ellipse 60% 50% at 0% 0%, rgba(168,85,247,0.08), transparent 60%),' +
          'radial-gradient(ellipse 60% 50% at 100% 100%, rgba(34,211,238,0.08), transparent 60%),' +
          '#ffffff',
        'panel-mesh':
          'radial-gradient(ellipse 70% 70% at 20% 10%, rgba(168,85,247,0.20), transparent 60%),' +
          'radial-gradient(ellipse 60% 60% at 90% 90%, rgba(34,211,238,0.16), transparent 55%),' +
          'linear-gradient(160deg, #faf5ff 0%, #ecfeff 100%)',
      },
    },
  },
}
