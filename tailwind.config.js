/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F7F4',
        cream: '#F2F0EB',
        charcoal: '#1F2937',
        midnight: '#111827',
        sage: { DEFAULT: '#7A9E7E', dark: '#5E8062' },
        taupe: '#8B7355',
        gold: { DEFAULT: '#C8A24A', dark: '#B58E33' },
        ink: '#111827',
        body: '#374151',
        secondary: '#6B7280',
        muted: '#9CA3AF',
        line: '#E5E7EB',
        'line-light': '#F3F4F6',
        divider: '#D6D3D1',
        success: '#2E7D32',
        info: '#2563EB',
        warning: '#D97706',
        error: '#DC2626',
        featured: '#EEF3EE',
        herobg: '#F6F8F4',
      },
      fontFamily: {
        serif: ['Marcellus', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(17,24,39,0.06)',
        medium: '0 8px 30px rgba(17,24,39,0.10)',
        large: '0 20px 60px rgba(17,24,39,0.16)',
      },
    },
  },
};
