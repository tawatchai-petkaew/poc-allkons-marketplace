import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS Config — Allkons Design System
 * Source: Figma "Allkons DS1"
 * Tokens are kept in sync with src/design-system/tokens/
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Colors ─────────────────────────────────────────────────────────────
      colors: {
        // Primary (Brand Green)
        primary: {
          DEFAULT: '#00AF43',
          p20:     '#008C36',
          p40:     '#33BF69',
          p60:     '#99DFB4',
          p80:     '#CCEFD9',
          p90:     '#E5F7EC',
          dark:    '#006928',
          hover:   '#E5F7EC',
          // legacy aliases
          background:        '#00AF43',
          'background-dark': '#008C36',
          subtle:            '#E5F7EC',
        },

        // Success
        success: {
          DEFAULT: '#1EB950',
          p20:     '#16873A',
          p60:     '#97DFAE',
          p80:     '#ACE5BE',
          p90:     '#E8F8ED',
          darker:  '#11662C',
          lighter: '#ACE5BE',
          subtle:  '#E8F8ED',
        },

        // Warning
        warning: {
          DEFAULT: '#FFAB08',
          p20:     '#CC8906',
          p60:     '#FFDD9C',
          p80:     '#FFEECE',
          p90:     '#FFF7E6',
          darker:  '#996705',
          subtle:  '#FFF3E6',
        },

        // Error
        error: {
          DEFAULT: '#DA2110',
          p20:     '#AE1A0C',
          p60:     '#F0A69F',
          p80:     '#F7D2CF',
          p90:     '#FBE8E7',
          dark:    '#AE1A0C',
          hover:   '#FBE8E7',
          lighter: '#F0A69F',
          subtle:  '#FBE8E7',
        },

        // Info
        info: {
          DEFAULT: '#65B2E8',
          p60:     '#C1E0F5',
          p80:     '#E0EFFA',
          p90:     '#EFF7FC',
          darker:  '#3C6A8B',
          subtle:  '#EFF7FC',
        },

        // Neutral
        neutral: {
          '00':    '#090B0D',
          20:      '#242A34',
          40:      '#37404F',
          60:      '#5B6A83',
          p60:     '#9DA6B5',
          p80:     '#DEE1E6',
          p90:     '#EFF0F3',
          p95:     '#F7F8F9',
          // legacy aliases
          'utils-00':   '#5B6A83',
          90:           '#090B0D',
          text:         '#37404F',
          bg:           '#F7F8F9',
          border:       '#DEE1E6',
          'hover-text': '#242A34',
          'hover-border': '#BDC3CD',
        },

        // Text
        text: {
          primary:     '#12151A',
          secondary:   '#37404F',
          tertiary:    '#495569',
          quaternary:  '#5B6A83',
          quinary:     '#7C889C',
          placeholder: '#9DA6B5',
          disabled:    '#BDC3CD',
          brand:       '#008C36',
          // legacy
          quarternary:        '#5B6A83',
          breadcrumb:         '#495569',
          'breadcrumb-active': '#008C36',
          'brand-dark':        '#008C36',
        },

        // Background
        background: {
          primary:        '#FFFFFF',
          secondary:      '#F7F8F9',
          tertiary:       '#DEE1E6',
          'primary-hover': '#F7F8F9',
          warning: { subtle: '#FFF7E6' },
        },

        // Border
        border: {
          primary:       '#DEE1E6',
          secondary:     '#BDC3CD',
          brand:         { lighter: '#99DFB4' },
          'primary-light': '#33BF69',
          tertiary:      '#9DA6B5',
          warning:       { lighter: '#FFDD9C' },
        },

        // Icon
        icon: {
          secondary:    '#37404F',
          quinary:      '#495569',
          tertiary:     '#495569',
          'brand-dark': '#008C36',
        },

        // Brand (Blue)
        brand: {
          DEFAULT: '#477AB3',
          lighter: '#F3F8FD',
          darker:  '#183E60',
          '00':    '#477AB3',
          20:      '#477AB3',
          p60:     '#B5CAE1',
          p20:     '#B5CAE1',
          icon:    '#FFFFFF',
        },

        // Lavender Purple
        lavender: {
          purple00:  '#A3A2DD',
          purple20:  '#8282B1',
          purpleP60: '#DADAF1',
          purpleP90: '#F6F6FC',
        },

        // Dark Orange
        darkOrange: {
          '00': '#E44218',
          p20:  '#E96846',
          p90:  '#FCECE8',
        },

        // Button
        button: {
          tertiary:             '#008C36',
          'tertiary-neutral-icon': '#242A34',
        },

        // Utils
        utils: {
          'primary-p60': '#99DFB4',
          'primary-p90': '#E5F7EC',
          'primary-p20': '#008C36',
          warning:  { '00': '#FFAB08' },
          error:    { '00': '#DA2110' },
          success:  { '00': '#1EB950' },
        },

        // Gray (legacy)
        gray: {
          light: '#5B6A83',
          dark:  '#050507',
        },

        disabled: '#DEE1E6',
      },

      // ─── Box Shadow (from Figma Shadow page) ──────────────────────────────
      boxShadow: {
        sm:   '0px 1px 3px 0px rgba(36,42,52,0.10)',
        md:   '0px 4px 8px 0px rgba(36,42,52,0.10)',
        lg:   '0px 6px 12px 0px rgba(36,42,52,0.10)',
        xl:   '0px 8px 24px 0px rgba(36,42,52,0.10)',
        '2xl': '0px 12px 36px 0px rgba(36,42,52,0.11)',
        '3xl': '0px 8px 32px 0px rgba(0,0,0,0.02)',
        // Focus rings
        'focus-brand':         '0 0 0 3px #CCEFD9',
        'focus-brand-dark':    '0 0 0 0.5px #FFFFFF, 0 0 0 3px #99DFB4',
        'focus-brand-darker':  '0 0 0 0.5px #FFFFFF, 0 0 0 2px #008C36',
        'focus-error':         '0 0 0 3px #F7D2CF',
        'focus-warning':       '0 0 0 3px #FFEECE',
        'focus-success':       '0 0 0 3px #D4F2DE',
        'focus-info':          '0 0 0 3px #E0EFFA',
        'focus-neutral':       '0 0 0 3px #DEE1E6',
      },

      // ─── Border Radius (from Figma Border Radius page, 4px base unit) ─────
      borderRadius: {
        none:  '0px',
        sm:    '4px',
        DEFAULT: '8px',
        md:    '8px',
        lg:    '12px',
        xl:    '16px',
        '2xl': '24px',
        full:  '9999px',
      },

      // ─── Screens / Breakpoints ────────────────────────────────────────────
      screens: {
        xs:    '320px',
        sm:    '576px',
        md:    '768px',
        lg:    '1024px',
        xl:    '1280px',
        '2xl': '1536px',
      },

      // ─── Font Family ──────────────────────────────────────────────────────
      fontFamily: {
        sans:                   ['"Noto Sans Thai Looped"', 'sans-serif'],
        'noto-sans-thai-looped': ['"Noto Sans Thai Looped"', 'sans-serif'],
        kanit:                  ['"Kanit"', 'sans-serif'],
      },

      // ─── Spacing (4px base unit from Figma) ───────────────────────────────
      spacing: {
        1:  '4px',
        2:  '8px',
        3:  '12px',
        4:  '16px',
        5:  '20px',
        6:  '24px',
        7:  '28px',
        8:  '32px',
        9:  '36px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        30: '120px',
        40: '160px',
      },
    },
  },
  plugins: [],
};

export default config;
