/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          DEFAULT: '#2DD4A8',
          dark: '#20B2AA',
          light: '#ECFDF5',
        },
        // Text
        ink: '#1A1A2E',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        'text-body': '#4B5563',
        'text-heading': '#374151',
        // Semantic
        success: {
          DEFAULT: '#059669',
          light: '#F0FDF9',
        },
        danger: {
          DEFAULT: '#EF4444',
          strong: '#DC2626',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        // Surface
        surface: {
          card: '#F9FAFB',
          badge: '#F3F4F6',
        },
        // Border
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        },
        // Disabled
        disabled: '#D1D5DB',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans SC"', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['26px', { lineHeight: '1.2', fontWeight: '800' }],
        'heading-lg': ['24px', { lineHeight: '1.2', fontWeight: '800' }],
        'heading-md': ['18px', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-sm': ['16px', { lineHeight: '1.4', fontWeight: '700' }],
        'body-lg': ['15px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-md': ['14px', { lineHeight: '1.5' }],
        'body-sm': ['13px', { lineHeight: '1.4', fontWeight: '600' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '600' }],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '40px',
      },
      maxWidth: {
        'workspace': '960px',
        'results': '1200px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'nav': '0 1px 3px rgba(0,0,0,0.05)',
        'footer': '0 -1px 3px rgba(0,0,0,0.05)',
        'btn': '0 1px 2px rgba(45,212,168,0.2)',
        'btn-hover': '0 4px 12px rgba(45,212,168,0.3)',
      },
      backgroundImage: {
        'page-pattern': 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
      },
      animation: {
        'pulse-opacity': 'pulse-opacity 1.5s ease-in-out infinite',
        'progress-stripes': 'progress-stripes 1s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        'pulse-opacity': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'progress-stripes': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '20px 0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
