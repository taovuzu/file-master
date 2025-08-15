import { COLORS } from './constants';
import storePersist from '@/redux/storePersist';

/**
 * Theme configuration for the I Love PDF clone
 * Follows modern design system principles with CSS custom properties
 */

// Design tokens
export const DESIGN_TOKENS = {
  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',  // 2px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },

  // Z-index
  zIndex: {
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
  },
};

// Light theme colors
export const LIGHT_THEME = {
  colors: {
    // Primary brand colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },

    // Secondary colors
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },

    // Success colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },

    // Warning colors
    warning: {
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

    // Error colors
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

    // Neutral colors
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },

    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Text colors
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      inverse: '#ffffff',
      disabled: '#94a3b8',
    },

    // Border colors
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      focus: '#3b82f6',
      error: '#ef4444',
    },
  },
};

// Dark theme colors
export const DARK_THEME = {
  colors: {
    // Primary brand colors (same as light for consistency)
    primary: LIGHT_THEME.colors.primary,

    // Secondary colors (inverted)
    secondary: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    },

    // Success colors (same as light)
    success: LIGHT_THEME.colors.success,

    // Warning colors (same as light)
    warning: LIGHT_THEME.colors.warning,

    // Error colors (same as light)
    error: LIGHT_THEME.colors.error,

    // Neutral colors (inverted)
    neutral: {
      50: '#171717',
      100: '#262626',
      200: '#404040',
      300: '#525252',
      400: '#737373',
      500: '#a3a3a3',
      600: '#d4d4d4',
      700: '#e5e5e5',
      800: '#f5f5f5',
      900: '#fafafa',
    },

    // Background colors
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },

    // Text colors
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      inverse: '#0f172a',
      disabled: '#475569',
    },

    // Border colors
    border: {
      primary: '#334155',
      secondary: '#475569',
      focus: '#3b82f6',
      error: '#ef4444',
    },
  },
};

/**
 * Generate CSS custom properties for a theme
 * @param {Object} theme - Theme object
 * @returns {string} CSS custom properties string
 */
export const generateThemeCSS = (theme) => {
  const cssVars = [];

  // Generate color variables
  Object.entries(theme.colors).forEach(([category, colors]) => {
    if (typeof colors === 'object' && colors !== null) {
      Object.entries(colors).forEach(([shade, value]) => {
        cssVars.push(`--color-${category}-${shade}: ${value};`);
      });
    }
  });

  // Generate design token variables
  Object.entries(DESIGN_TOKENS).forEach(([category, tokens]) => {
    if (typeof tokens === 'object' && tokens !== null) {
      Object.entries(tokens).forEach(([name, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subName, subValue]) => {
            cssVars.push(`--${category}-${name}-${subName}: ${subValue};`);
          });
        } else {
          cssVars.push(`--${category}-${name}: ${value};`);
        }
      });
    }
  });

  return `:root {\n  ${cssVars.join('\n  ')}\n}`;
};

/**
 * Get theme CSS for both light and dark modes
 * @returns {string} Complete theme CSS
 */
export const getThemeCSS = () => {
  const lightThemeCSS = generateThemeCSS(LIGHT_THEME);
  const darkThemeCSS = generateThemeCSS(DARK_THEME);

  return `
${lightThemeCSS}

@media (prefers-color-scheme: dark) {
${darkThemeCSS.replace(':root', '')}
}

[data-theme="dark"] {
${darkThemeCSS.replace(':root', '')}
}

[data-theme="light"] {
${lightThemeCSS.replace(':root', '')}
}
`;
};

/**
 * Theme utility functions
 */
export const themeUtils = {
  /**
   * Get color value from theme
   * @param {string} colorPath - Color path (e.g., 'primary.500')
   * @param {string} theme - Theme name ('light' or 'dark')
   * @returns {string} Color value
   */
  getColor: (colorPath, theme = 'light') => {
    const themeObj = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
    const path = colorPath.split('.');
    let value = themeObj.colors;

    for (const key of path) {
      value = value[key];
      if (!value) break;
    }

    return value || 'transparent';
  },

  /**
   * Get design token value
   * @param {string} tokenPath - Token path (e.g., 'spacing.md')
   * @returns {string} Token value
   */
  getToken: (tokenPath) => {
    const path = tokenPath.split('.');
    let value = DESIGN_TOKENS;

    for (const key of path) {
      value = value[key];
      if (!value) break;
    }

    return value || '';
  },

  /**
   * Apply theme to document
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  applyTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    storePersist.set('theme', theme);
  },

  /**
   * Get current theme
   * @returns {string} Current theme name
   */
  getCurrentTheme: () => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  /**
   * Toggle between light and dark themes
   */
  toggleTheme: () => {
    const currentTheme = themeUtils.getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    themeUtils.applyTheme(newTheme);
  },

  /**
   * Initialize theme from storePersist or system preference
   */
  initializeTheme: () => {
    const savedTheme = storePersist.get('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      themeUtils.applyTheme(savedTheme);
    } else if (systemPrefersDark) {
      themeUtils.applyTheme('dark');
    } else {
      themeUtils.applyTheme('light');
    }
  },
};

// Export default theme
export const defaultTheme = LIGHT_THEME;

// Export theme types for TypeScript
export const THEME_NAMES = {
  LIGHT: 'light',
  DARK: 'dark',
};
