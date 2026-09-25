export const tokens = {
  color: {
    primary: { $type: 'color', $value: 'oklch(57% 0.20 270)' },
    accent: { $type: 'color', $value: 'oklch(70% 0.17 195)' },
    success: { $type: 'color', $value: 'oklch(64% 0.16 150)' },
    warning: { $type: 'color', $value: 'oklch(78% 0.16 80)' },
    danger: { $type: 'color', $value: 'oklch(60% 0.21 25)' }
  },
  control: {
    xs: { $type: 'dimension', $value: '1.75rem' },
    sm: { $type: 'dimension', $value: '2rem' },
    md: { $type: 'dimension', $value: '2.5rem' },
    lg: { $type: 'dimension', $value: '3rem' },
    xl: { $type: 'dimension', $value: '3.5rem' }
  }
} as const;
