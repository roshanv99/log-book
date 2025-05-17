/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Colors used in the app, matching the web application's color scheme
 */

// Primary colors
const primaryColor = '#4361ee';    // Main brand color
const secondaryColor = '#3f37c9';  // Secondary brand color
const accentColor = '#4895ef';     // Accent color for highlights

// UI colors for light mode
const lightText = '#1f2937';       // Primary text
const lightBackground = '#f9fafb';  // Background
const lightCard = '#ffffff';       // Card background
const lightCardAlt = '#f3f4f6';    // Alternative card background
const lightBorder = '#e5e7eb';     // Border color

// UI colors for dark mode
const darkText = '#f9fafb';        // Primary text
const darkBackground = '#111827';  // Background
const darkCard = '#1f2937';        // Card background
const darkCardAlt = '#374151';     // Alternative card background
const darkBorder = '#4b5563';      // Border color

// Semantic colors
const successColor = '#10b981';    // Success/positive feedback
const warningColor = '#f59e0b';    // Warning/caution 
const errorColor = '#ef4444';      // Error/negative feedback
const infoColor = '#3b82f6';       // Information/neutral

export const Colors = {
  light: {
    text: lightText,
    background: lightBackground,
    card: lightCard,
    cardAlt: lightCardAlt,
    border: lightBorder,
    tint: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    info: infoColor,
    tabIconDefault: '#6b7280',
    tabIconSelected: primaryColor,
  },
  dark: {
    text: darkText,
    background: darkBackground,
    card: darkCard,
    cardAlt: darkCardAlt,
    border: darkBorder,
    tint: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    info: infoColor,
    tabIconDefault: '#9ca3af',
    tabIconSelected: primaryColor,
  },
};
