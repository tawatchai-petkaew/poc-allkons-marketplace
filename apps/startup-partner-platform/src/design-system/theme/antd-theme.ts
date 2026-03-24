import type { ThemeConfig } from 'antd';
import { colors } from '../tokens/colors';
import { fontFamily, fontSize } from '../tokens/typography';
import { borderRadius } from '../tokens/border-radius';
import { shadows } from '../tokens/shadows';

/**
 * Ant Design v5 Theme — Allkons Design System
 * Source: Figma "Allkons DS1"
 */
export const antdTheme: ThemeConfig = {
  token: {
    // ─── Brand Colors ───────────────────────────────────────────────────────
    colorPrimary:      colors.primary.DEFAULT,
    colorSuccess:      colors.success.DEFAULT,
    colorWarning:      colors.warning.DEFAULT,
    colorError:        colors.error.DEFAULT,
    colorInfo:         colors.info.DEFAULT,

    // ─── Primary hover / active states ──────────────────────────────────────
    colorPrimaryHover:  colors.primary.p40,
    colorPrimaryActive: colors.primary.p20,
    colorPrimaryBg:     colors.primary.p90,
    colorPrimaryBgHover: colors.primary.p80,
    colorPrimaryBorder: colors.primary.p60,

    // ─── Text ───────────────────────────────────────────────────────────────
    colorText:          colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorTextTertiary:  colors.text.quaternary,
    colorTextQuaternary: colors.text.placeholder,
    colorTextDisabled:  colors.text.disabled,
    colorTextPlaceholder: colors.text.placeholder,

    // ─── Background ─────────────────────────────────────────────────────────
    colorBgContainer:   colors.background.primary,
    colorBgLayout:      colors.background.secondary,
    colorBgElevated:    colors.background.primary,
    colorBgSpotlight:   colors.neutral[20],
    colorFillAlter:     colors.background.secondary,

    // ─── Border ─────────────────────────────────────────────────────────────
    colorBorder:         colors.border.primary,
    colorBorderSecondary: colors.border.secondary,

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
      headerBg:         colors.background.secondary,
      headerColor:      colors.text.secondary,
      rowHoverBg:       colors.background.secondary,
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
      inkBarColor:       colors.primary.DEFAULT,
      itemSelectedColor: colors.primary.DEFAULT,
      itemHoverColor:    colors.primary.p20,
    },

    // ─── Tag ────────────────────────────────────────────────────────────────
    Tag: {
      borderRadius:    4,
      defaultBg:       colors.neutral.p95,
      defaultColor:    colors.text.secondary,
    },

    // ─── Badge ──────────────────────────────────────────────────────────────
    Badge: {
      colorError:    colors.error.DEFAULT,
      colorSuccess:  colors.success.DEFAULT,
    },

    // ─── Menu ───────────────────────────────────────────────────────────────
    Menu: {
      itemSelectedBg:   colors.primary.p90,
      itemSelectedColor: colors.primary.p20,
      itemHoverBg:      colors.background.secondary,
      borderRadius:     8,
    },

    // ─── Pagination ─────────────────────────────────────────────────────────
    Pagination: {
      borderRadius:    8,
      itemActiveBg:    colors.primary.DEFAULT,
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
      colorPrimary:      colors.primary.DEFAULT,
      colorPrimaryHover: colors.primary.p20,
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
      colorBgSpotlight: colors.neutral[20],
    },
  },
};
