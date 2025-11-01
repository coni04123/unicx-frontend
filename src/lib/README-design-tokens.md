# 🎨 2025 Trending Green-Focused Design Tokens

## Overview

This design system features **2025's most rated trending colors** with a green focus, built using **Shadcn + Radix UI** principles for maximum compatibility and modern design patterns.

## 🌿 Featured 2025 Trending Colors

### Primary Palette
- **Clay-Emerald Fusion** (`#16a34a`) - Our main brand color combining earthy clay with vibrant emerald
- **Sage Green** (`#b8c5a7`) - Soft, versatile, calming accent color  
- **Bottle Green** (`#006a4e`) - Deep, sophisticated, professional tone
- **Pistachio Green** (`#bdb76b`) - Fresh, modern, vibrant highlight
- **Clay Green** (`#8b7355`) - Earthy, elegant, timeless refinement

## 🚀 Usage Examples

### Using Tailwind Classes
```jsx
// Primary colors
<button className="bg-primary-500 hover:bg-primary-600 text-white">
  Primary Button
</button>

// 2025 trending colors
<div className="bg-sage-300 text-sage-800">Sage accent</div>
<div className="bg-bottle-700 text-white">Professional bottle green</div>
<div className="bg-pistachio-400 text-pistachio-900">Fresh pistachio</div>
<div className="bg-clay-400 text-clay-900">Elegant clay</div>
```

### Using Design Tokens
```jsx
import { designTokens, getColor } from '@/lib/design-tokens';

// Get specific color
const primaryColor = getColor('primary.500');
const sageAccent = getColor('sage.300');

// Use in components
<div style={{ backgroundColor: primaryColor }}>
  Styled with design tokens
</div>
```

### Using CSS Custom Properties (Shadcn Style)
```jsx
// Semantic colors that adapt to light/dark mode
<button className="bg-primary text-primary-foreground">
  Adaptive Primary Button
</button>

<div className="bg-card text-card-foreground border border-border">
  Card with semantic tokens
</div>
```

## 🎯 Semantic Color Usage

### Success States
```jsx
<div className="bg-success-500 text-white">Success message</div>
<div className="text-success-700">Success text</div>
```

### Interactive States
```jsx
// Hover effects with 2025 colors
<button className="bg-sage-400 hover:bg-sage-500 active:bg-sage-600">
  Interactive Sage Button
</button>

// Focus rings with primary color
<input className="focus:ring-2 focus:ring-primary-500" />
```

## 🌙 Dark Mode Support

All colors automatically adapt to dark mode using CSS custom properties:

```jsx
// Automatically adapts to light/dark mode
<div className="bg-background text-foreground">
  Content that adapts to theme
</div>

// Manual dark mode variants
<div className="bg-white dark:bg-slate-900 text-black dark:text-white">
  Manual dark mode
</div>
```

## 📐 Spacing & Layout

Based on 8pt grid system:
```jsx
<div className="p-4 m-8 gap-2">
  // padding: 1rem, margin: 2rem, gap: 0.5rem
</div>
```

## 🎭 Typography

Using Inter font family with proper weights:
```jsx
<h1 className="text-4xl font-bold text-foreground">
  Heading with design tokens
</h1>

<p className="text-base font-normal text-muted-foreground">
  Body text with semantic colors
</p>
```

## 🎨 Component Examples

### Card Component
```jsx
<div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card description</p>
  <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
    Action Button
  </button>
</div>
```

### Status Indicators
```jsx
// Success indicator with 2025 trending green
<div className="flex items-center gap-2 text-sage-700">
  <div className="w-2 h-2 bg-sage-500 rounded-full"></div>
  Active Status
</div>

// Professional status with bottle green
<div className="bg-bottle-50 border border-bottle-200 text-bottle-800 px-3 py-1 rounded-full text-sm">
  Professional Badge
</div>
```

## 🔧 Customization

### Extending Colors
Add new colors in `tailwind.config.js`:
```js
extend: {
  colors: {
    brand: {
      50: '#f0f9f5',
      // ... your custom scale
      500: '#your-brand-color',
      // ... more shades
    }
  }
}
```

### Custom CSS Properties
Add custom variables in `globals.css`:
```css
:root {
  --your-custom-color: 142 76% 36%;
  --your-custom-radius: 0.75rem;
}
```

## ✨ Best Practices

1. **Use semantic colors** (`bg-primary`, `text-foreground`) for theme adaptation
2. **Leverage 2025 trending colors** for modern, fresh designs
3. **Follow 8pt spacing grid** for consistent layouts
4. **Use proper contrast ratios** for accessibility
5. **Test in both light and dark modes**

## 🎪 2025 Color Trends Context

- **Clay Green**: Represents sustainability, earth-consciousness, and timeless elegance
- **Sage Green**: Promotes calm, balance, and wellness - perfect for modern UIs
- **Bottle Green**: Conveys professionalism, trust, and sophistication 
- **Pistachio**: Adds freshness, creativity, and modern vibrancy
- **Emerald Fusion**: Combines luxury with natural elements

These colors align with 2025's design trends focusing on:
- 🌱 Sustainability and eco-consciousness
- 💚 Wellness and mental health
- 🏢 Professional sophistication
- ✨ Modern minimalism with natural elements
