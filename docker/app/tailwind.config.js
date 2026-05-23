/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: "hsl(var(--surface))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
        },
        "super-black": "hsl(var(--super-black))",
        border: "hsl(var(--border))",
      },
      borderRadius: {
        venus: "var(--radius)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
      },
      fontSize: {
      // Heading 1 (Master)
      'h1': ['72px', {
        lineHeight: '72px',
        letterSpacing: '-3.6px',
        fontWeight: '800',
      }],
      // Heading 2 (Sub Master)
      'h2': ['36px', {
        lineHeight: '40px',
        letterSpacing: '0px',
        fontWeight: '700',
      }],
      // Heading 3
      'h3': ['24px', {
        lineHeight: '32px',
        letterSpacing: '0px',
        fontWeight: '700',
      }],
      // Heading 4
      'h4': ['16px', {
        lineHeight: '24px',
        letterSpacing: '0px',
        fontWeight: '700',
      }],
      // Body Large
      'bodyL': ['18px', {
        lineHeight: '29.3px',
        letterSpacing: '0px',
        fontWeight: '400',
      }],
      // Body Medium
      'bodyM': ['16px', {
        lineHeight: '24px',
        letterSpacing: '0px',
        fontWeight: '500',
      }],
      // Body Reguler
      'body': ['12px', {
        lineHeight: '19.5px',
        letterSpacing: '0px',
        fontWeight: '400',
      }],
      // Label SM
      'labelSm': ['12px', {
        lineHeight: '16px',
        letterSpacing: '1.2px',
        fontWeight: '500',
      }],
      // Card Title
      'cardTitle': ['20px', {
        lineHeight: '28px',
        letterSpacing: '0px',
        fontWeight: '700',
      }],
    },
    },
  },
  plugins: [],
}