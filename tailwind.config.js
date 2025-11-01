/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Premium Brazil Flag Inspired Design System
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Primary: Brazilian Green (#009739)
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#e6f7ed',
          100: '#c0ecd5', 
          200: '#97dfbb',
          300: '#6dd3a0',
          400: '#4ac98c',
          500: '#009739', // Brazil Green
          600: '#008832',
          700: '#00762a',
          800: '#006423',
          900: '#004617',
          950: '#002d0f',
        },
        
        // Secondary: Brazilian Gold/Yellow (#FEDD00)
        gold: {
          DEFAULT: '#FEDD00',
          50: '#fffbeb',
          100: '#fff4c6',
          200: '#ffee88',
          300: '#ffe54a',
          400: '#FEDD00', // Brazil Gold
          500: '#efc500',
          600: '#d19a00',
          700: '#a66f02',
          800: '#89570a',
          900: '#74470f',
          950: '#442504',
        },
        
        // Accent: Brazilian Blue (#002776)
        brazilBlue: {
          DEFAULT: '#002776',
          50: '#e6ebf5',
          100: '#c0cee6',
          200: '#97aed5',
          300: '#6d8ec4',
          400: '#4e75b7',
          500: '#2f5caa',
          600: '#2a54a3',
          700: '#234999',
          800: '#002776', // Brazil Blue
          900: '#001f5c',
          950: '#001342',
        },
        
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7', 
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        
        // Complementary Premium Colors
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Semantic Colors (Premium Enhanced)
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#009739', // Brazil green for success
          600: '#008832',
          700: '#00762a',
          800: '#006423',
          900: '#004617',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FEDD00', // Brazil gold for warning
          600: '#d19a00',
          700: '#a66f02',
          800: '#89570a',
          900: '#74470f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2', 
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#e6ebf5',
          100: '#c0cee6',
          200: '#97aed5',
          300: '#6d8ec4',
          400: '#4e75b7',
          500: '#002776', // Brazil blue for info
          600: '#001f5c',
          700: '#001952',
          800: '#001342',
          900: '#000d2e',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        '2xl': "1.5rem",
        '3xl': "2rem",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      boxShadow: {
        'brazil': '0 4px 14px 0 rgba(0, 151, 57, 0.15)',
        'brazil-lg': '0 10px 40px 0 rgba(0, 151, 57, 0.2)',
        'gold': '0 4px 14px 0 rgba(254, 221, 0, 0.25)',
        'gold-lg': '0 10px 40px 0 rgba(254, 221, 0, 0.35)',
        'premium': '0 20px 60px 0 rgba(0, 0, 0, 0.12)',
        'premium-lg': '0 30px 80px 0 rgba(0, 0, 0, 0.16)',
      },
      backgroundImage: {
        'gradient-brazil': 'linear-gradient(135deg, #009739 0%, #006423 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FEDD00 0%, #d19a00 100%)',
        'gradient-premium': 'linear-gradient(135deg, #009739 0%, #002776 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 151, 57, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 30px rgba(0, 151, 57, 0.8)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
