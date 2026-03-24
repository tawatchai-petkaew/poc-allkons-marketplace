import type { ThemeConfig } from 'antd';
import { brandPrimary, success, warning, error, info, textColor, backgroundColor, borderColor, neutral } from '../tokens/alias';
import { fontFamily, fontSize } from '../tokens/typography';
import { shadows } from '../tokens/shadows';

/**
 * Ant Design v5 Theme — Allkons Design System
 * Source: Figma "Allkons DS1"
 */
export const antdTheme: ThemeConfig = {
  token: {
    // ─── Brand Colors ───────────────────────────────────────────────────────
    colorPrimary:      brandPrimary['00'],
    colorSuccess:      success['00'],
    colorWarning:      warning['00'],
    colorError:        error['00'],
    colorInfo:         info['00'],

    // ─── Primary hover / active states ──────────────────────────────────────
    // Verified against Figma variables: Component/Button/Primary/Brand/*_hover
    colorPrimaryHover:   brandPrimary['20'],  // #008C36 — filled hover bg   ✓
    colorPrimaryActive:  brandPrimary['30'],  // #006928 — filled pressed bg  ✓
    colorPrimaryBg:      brandPrimary.p90,   // #E5F7EC — outline/ghost hover bg ✓
    colorPrimaryBgHover: brandPrimary.p90,   // #E5F7EC — same as above       ✓
    colorPrimaryBorder:  brandPrimary.p60,   // #99DFB4 — focus ring base

    // ─── Text ───────────────────────────────────────────────────────────────
    colorText:          textColor.primary,
    colorTextSecondary: textColor.secondary,
    colorTextTertiary:  textColor.quaternary,
    colorTextQuaternary: textColor.placeholder,
    colorTextDisabled:  textColor.disabled,
    colorTextPlaceholder: textColor.placeholder,

    // ─── Background ─────────────────────────────────────────────────────────
    colorBgContainer:   backgroundColor.primary,
    colorBgLayout:      backgroundColor.secondary,
    colorBgElevated:    backgroundColor.primary,
    colorBgSpotlight:   neutral['60'],
    colorFillAlter:     backgroundColor.secondary,

    // ─── Border ─────────────────────────────────────────────────────────────
    colorBorder:         borderColor.primary,
    colorBorderSecondary: borderColor.secondary,

    // ─── Typography ─────────────────────────────────────────────────────────
    fontFamily:    fontFamily.primary,
    fontSize:      fontSize.md.px,   // 16px base
    fontSizeSM:    fontSize.sm.px,   // 14px
    fontSizeLG:    fontSize.lg.px,   // 18px
    fontSizeXL:    fontSize['h5'].px, // 20px
    fontSizeHeading1: fontSize['h1'].px, // 40px
    fontSizeHeading2: fontSize['h2'].px, // 32px
    fontSizeHeading3: fontSize['h3'].px, // 28px
    fontSizeHeading4: fontSize['h4'].px, // 24px
    fontSizeHeading5: fontSize['h5'].px, // 20px

    // ─── Border Radius ──────────────────────────────────────────────────────
    borderRadius:    8,  // md = 8px (default)
    borderRadiusSM:  4,  // sm = 4px
    borderRadiusLG:  12, // lg = 12px
    borderRadiusXS:  2,

    // ─── Shadows ────────────────────────────────────────────────────────────
    boxShadow:       shadows.sm,
    boxShadowSecondary: shadows.md,

    // ─── Sizing ─────────────────────────────────────────────────────────────
    controlHeight:   40,   // default input/button height
    controlHeightSM: 32,
    controlHeightLG: 48,
    controlHeightXS: 24,

    // ─── Misc ───────────────────────────────────────────────────────────────
    wireframe:       false,
    motion:          true,
  },

  components: {
    // ─── Button ─────────────────────────────────────────────────────────────
    Button: {
      borderRadius:         8,
      borderRadiusSM:       8,
      borderRadiusLG:       8,
      fontWeight:           600,
      primaryShadow:        'none',
      defaultShadow:        'none',
      dangerShadow:         'none',
      controlHeight:        40,
      controlHeightSM:      32,
      controlHeightLG:      48,
      paddingInline:        20,
      paddingInlineSM:      12,
      paddingInlineLG:      24,

      // ── Color tokens — component-level overrides AntD algorithm ───────────
      // Component tokens take absolute priority over global tokens in AntD v5.
      // Verified against Figma: Component/Button/Primary/Brand/*
      colorPrimary:         brandPrimary['00'],  // #00AF43 — filled bg default
      colorPrimaryHover:    brandPrimary['20'],  // #008C36 — filled hover bg (DARKER) ✓
      colorPrimaryActive:   brandPrimary['30'],  // #006928 — filled active/pressed bg ✓
      colorPrimaryBg:       brandPrimary.p90,   // #E5F7EC — outline/ghost hover bg ✓
      colorPrimaryBgHover:  brandPrimary.p90,   // #E5F7EC — same ✓
      colorPrimaryBorder:   brandPrimary.p60,   // #99DFB4 — focus ring ✓
    },

    // ─── Input ──────────────────────────────────────────────────────────────
    Input: {
      borderRadius:    8,
      borderRadiusSM:  4,
      borderRadiusLG:  8,
      controlHeight:   40,
      controlHeightSM: 32,
      controlHeightLG: 48,
      paddingInline:   12,
    },

    // ─── Select ─────────────────────────────────────────────────────────────
    Select: {
      borderRadius:    8,
      controlHeight:   40,
      controlHeightSM: 32,
      controlHeightLG: 48,
    },

    // ─── Table ──────────────────────────────────────────────────────────────
    Table: {
      borderRadius:     8,
      borderRadiusLG:   8,
      headerBg:         backgroundColor.secondary,
      headerColor:      textColor.secondary,
      rowHoverBg:       backgroundColor.secondary,
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },

    // ─── Card ───────────────────────────────────────────────────────────────
    Card: {
      borderRadius:    12,
      borderRadiusLG:  12,
      paddingLG:       24,
    },

    // ─── Modal ──────────────────────────────────────────────────────────────
    Modal: {
      borderRadius:    12,
      borderRadiusLG:  12,
    },

    // ─── Tabs ───────────────────────────────────────────────────────────────
    Tabs: {
      inkBarColor:       brandPrimary['00'],
      itemSelectedColor: brandPrimary['00'],
      itemHoverColor:    brandPrimary['20'],
    },

    // ─── Tag ────────────────────────────────────────────────────────────────
    Tag: {
      borderRadius:    4,
      defaultBg:       neutral.p95,
      defaultColor:    textColor.secondary,
    },

    // ─── Badge ──────────────────────────────────────────────────────────────
    Badge: {
      colorError:    error['00'],
      colorSuccess:  success['00'],
    },

    // ─── Menu ───────────────────────────────────────────────────────────────
    Menu: {
      itemSelectedBg:   brandPrimary.p90,
      itemSelectedColor: brandPrimary['20'],
      itemHoverBg:      backgroundColor.secondary,
      borderRadius:     8,
    },

    // ─── Pagination ─────────────────────────────────────────────────────────
    Pagination: {
      borderRadius:    8,
      itemActiveBg:    brandPrimary['00'],
    },

    // ─── DatePicker ─────────────────────────────────────────────────────────
    DatePicker: {
      borderRadius:    8,
      controlHeight:   40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },

    // ─── Checkbox ───────────────────────────────────────────────────────────
    Checkbox: {
      borderRadius: 4,
    },

    // ─── Switch ─────────────────────────────────────────────────────────────
    Switch: {
      colorPrimary:      brandPrimary['00'],
      colorPrimaryHover: brandPrimary['20'],
    },

    // ─── Notification ───────────────────────────────────────────────────────
    Notification: {
      borderRadius: 12,
    },

    // ─── Message ────────────────────────────────────────────────────────────
    Message: {
      borderRadius: 8,
    },

    // ─── Typography ─────────────────────────────────────────────────────────
    Typography: {
      fontWeightStrong: 700,
      titleMarginBottom: '0.5em',
      titleMarginTop: '0',
    },

    // ─── Form ───────────────────────────────────────────────────────────────
    Form: {
      labelFontSize: fontSize.sm.px,
      itemMarginBottom: 20,
    },

    // ─── Drawer ─────────────────────────────────────────────────────────────
    Drawer: {
      borderRadius: 12,
    },

    // ─── Tooltip ────────────────────────────────────────────────────────────
    Tooltip: {
      borderRadius: 8,
      colorBgSpotlight: neutral['60'],
    },
  },
};
