/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '1.75rem',
        xl: '2rem'
      },
      screens: {
        '2xl': '1280px'
      }
    },
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        cardForeground: 'hsl(var(--card-foreground) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        surfaceForeground: 'hsl(var(--surface-foreground) / <alpha-value>)',
        primary: 'hsl(var(--primary) / <alpha-value>)',
        primaryForeground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        secondary: 'hsl(var(--secondary) / <alpha-value>)',
        secondaryForeground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        mutedForeground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        accentForeground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        destructive: 'hsl(var(--destructive) / <alpha-value>)'
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem'
      },
      boxShadow: {
        sm: '0 1px 2px hsl(var(--shadow) / 0.06), 0 8px 24px -18px hsl(var(--shadow) / 0.22)',
        md: '0 10px 30px -18px hsl(var(--shadow) / 0.28)',
        lg: '0 18px 48px -20px hsl(var(--shadow) / 0.34)',
        lift: '0 14px 32px -18px hsl(var(--shadow) / 0.3)'
      },
      fontSize: {
        hero: [
          'clamp(2.1rem,4vw,3.35rem)',
          { lineHeight: '1.03', letterSpacing: '-0.025em', fontWeight: '700' }
        ],
        'page-title': [
          'clamp(1.8rem,2.8vw,2.65rem)',
          { lineHeight: '1.12', letterSpacing: '-0.018em', fontWeight: '650' }
        ],
        'section-title': [
          '1.25rem',
          { lineHeight: '1.32', letterSpacing: '-0.012em', fontWeight: '600' }
        ],
        body: ['1rem', { lineHeight: '1.72' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
        label: ['0.8125rem', { lineHeight: '1.35', letterSpacing: '0.01em', fontWeight: '600' }]
      },
      keyframes: {
        'soft-fade': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'soft-fade': 'soft-fade 220ms ease-out',
        'accordion-down': 'accordion-down 200ms ease-out',
        'accordion-up': 'accordion-up 200ms ease-out'
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: []
}
