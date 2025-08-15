# FileMaster Style Guide

This document outlines the design system, styling conventions, and guidelines for the FileMaster PDF tools platform.

## 🎨 Design System Overview

FileMaster uses a modern design system built on:
- **Tailwind CSS v4** for utility-first styling
- **Ant Design** for component library
- **CSS Custom Properties** for theming
- **Inter & Poppins** fonts for typography

## 🎯 Design Principles

### 1. **Consistency**
- Use design tokens for colors, spacing, and typography
- Maintain consistent component patterns
- Follow established naming conventions

### 2. **Accessibility**
- Ensure sufficient color contrast (WCAG AA compliance)
- Provide keyboard navigation support
- Include proper ARIA labels and semantic HTML

### 3. **Responsive Design**
- Mobile-first approach
- Fluid typography and spacing
- Touch-friendly interactive elements

### 4. **Performance**
- Optimize CSS bundle size
- Use efficient selectors
- Minimize layout shifts

## 🎨 Color System

### Primary Colors
```css
--color-primary-50: #eff6ff;   /* Lightest */
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;  /* Base */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;  /* Darkest */
```

### Semantic Colors
```css
/* Success */
--color-success-500: #22c55e;
--color-success-600: #16a34a;

/* Warning */
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;

/* Error */
--color-error-500: #ef4444;
--color-error-600: #dc2626;

/* Neutral */
--color-secondary-50: #f8fafc;
--color-secondary-500: #64748b;
--color-secondary-900: #0f172a;
```

### Usage Guidelines
- **Primary**: Main actions, links, and brand elements
- **Success**: Positive feedback, completed actions
- **Warning**: Cautionary messages, pending states
- **Error**: Error messages, destructive actions
- **Neutral**: Text, borders, backgrounds

## 📝 Typography

### Font Families
```css
--font-sans: 'Inter', system-ui, sans-serif;      /* Body text */
--font-display: 'Poppins', system-ui, sans-serif; /* Headings */
```

### Font Weights
- **300**: Light (Inter only)
- **400**: Regular
- **500**: Medium
- **600**: Semi-bold
- **700**: Bold
- **800**: Extra bold (Poppins only)

### Type Scale
```css
/* Heading sizes */
h1: 2.5rem (40px) - font-display, 700
h2: 2rem (32px) - font-display, 600
h3: 1.5rem (24px) - font-display, 600
h4: 1.25rem (20px) - font-sans, 600
h5: 1.125rem (18px) - font-sans, 600
h6: 1rem (16px) - font-sans, 600

/* Body text */
p, span, div: 1rem (16px) - font-sans, 400
small: 0.875rem (14px) - font-sans, 400
```

## 📏 Spacing System

### Base Unit: 4px
```css
/* Spacing scale */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
```

### Usage Guidelines
- **Padding**: Use for component internal spacing
- **Margin**: Use for component external spacing
- **Gap**: Use for flex/grid layouts
- **Consistent**: Stick to the spacing scale

## 🎭 Shadows & Elevation

### Shadow System
```css
--shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.1);      /* Cards, buttons */
--shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.1);   /* Modals, dropdowns */
--shadow-large: 0 8px 32px rgba(0, 0, 0, 0.1);    /* Tooltips, overlays */
--shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);  /* Focus states */
```

### Elevation Levels
- **Level 1**: Cards, buttons (soft shadow)
- **Level 2**: Modals, dropdowns (medium shadow)
- **Level 3**: Tooltips, overlays (large shadow)
- **Focus**: Interactive elements (glow shadow)

## 🎬 Animations & Transitions

### Animation System
```css
/* Fade animations */
@keyframes fadeIn {
  0% { opacity: 0 }
  100% { opacity: 1 }
}

/* Slide animations */
@keyframes slideUp {
  0% { transform: translateY(10px); opacity: 0 }
  100% { transform: translateY(0); opacity: 1 }
}

/* Bounce animations */
@keyframes bounceSoft {
  0%, 100% { transform: translateY(0) }
  50% { transform: translateY(-5px) }
}

/* Pulse animations */
@keyframes pulseSoft {
  0%, 100% { opacity: 1 }
  50% { opacity: 0.8 }
}
```

### Transition Guidelines
- **Duration**: 150ms for micro-interactions, 300ms for page transitions
- **Easing**: `ease-out` for most interactions
- **Performance**: Use `transform` and `opacity` for smooth animations

## 🧩 Component Patterns

### Button Variants
```jsx
// Primary button
<Button type="primary" size="large">
  Primary Action
</Button>

// Secondary button
<Button type="default" size="medium">
  Secondary Action
</Button>

// Ghost button
<Button type="text" size="small">
  Ghost Action
</Button>
```

### Card Components
```jsx
// Standard card
<Card className="shadow-soft rounded-lg p-6">
  <CardContent>
    Card content here
  </CardContent>
</Card>

// Interactive card
<Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
  <CardContent>
    Interactive content
  </CardContent>
</Card>
```

### Form Components
```jsx
// Input field
<InputField
  label="Email Address"
  placeholder="Enter your email"
  type="email"
  required
  error={errors.email}
/>

// Select field
<SelectBox
  label="Country"
  options={countries}
  value={selectedCountry}
  onChange={handleCountryChange}
/>
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile first approach */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Responsive Patterns
```jsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>

// Responsive typography
<h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold">
  Responsive Heading
</h1>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  Content with responsive padding
</div>
```

## 🎨 Theme System

### Light Theme (Default)
- **Background**: White (#ffffff)
- **Surface**: Light gray (#f8fafc)
- **Text**: Dark gray (#1e293b)
- **Border**: Light gray (#e2e8f0)

### Dark Theme
- **Background**: Dark gray (#0f172a)
- **Surface**: Medium gray (#1e293b)
- **Text**: Light gray (#f1f5f9)
- **Border**: Medium gray (#334155)

### Theme Implementation
```jsx
// Theme context usage
const { theme, toggleTheme } = useTheme();

// Theme-aware styling
<div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
  Theme-aware content
</div>
```

## 📁 File Organization

### Style Directory Structure
```
src/style/
├── app.css              # Main stylesheet with design tokens
├── partials/            # Modular CSS files
│   ├── core.css         # Core styles and resets
│   ├── auth.css         # Authentication pages
│   ├── layout.css       # Layout components
│   ├── navigation.css   # Navigation components
│   ├── customAntd.css   # Ant Design customizations
│   └── ...
├── images/              # Image assets
└── STYLE_GUIDE.md       # This file
```

### CSS Import Order
1. **Design tokens** (app.css)
2. **Core styles** (partials/core.css)
3. **Component styles** (partials/*.css)
4. **Custom overrides** (customAntd.css)

## 🛠️ Development Guidelines

### CSS Best Practices
1. **Use Tailwind classes** for most styling
2. **Create custom components** for complex patterns
3. **Use CSS custom properties** for theme values
4. **Keep specificity low** to avoid conflicts
5. **Document complex styles** with comments

### Component Styling
```jsx
// Good: Using Tailwind classes
<button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">
  Click me
</button>

// Good: Custom component with consistent styling
<Button variant="primary" size="medium">
  Click me
</Button>

// Avoid: Inline styles
<button style={{ backgroundColor: '#3b82f6', color: 'white' }}>
  Click me
</button>
```

### Accessibility Guidelines
1. **Color contrast**: Minimum 4.5:1 for normal text
2. **Focus indicators**: Visible focus states for all interactive elements
3. **Semantic HTML**: Use proper HTML elements and ARIA attributes
4. **Keyboard navigation**: Ensure all interactive elements are keyboard accessible

## 🧪 Testing Styles

### Visual Regression Testing
- Use tools like Chromatic or Percy
- Test across different screen sizes
- Verify theme switching works correctly
- Check accessibility compliance

### Performance Testing
- Monitor CSS bundle size
- Check for unused CSS
- Verify critical CSS loading
- Test animation performance

## 📚 Resources

### Design Tools
- **Figma**: Design system and component library
- **Storybook**: Component documentation and testing
- **Chromatic**: Visual regression testing

### Documentation
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Ant Design Documentation](https://ant.design/docs/react/introduce)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Color Tools
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Palette Generator](https://coolors.co/)
- [Accessible Color Generator](https://www.accessible-colors.com/)

---

**Last updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: FileMaster Design Team
