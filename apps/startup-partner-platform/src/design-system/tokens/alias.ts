/**
 * LAYER 2 — Alias / Semantic Color Tokens
 * Source: Figma "Allkons DS1" — Alias.json (Mode 1)
 *
 * Structure mirrors the Figma variable groups:
 *   Global  → neutral, base, transparency
 *   Brand.M → brandPrimary, brandSecondary, brandTertiary
 *   Brand.CM → cmPrimary, cmSecondary, cmTertiary
 *   System  → success, warning, error, info
 *
 * Rules:
 *   - No hex literals here — always reference primitive
 *   - Component tokens (text, bg, border, button) are built from these scales
 *   - This file is what Tailwind config & Ant Design theme import from
 */
import { primitive } from './primitives';

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL — Neutral scale (Figma "Gray" / gy)
// Source: Alias.json > Global.Neutral
// ═══════════════════════════════════════════════════════════════════════════
export const neutral = {
  '95':  primitive.gray['95'],   // #050507
  '90':  primitive.gray['90'],   // #090B0D
  '80':  primitive.gray['80'],   // #12151A
  '70':  primitive.gray['70'],   // #1B2027
  '60':  primitive.gray['60'],   // #242A34
  '50':  primitive.gray['50'],   // #2E3542
  '40':  primitive.gray['40'],   // #37404F
  '30':  primitive.gray['30'],   // #404A5C
  '20':  primitive.gray['20'],   // #495569
  '10':  primitive.gray['10'],   // #525F76
  '00':  primitive.gray['00'],   // #5B6A83
  p10:   primitive.gray.p10,     // #6B798F
  p20:   primitive.gray.p20,     // #7C889C
  p30:   primitive.gray.p30,     // #8C97A8
  p40:   primitive.gray.p40,     // #9DA6B5
  p50:   primitive.gray.p50,     // #ADB4C1
  p60:   primitive.gray.p60,     // #BDC3CD
  p70:   primitive.gray.p70,     // #CED2DA
  p80:   primitive.gray.p80,     // #DEE1E6
  p90:   primitive.gray.p90,     // #EFF0F3
  p95:   primitive.gray.p95,     // #F7F8F9
  white: primitive.gray.white,   // #FFFFFF
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BRAND — M Platform
// ═══════════════════════════════════════════════════════════════════════════

// Primary brand (Figma "Special Green" / sg)
// Source: Alias.json > Brand.M.Primary
export const brandPrimary = {
  '90':  primitive.specialGreen['90'],   // #031308
  '80':  primitive.specialGreen['80'],   // #06230F
  '70':  primitive.specialGreen['70'],   // #083416
  '60':  primitive.specialGreen['60'],   // #0B441E
  '50':  primitive.specialGreen['50'],   // #0E5525
  '40':  primitive.specialGreen['40'],   // #11662C  (sg-50 in Figma)
  '30':  primitive.specialGreen['30'],   // #006928  (sg-40 & sg-30 in Figma — intentional duplicate)
  '20':  primitive.specialGreen['20'],   // #008C36  — hover color
  '10':  primitive.specialGreen['10'],   // #009D3C
  '00':  primitive.specialGreen['00'],   // #00AF43  DEFAULT
  p10:   primitive.specialGreen.p10,     // #1AB756
  p20:   primitive.specialGreen.p20,     // #33BF69
  p30:   primitive.specialGreen.p30,     // #4DC77B
  p40:   primitive.specialGreen.p40,     // #66CF8E
  p50:   primitive.specialGreen.p50,     // #80D7A1
  p60:   primitive.specialGreen.p60,     // #99DFB4  — focus ring
  p70:   primitive.specialGreen.p70,     // #B2E7C7
  p80:   primitive.specialGreen.p80,     // #CCEFD9
  p90:   primitive.specialGreen.p90,     // #E5F7EC  — subtle bg (outline/ghost hover)
} as const;

// Secondary brand (Figma "Dark Pink" / dp)
// Source: Alias.json > Brand.M.Secondary
export const brandSecondary = {
  '90':  primitive.darkPink['90'],   // #100006
  '80':  primitive.darkPink['80'],   // #20000B
  '70':  primitive.darkPink['70'],   // #2F0011
  '60':  primitive.darkPink['60'],   // #3F0017
  '50':  primitive.darkPink['50'],   // #4F001D
  '40':  primitive.darkPink['40'],   // #5F0022
  '30':  primitive.darkPink['30'],   // #6F0028
  '20':  primitive.darkPink['20'],   // #7E002E
  '10':  primitive.darkPink['10'],   // #8E0033
  '00':  primitive.darkPink['00'],   // #9E0039  DEFAULT
  p10:   primitive.darkPink.p10,     // #A81A4D
  p20:   primitive.darkPink.p20,     // #B13361
  p30:   primitive.darkPink.p30,     // #BB4D74
  p40:   primitive.darkPink.p40,     // #C56688
  p50:   primitive.darkPink.p50,     // #CF809C
  p60:   primitive.darkPink.p60,     // #D899B0
  p70:   primitive.darkPink.p70,     // #E2B2C4
  p80:   primitive.darkPink.p80,     // #ECCCD7
  p90:   primitive.darkPink.p90,     // #F5E5EB
} as const;

// Tertiary brand (Figma "Purple" / pp)
// Source: Alias.json > Brand.M.Tertiary
export const brandTertiary = {
  '90':  primitive.purple['90'],   // #0C0C13
  '80':  primitive.purple['80'],   // #191825
  '70':  primitive.purple['70'],   // #252538
  '60':  primitive.purple['60'],   // #31314A
  '50':  primitive.purple['50'],   // #3E3D5D
  '40':  primitive.purple['40'],   // #4A496F
  '30':  primitive.purple['30'],   // #565581
  '20':  primitive.purple['20'],   // #626294
  '10':  primitive.purple['10'],   // #6F6EA6
  '00':  primitive.purple['00'],   // #7B7AB9  DEFAULT
  p10:   primitive.purple.p10,     // #8887C0
  p20:   primitive.purple.p20,     // #9595C7
  p30:   primitive.purple.p30,     // #A3A2CE
  p40:   primitive.purple.p40,     // #B0AFD5
  p50:   primitive.purple.p50,     // #BDBCDC
  p60:   primitive.purple.p60,     // #CACAE3
  p70:   primitive.purple.p70,     // #D7D7EA
  p80:   primitive.purple.p80,     // #E5E4F1
  p90:   primitive.purple.p90,     // #F2F2F8
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BRAND — CM Platform
// Source: Alias.json > Brand.CM.*
// ═══════════════════════════════════════════════════════════════════════════

// CM Primary — Ocean Blue (ob) / Deep Blue (db)
export const cmPrimary = {
  default:   primitive.oceanBlue['00'],   // ob-00 = #477AB3
  deep:      primitive.deepBlue['00'],    // db-00 = #225889
  darker:    primitive.deepBlue['30'],    // db-30 = #183E60
} as const;

// CM Secondary — Sky Mist (sm) / Dusky Sky (ds)
export const cmSecondary = {
  subtle:  primitive.skyMist.p90,    // sm+90 = #F3F8FD
  default: primitive.skyMist['00'],  // sm-00 = #A1C7E8
  deep:    primitive.duskySky['00'], // ds-00 / ms-00 = #6A8DCF
} as const;

// CM Tertiary — Soft Purple (sp) / Lavender (lp) / Orchid Purple (op)
export const cmTertiary = {
  soft:    primitive.softPurple['00'],    // sp-00 = #D7DBFF
  default: primitive.lavender['00'],      // lp-00 = #A3A2DD
  deep:    primitive.orchidPurple['00'],  // op-00 = #7B7AB9
  darker:  primitive.orchidPurple['30'],  // op-30 = #565581
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM — Status colors
// ═══════════════════════════════════════════════════════════════════════════

// Success (Figma "Green" / gn)
// Source: Alias.json > System.Success
export const success = {
  '40':   primitive.green['40'],   // #11662C — darker
  '20':   primitive.green['20'],   // #16873A
  '00':   primitive.green['00'],   // #1EB950 — DEFAULT
  p50:    primitive.green.p50,     // #97DFAE
  p60:    primitive.green.p60,     // #ACE5BE
  p80:    primitive.green.p80,     // #D4F2DE
  p90:    primitive.green.p90,     // #E8F8ED  — subtle bg
  subtle: primitive.green.p90,
} as const;

// Warning (Figma "Refreshing Orange" / ro)
// Source: Alias.json > System.Warning
export const warning = {
  '40':   primitive.orange['40'],   // #996705 — darker
  '20':   primitive.orange['20'],   // #CC8906
  '00':   primitive.orange['00'],   // #FFAB08 — DEFAULT
  p60:    primitive.orange.p60,     // #FFDD9C
  p80:    primitive.orange.p80,     // #FFEECE
  p90:    primitive.orange.p90,     // #FFF7E6  — subtle bg
  subtle: primitive.orange.p90,
} as const;

// Error (Figma "Red" / rd)
// Source: Alias.json > System.Error
export const error = {
  '20':   primitive.red['20'],   // #AE1A0C — darker / hover
  '00':   primitive.red['00'],   // #DA2110 — DEFAULT
  p60:    primitive.red.p60,     // #F0A69F
  p80:    primitive.red.p80,     // #F7D2CF
  p90:    primitive.red.p90,     // #FBE8E7  — subtle bg
  subtle: primitive.red.p90,
} as const;

// Info (Figma "Blue" / be)
// Source: Alias.json > System.Info
export const info = {
  '40':   primitive.blue['40'],   // #3C6A8B — darker
  '00':   primitive.blue['00'],   // #65B2E8 — DEFAULT
  p60:    primitive.blue.p60,     // #C1E0F5
  p80:    primitive.blue.p80,     // #E0EFFA
  p90:    primitive.blue.p90,     // #EFF7FC  — subtle bg
  subtle: primitive.blue.p90,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SEMANTIC COMPONENT ROLES
// Built from the alias scales above — used by Tailwind & Ant Design theme
// ═══════════════════════════════════════════════════════════════════════════

// Text color roles
// Verified against colors.ts text group
export const textColor = {
  primary:     primitive.gray['80'],           // #12151A — main body text
  secondary:   primitive.gray['40'],           // #37404F
  tertiary:    primitive.gray['20'],           // #495569
  quaternary:  primitive.gray['00'],           // #5B6A83
  quinary:     primitive.gray.p20,             // #7C889C
  placeholder: primitive.gray.p40,            // #9DA6B5
  disabled:    primitive.gray.p60,            // #BDC3CD
  brand:       primitive.specialGreen['20'],  // #008C36
} as const;

// Background color roles
// Verified against colors.ts background group
export const backgroundColor = {
  primary:   primitive.white,        // #FFFFFF
  secondary: primitive.gray.p95,     // #F7F8F9
  tertiary:  primitive.gray.p80,     // #DEE1E6
  hover:     primitive.gray.p95,     // #F7F8F9
} as const;

// Border color roles
// Verified against colors.ts border group
export const borderColor = {
  primary:    primitive.gray.p80,             // #DEE1E6
  secondary:  primitive.gray.p60,             // #BDC3CD
  brand:      primitive.specialGreen.p60,     // #99DFB4
  brandLight: primitive.specialGreen.p20,     // #33BF69
  error:      primitive.red['00'],            // #DA2110
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TAILWIND / COMPONENT SEMANTIC TOKENS
// Short-name exports consumed by tailwind.config.ts and button.variants.ts
// ═══════════════════════════════════════════════════════════════════════════

// Primary brand button semantics
// Tailwind classes: primary-*, neutral-20 = #242A34, etc.
export const brand = {
  default:     brandPrimary['00'],   // #00AF43
  hover:       brandPrimary['20'],   // #008C36 — darker ✓
  active:      brandPrimary['30'],   // #006928
  subtle:      brandPrimary.p90,    // #E5F7EC — ghost/outline hover bg ✓
  text:        brandPrimary['20'],   // #008C36
  textHover:   brandPrimary['30'],   // #006928
  border:      brandPrimary['00'],   // #00AF43
  borderHover: brandPrimary['20'],   // #008C36
  focusRing:   brandPrimary.p60,    // #99DFB4
  bgDisabled:  neutral.p90,         // #EFF0F3
} as const;

// Error button semantics
export const errorColor = {
  default:     error['00'],   // #DA2110
  hover:       error.p90,    // #FBE8E7 — subtle bg
  subtle:      error.p90,    // #FBE8E7
  border:      error['00'],  // #DA2110
  borderHover: error['20'],  // #AE1A0C
  text:        error['00'],  // #DA2110
  textHover:   error['20'],  // #AE1A0C
  focusRing:   error.p60,   // #F0A69F
} as const;

// Neutral button semantics
// Note: `text` = #37404F (neutral-40), `textHover` = #242A34 (neutral-60)
export const neutralColor = {
  text:        textColor.secondary,          // #37404F
  textHover:   neutral['60'],                // #242A34
  textStrong:  textColor.primary,           // #12151A
  border:      borderColor.primary,         // #DEE1E6
  borderHover: borderColor.secondary,       // #BDC3CD
  bg:          backgroundColor.secondary,   // #F7F8F9
  bgHover:     backgroundColor.secondary,   // #F7F8F9
  bgDisabled:  neutral.p90,                 // #EFF0F3
  focusRing:   neutral.p80,                 // #DEE1E6
} as const;

// Status colors object for tailwind.config.ts
export const status = {
  success: {
    default:   success['00'],   // #1EB950
    hover:     success['20'],   // #16873A
    subtle:    success.p90,    // #E8F8ED
    focusRing: success.p80,    // #D4F2DE
  },
  warning: {
    default:   warning['00'],  // #FFAB08
    hover:     warning['20'],  // #CC8906
    subtle:    warning.p90,   // #FFF7E6
    focusRing: warning.p80,   // #FFEECE
  },
  info: {
    default:   info['00'],     // #65B2E8
    hover:     info['40'],     // #3C6A8B
    subtle:    info.p90,      // #EFF7FC
    focusRing: info.p80,      // #E0EFFA
  },
} as const;

// Short-name re-exports (for tailwind.config.ts)
export const text       = textColor;
export const background = backgroundColor;
export const border     = borderColor;

// ─── Button component tokens ──────────────────────────────────────────────
// Source: Figma "Component/Button/*"
// Verified against button.variants.ts comments
export const buttonColor = {
  // ── Primary (filled) ─────────────────────────────────────────────────
  primary: {
    brand: {
      // bg=#00AF43 → hover #008C36, text=white → #E5F7EC
      default:  { bg: primitive.specialGreen['00'],  text: primitive.white,             border: primitive.specialGreen['00'] },
      hover:    { bg: primitive.specialGreen['20'],  text: primitive.specialGreen.p90,  border: primitive.specialGreen['20'] },
      active:   { bg: primitive.specialGreen['30'],  text: primitive.specialGreen.p90,  border: primitive.specialGreen['30'] },
      disabled: { bg: primitive.gray.p90,            text: primitive.gray.p40,          border: primitive.gray.p95 },
    },
    error: {
      // bg=#DA2110 → hover #AE1A0C, text=white → #FBE8E7
      default:  { bg: primitive.red['00'],  text: primitive.white,     border: primitive.red['00'] },
      hover:    { bg: primitive.red['20'],  text: primitive.red.p90,   border: primitive.red['20'] },
      active:   { bg: primitive.red['20'],  text: primitive.red.p90,   border: primitive.red['20'] },
      disabled: { bg: primitive.gray.p90,  text: primitive.gray.p40,  border: primitive.gray.p95 },
    },
  },

  // ── Secondary (outline) ───────────────────────────────────────────────
  secondary: {
    brand: {
      // border=#00AF43, text=#008C36 → hover bg=#E5F7EC, border=#008C36, text=#006928
      default:  { bg: 'transparent',                text: primitive.specialGreen['20'],  border: primitive.specialGreen['00'] },
      hover:    { bg: primitive.specialGreen.p90,   text: primitive.specialGreen['30'],  border: primitive.specialGreen['20'] },
      active:   { bg: primitive.specialGreen.p90,   text: primitive.specialGreen['30'],  border: primitive.specialGreen['20'] },
      disabled: { bg: primitive.gray.p90,           text: primitive.gray.p40,            border: primitive.gray.p95 },
    },
    neutral: {
      // border=#DEE1E6, text=#37404F → hover bg=#F7F8F9, border=#BDC3CD, text=#242A34
      default:  { bg: 'transparent',       text: primitive.gray['40'],  border: primitive.gray.p80 },
      hover:    { bg: primitive.gray.p95,  text: primitive.gray['60'],  border: primitive.gray.p60 },
      active:   { bg: primitive.gray.p95,  text: primitive.gray['60'],  border: primitive.gray.p60 },
      disabled: { bg: primitive.gray.p90,  text: primitive.gray.p40,   border: primitive.gray.p95 },
    },
    error: {
      // bg=#FFF, border=#DA2110, text=#DA2110 → hover bg=#FBE8E7, border=#AE1A0C, text=#AE1A0C
      default:  { bg: primitive.white,     text: primitive.red['00'],  border: primitive.red['00'] },
      hover:    { bg: primitive.red.p90,   text: primitive.red['20'],  border: primitive.red['20'] },
      active:   { bg: primitive.red.p90,   text: primitive.red['20'],  border: primitive.red['20'] },
      disabled: { bg: primitive.gray.p90,  text: primitive.gray.p40,  border: primitive.gray.p95 },
    },
  },

  // ── Ghost / Tertiary ──────────────────────────────────────────────────
  ghost: {
    brand: {
      // text=#008C36 → hover bg=#E5F7EC, text=#006928
      default:  { bg: 'transparent',                text: primitive.specialGreen['20'],  border: 'transparent' },
      hover:    { bg: primitive.specialGreen.p90,   text: primitive.specialGreen['30'],  border: 'transparent' },
      active:   { bg: primitive.specialGreen.p90,   text: primitive.specialGreen['30'],  border: 'transparent' },
      disabled: { bg: primitive.gray.p90,           text: primitive.gray.p40,            border: 'transparent' },
    },
    neutral: {
      // text=#242A34 → hover bg=#F7F8F9, text=#12151A
      default:  { bg: 'transparent',       text: primitive.gray['60'],  border: 'transparent' },
      hover:    { bg: primitive.gray.p95,  text: primitive.gray['80'],  border: 'transparent' },
      active:   { bg: primitive.gray.p95,  text: primitive.gray['80'],  border: 'transparent' },
      disabled: { bg: primitive.gray.p90,  text: primitive.gray.p40,   border: 'transparent' },
    },
    error: {
      // text=#DA2110 → hover bg=#FBE8E7, text=#AE1A0C
      default:  { bg: 'transparent',      text: primitive.red['00'],  border: 'transparent' },
      hover:    { bg: primitive.red.p90,  text: primitive.red['20'],  border: 'transparent' },
      active:   { bg: primitive.red.p90,  text: primitive.red['20'],  border: 'transparent' },
      disabled: { bg: primitive.gray.p90, text: primitive.gray.p40,  border: 'transparent' },
    },
  },

  // ── Link ─────────────────────────────────────────────────────────────
  link: {
    brand:   { text: primitive.specialGreen['20'],  textHover: primitive.specialGreen['30'] },
    neutral: { text: primitive.gray['60'],           textHover: primitive.gray['80'] },
    error:   { text: primitive.red['00'],            textHover: primitive.red['20'] },
  },
} as const;
