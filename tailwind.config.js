/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./index.html",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            // Brand Colors
            colors: {
                brand: {
                    primary: '#2D5A4A',
                    secondary: '#B8936A',
                    accent: '#4A9B7F',
                },
                // Warm Neutral Palette
                neutral: {
                    50: '#FAF9F7',
                    100: '#F3F1ED',
                    200: '#E8E4DE',
                    300: '#D4CFC6',
                    400: '#A89F91',
                    500: '#7D7468',
                    600: '#5C554B',
                    700: '#403B34',
                    800: '#2A2722',
                    900: '#1A1815',
                },
                // Semantic Colors
                success: '#34A853',
                warning: '#F9A825',
                error: '#D93025',
                info: '#4285F4',
                // Coach Categories
                coach: {
                    health: '#34A853',
                    'health-light': '#81C784',
                    wealth: '#F9A825',
                    'wealth-light': '#FFD54F',
                    wisdom: '#4285F4',
                    'wisdom-light': '#90CAF9',
                    career: '#7B1FA2',
                    'career-light': '#BA68C8',
                    relationships: '#E91E63',
                    'relationships-light': '#F48FB1',
                    creativity: '#FF5722',
                    'creativity-light': '#FFAB91',
                },
                // PARA Categories
                para: {
                    project: '#4285F4',
                    area: '#34A853',
                    resource: '#F9A825',
                    archive: '#A89F91',
                },
                // Memory Tiers
                memory: {
                    hot: '#D93025',
                    warm: '#F9A825',
                    cold: '#A89F91',
                },
            },
            // Typography
            fontFamily: {
                display: ['Outfit', 'system-ui', 'sans-serif'],
                body: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1.4' }],
                'sm': ['0.875rem', { lineHeight: '1.5' }],
                'base': ['1rem', { lineHeight: '1.5' }],
                'lg': ['1.125rem', { lineHeight: '1.5' }],
                'xl': ['1.25rem', { lineHeight: '1.35' }],
                '2xl': ['1.5rem', { lineHeight: '1.3' }],
                '3xl': ['1.875rem', { lineHeight: '1.2' }],
                '4xl': ['2.25rem', { lineHeight: '1.2' }],
                '5xl': ['3rem', { lineHeight: '1.1' }],
            },
            // Spacing
            spacing: {
                '0.5': '0.125rem', // 2px
                '1': '0.25rem',    // 4px
                '2': '0.5rem',     // 8px
                '3': '0.75rem',    // 12px
                '4': '1rem',       // 16px
                '5': '1.25rem',    // 20px
                '6': '1.5rem',     // 24px
                '8': '2rem',       // 32px
                '10': '2.5rem',    // 40px
                '12': '3rem',      // 48px
                '16': '4rem',      // 64px
                '20': '5rem',      // 80px
            },
            // Border Radius
            borderRadius: {
                'none': '0',
                'sm': '0.25rem',   // 4px
                'md': '0.5rem',    // 8px
                'lg': '0.75rem',   // 12px
                'xl': '1rem',      // 16px
                '2xl': '1.5rem',   // 24px
                'full': '9999px',
            },
            // Box Shadows (Warm)
            boxShadow: {
                'sm': '0 1px 2px rgba(26, 24, 21, 0.05)',
                'md': '0 4px 6px -1px rgba(26, 24, 21, 0.07), 0 2px 4px -1px rgba(26, 24, 21, 0.04)',
                'lg': '0 10px 15px -3px rgba(26, 24, 21, 0.08), 0 4px 6px -2px rgba(26, 24, 21, 0.03)',
                'xl': '0 20px 25px -5px rgba(26, 24, 21, 0.1), 0 10px 10px -5px rgba(26, 24, 21, 0.02)',
                '2xl': '0 25px 50px -12px rgba(26, 24, 21, 0.15)',
                'inner': 'inset 0 2px 4px rgba(26, 24, 21, 0.04)',
                'glow-primary': '0 0 0 3px rgba(45, 90, 74, 0.2)',
                'glow-error': '0 0 0 3px rgba(217, 48, 37, 0.2)',
            },
            // Transitions
            transitionTimingFunction: {
                'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'in': 'cubic-bezier(0.4, 0, 1, 1)',
                'out': 'cubic-bezier(0, 0, 0.2, 1)',
                'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            },
            transitionDuration: {
                'instant': '75ms',
                'fast': '150ms',
                'normal': '200ms',
                'slow': '300ms',
                'slower': '500ms',
            },
            // Z-Index
            zIndex: {
                'base': '0',
                'raised': '10',
                'floating': '20',
                'modal': '30',
                'overlay': '40',
                'toast': '50',
            },
            // Height tokens for components
            height: {
                'btn-sm': '32px',
                'btn-md': '40px',
                'btn-lg': '48px',
                'input': '44px',
                'nav': '64px',
                'header': '56px',
            },
            // Min width/height for touch targets
            minWidth: {
                'touch': '44px',
            },
            minHeight: {
                'touch': '44px',
            },
            // Max widths for containers
            maxWidth: {
                'chat': '720px',
                'card': '400px',
                'form': '480px',
                'content': '640px',
                'dashboard': '1280px',
            },
            // Animations
            animation: {
                'fade-in': 'fadeIn 200ms ease-out',
                'slide-up': 'slideUp 300ms ease-out',
                'scale-pop': 'scalePop 150ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                'pulse-sync': 'pulse 2s infinite ease-in-out',
                'typing': 'bounce 1.4s infinite ease-in-out both',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(16px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scalePop: {
                    '0%': { transform: 'scale(0.95)', opacity: '0.8' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                bounce: {
                    '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.5' },
                    '40%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
