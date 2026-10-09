import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1200px', '2xl': '1400px' } },
    extend: {
      colors: {
        background: 'hsl(var(--background))', foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))', primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: 'hsl(var(--secondary))', muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: 'hsl(var(--destructive))', border: 'hsl(var(--border))', ring: 'hsl(var(--ring))',
        ink: 'hsl(var(--ink))', cream: 'hsl(var(--cream))',
        emerald: { DEFAULT: 'hsl(var(--emerald))', deep: 'hsl(var(--emerald-deep))' },
        amber: { DEFAULT: 'hsl(var(--amber))', soft: 'hsl(var(--amber-soft))' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: { sm: '0.25rem' },
    },
  },
  plugins: [],
};
export default config;
