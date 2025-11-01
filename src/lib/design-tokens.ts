/**
 * 2025 Trending Green-Focused Design Tokens
 * Shadcn + Radix UI Compatible Design System
 * 
 * Colors are based on 2025's most rated trending colors:
 * - Clay Green: Earthy, elegant, timeless refinement
 * - Bottle Green: Deep, sophisticated, classic
 * - Sage Green: Soft, versatile, calming
 * - Pistachio Green: Fresh, modern, vibrant
 * - Emerald Green: Bold, luxurious, statement-making
 */

export const designTokens = {
  // 2025 Trending Green Palette
  colors: {
    // Primary: Clay-Emerald Fusion (Main brand color)
    primary: {
      50: '#f0fdf5',
      100: '#dcfce8',
      200: '#bbf7d1',
      300: '#86efad',
      400: '#4ade80',
      500: '#16a34a', // Clay-Emerald fusion - 2025 trending
      600: '#0d7a37',
      700: '#0a5d2b',
      800: '#084a23',
      900: '#07391c',
      950: '#032010',
    },

    // Sage Green - 2025 trending (Accent color)
    sage: {
      50: '#f6f7f4',
      100: '#eaede5',
      200: '#d6ddcc',
      300: '#b8c5a7', // Main sage tone
      400: '#9caf88',
      500: '#7d9465',
      600: '#627650',
      700: '#4e5d40',
      800: '#404c35',
      900: '#37412f',
    },

    // Bottle Green - 2025 trending (Professional/Enterprise)
    bottle: {
      50: '#f0fdf7',
      100: '#dcfaec',
      200: '#bbf4da',
      300: '#88eabf',
      400: '#4dd89e',
      500: '#22c081',
      600: '#169f69',
      700: '#006a4e', // Deep bottle green
      800: '#0f5a47',
      900: '#0d4a3a',
    },

    // Pistachio Green - 2025 trending (Fresh/Modern)
    pistachio: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#bdb76b', // Pistachio tone
      500: '#a3a857',
      600: '#8b8c42',
      700: '#717232',
      800: '#5d5c2a',
      900: '#4f4e26',
    },

    // Clay Green - 2025 trending (Earthy/Elegant)
    clay: {
      50: '#f7f6f4',
      100: '#edeae5',
      200: '#ddd7cd',
      300: '#c9bfae',
      400: '#8b7355', // Clay green tone
      500: '#7a6449',
      600: '#6a5640',
      700: '#574836',
      800: '#4a3e2f',
      900: '#3f3529',
    },

    // Neutral Grays (Professional)
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },

    // Semantic Colors
    success: {
      light: '#16a34a', // Green-500
      default: '#15803d', // Green-700
      dark: '#14532d', // Green-900
    },
    
    warning: {
      light: '#f59e0b', // Amber-500
      default: '#d97706', // Amber-600
      dark: '#92400e', // Amber-800
    },
    
    error: {
      light: '#ef4444', // Red-500
      default: '#dc2626', // Red-600
      dark: '#991b1b', // Red-800
    },
    
    info: {
      light: '#3b82f6', // Blue-500
      default: '#2563eb', // Blue-600
      dark: '#1e40af', // Blue-800
    },
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Spacing Scale (8pt grid system)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    default: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
} as const;

// Helper function to get color values
export const getColor = (colorPath: string) => {
  const path = colorPath.split('.');
  let value: any = designTokens.colors;
  
  for (const key of path) {
    value = value[key];
  }
  
  return value;
};

// CSS Custom Properties (for Shadcn/UI compatibility)
export const cssVariables = {
  light: {
    '--background': '0 0% 100%',
    '--foreground': '0 0% 3.9%',
    '--primary': '142 76% 36%', // Clay-Emerald fusion
    '--primary-foreground': '355.7 100% 97.3%',
    '--secondary': '210 40% 98%',
    '--secondary-foreground': '222.2 84% 4.9%',
    '--accent': '93 20% 70%', // Sage green
    '--accent-foreground': '142 76% 36%',
    '--muted': '210 40% 96%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '210 40% 98%',
    '--border': '214.3 31.8% 91.4%',
    '--input': '214.3 31.8% 91.4%',
    '--ring': '142 76% 36%',
    '--radius': '0.5rem',
  },
  dark: {
    '--background': '142 50% 2%',
    '--foreground': '142 20% 95%',
    '--primary': '142 76% 45%',
    '--primary-foreground': '142 50% 2%',
    '--secondary': '142 30% 8%',
    '--secondary-foreground': '142 20% 80%',
    '--accent': '159 64% 20%', // Bottle green for dark
    '--accent-foreground': '142 76% 80%',
    '--muted': '142 30% 6%',
    '--muted-foreground': '142 10% 60%',
    '--destructive': '0 62.8% 30.6%',
    '--destructive-foreground': '0 85.7% 97.3%',
    '--border': '142 30% 12%',
    '--input': '142 30% 12%',
    '--ring': '142 76% 45%',
  },
};

export type ColorScale = keyof typeof designTokens.colors;
export type ColorWeight = keyof typeof designTokens.colors.primary;
