// Logo-extracted color scheme
export const logoColors = {
  // Primary blues from the logo
  primaryBlue: '#1E90FF',      // Bright electric blue
  secondaryBlue: '#00BFFF',    // Bright cyan
  lightBlue: '#87CEEB',        // Sky blue for lighter elements
  darkBlue: '#0066CC',         // Darker blue for depth
  
  // Yellow-orange gradient from the logo text
  primaryYellow: '#FFD700',    // Bright gold
  primaryOrange: '#FF8C00',    // Dark orange
  lightYellow: '#FFFFE0',      // Light yellow for subtle accents
  
  // Supporting colors
  black: '#000000',            // Pure black from outlines
  white: '#FFFFFF',            // Pure white for highlights
  gray: '#808080',             // Medium gray
  lightGray: '#D3D3D3',        // Light gray
  darkGray: '#2F2F2F',         // Dark gray for backgrounds
  
  // Composite colors
  yellowOrange: '#FF8C00',     // Alias for primaryOrange
  
  // Gradients (CSS gradient strings)
  blueGradient: 'linear-gradient(135deg, #1E90FF 0%, #00BFFF 100%)',
  yellowOrangeGradient: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
  darkBlueGradient: 'linear-gradient(135deg, #0066CC 0%, #1E90FF 100%)',
  backgroundGradient: 'linear-gradient(135deg, #000428 0%, #004e92 100%)', // Dark blue background
  
  // Opacity variants
  primaryBlueAlpha: (alpha) => `rgba(30, 144, 255, ${alpha})`,
  secondaryBlueAlpha: (alpha) => `rgba(0, 191, 255, ${alpha})`,
  lightBlueAlpha: (alpha) => `rgba(135, 206, 235, ${alpha})`,
  yellowAlpha: (alpha) => `rgba(255, 215, 0, ${alpha})`,
  primaryYellowAlpha: (alpha) => `rgba(255, 215, 0, ${alpha})`,
  orangeAlpha: (alpha) => `rgba(255, 140, 0, ${alpha})`,
  primaryOrangeAlpha: (alpha) => `rgba(255, 140, 0, ${alpha})`, // Alias for orangeAlpha
  yellowOrangeAlpha: (alpha) => `rgba(255, 140, 0, ${alpha})`, // Alias for orangeAlpha
  blackAlpha: (alpha) => `rgba(0, 0, 0, ${alpha})`,
  whiteAlpha: (alpha) => `rgba(255, 255, 255, ${alpha})`
};

// Component-specific color mappings
export const componentColors = {
  // Buttons
  primaryButton: {
    background: logoColors.yellowOrangeGradient,
    hover: 'linear-gradient(135deg, #FFE55C 0%, #FF6B35 100%)',
    text: logoColors.black
  },
  
  secondaryButton: {
    background: logoColors.blueGradient,
    hover: logoColors.darkBlueGradient,
    text: logoColors.white
  },
  
  // Cards
  card: {
    background: logoColors.blackAlpha(0.3),
    border: logoColors.primaryBlueAlpha(0.2),
    text: logoColors.white
  },
  
  // Navigation
  nav: {
    background: logoColors.blackAlpha(0.9),
    accent: logoColors.primaryBlue,
    text: logoColors.white,
    hover: logoColors.secondaryBlue
  },
  
  // Forms
  form: {
    background: logoColors.blackAlpha(0.5),
    border: logoColors.primaryBlueAlpha(0.3),
    focus: logoColors.secondaryBlue,
    text: logoColors.white
  }
};

export default logoColors;