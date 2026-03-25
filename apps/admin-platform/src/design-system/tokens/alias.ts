/**
 * LAYER 2 — Alias / Semantic Color Tokens
 * Source: Figma "Allkons DS1" — Alias.json (Mode 1)
 *
 * Structure mirrors the Figma variable groups:
 *   Global       → neutral, base, transparency, utility.*
 *   Brand.M      → brandPrimary, brandSecondary, brandTertiary
 *   Brand.CM     → cmPrimary, cmSecondary, cmTertiary  (full scales)
 *   System       → success, warning, error, info       (full scales)
 *   Component    → textColor, backgroundColor, borderColor, buttonColor
 *   Tailwind     → brand, errorColor, neutralColor, status, text, background, border
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
// GLOBAL — Base (white / black / transparent)
// Source: Alias.json > Global.Base
// ═══════════════════════════════════════════════════════════════════════════
export const base = {
  white:       primitive.white,        // #FFFFFF
  black:       primitive.black,        // #000000
  transparent: 'transparent',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL — Transparency (alpha scale)
// Source: Alias.json > Global.Transparency
// Maps to primitive.alpha.white / primitive.alpha.black
// ═══════════════════════════════════════════════════════════════════════════
export const transparency = {
  white: {
    0:  primitive.alpha.white[0],   // rgba(255,255,255,0)
    10: primitive.alpha.white[10],  // rgba(255,255,255,0.1)
    20: primitive.alpha.white[20],
    30: primitive.alpha.white[30],
    40: primitive.alpha.white[40],
    50: primitive.alpha.white[50],
    60: primitive.alpha.white[60],
    70: primitive.alpha.white[70],
    80: primitive.alpha.white[80],
    90: primitive.alpha.white[90],  // rgba(255,255,255,0.9)
  },
  black: {
    0:  primitive.alpha.black[0],   // rgba(0,0,0,0)
    10: primitive.alpha.black[10],
    20: primitive.alpha.black[20],
    30: primitive.alpha.black[30],
    40: primitive.alpha.black[40],
    50: primitive.alpha.black[50],
    60: primitive.alpha.black[60],
    70: primitive.alpha.black[70],
    80: primitive.alpha.black[80],
    90: primitive.alpha.black[90],  // rgba(0,0,0,0.9)
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL — Utility Palettes
// Source: Alias.json > Global.Utility.*
// Full step scales for palettes not covered by Brand.M or System
// ═══════════════════════════════════════════════════════════════════════════

// Dark Orange (do) — accent / highlight
export const utilityDarkOrange = {
  '90': primitive.darkOrange['90'],
  '80': primitive.darkOrange['80'],
  '70': primitive.darkOrange['70'],
  '60': primitive.darkOrange['60'],
  '50': primitive.darkOrange['50'],
  '40': primitive.darkOrange['40'],
  '30': primitive.darkOrange['30'],
  '20': primitive.darkOrange['20'],
  '10': primitive.darkOrange['10'],
  '00': primitive.darkOrange['00'],   // #E44218 DEFAULT
  p10:  primitive.darkOrange.p10,
  p20:  primitive.darkOrange.p20,
  p30:  primitive.darkOrange.p30,
  p40:  primitive.darkOrange.p40,
  p50:  primitive.darkOrange.p50,
  p60:  primitive.darkOrange.p60,
  p70:  primitive.darkOrange.p70,
  p80:  primitive.darkOrange.p80,
  p90:  primitive.darkOrange.p90,
} as const;

// Lavender (lp) — soft purple accent
export const utilityLavender = {
  '90': primitive.lavender['90'],
  '80': primitive.lavender['80'],
  '70': primitive.lavender['70'],
  '60': primitive.lavender['60'],
  '50': primitive.lavender['50'],
  '40': primitive.lavender['40'],
  '30': primitive.lavender['30'],
  '20': primitive.lavender['20'],
  '10': primitive.lavender['10'],
  '00': primitive.lavender['00'],   // #A3A2DD DEFAULT
  p10:  primitive.lavender.p10,
  p20:  primitive.lavender.p20,
  p30:  primitive.lavender.p30,
  p40:  primitive.lavender.p40,
  p50:  primitive.lavender.p50,
  p60:  primitive.lavender.p60,
  p70:  primitive.lavender.p70,
  p80:  primitive.lavender.p80,
  p90:  primitive.lavender.p90,
} as const;

// Pink (pk)
export const utilityPink = {
  '90': primitive.pink['90'],
  '80': primitive.pink['80'],
  '70': primitive.pink['70'],
  '60': primitive.pink['60'],
  '50': primitive.pink['50'],
  '40': primitive.pink['40'],
  '30': primitive.pink['30'],
  '20': primitive.pink['20'],
  '10': primitive.pink['10'],
  '00': primitive.pink['00'],   // #E57C87 DEFAULT
  p10:  primitive.pink.p10,
  p20:  primitive.pink.p20,
  p30:  primitive.pink.p30,
  p40:  primitive.pink.p40,
  p50:  primitive.pink.p50,
  p60:  primitive.pink.p60,
  p70:  primitive.pink.p70,
  p80:  primitive.pink.p80,
  p90:  primitive.pink.p90,
} as const;

// Light Pink (lp-light)
export const utilityLightPink = {
  '90': primitive.lightPink['90'],
  '80': primitive.lightPink['80'],
  '70': primitive.lightPink['70'],
  '60': primitive.lightPink['60'],
  '50': primitive.lightPink['50'],
  '40': primitive.lightPink['40'],
  '30': primitive.lightPink['30'],
  '20': primitive.lightPink['20'],
  '10': primitive.lightPink['10'],
  '00': primitive.lightPink['00'],  // #F8B8B6 DEFAULT
  p10:  primitive.lightPink.p10,
  p20:  primitive.lightPink.p20,
  p30:  primitive.lightPink.p30,
  p40:  primitive.lightPink.p40,
  p50:  primitive.lightPink.p50,
  p60:  primitive.lightPink.p60,
  p70:  primitive.lightPink.p70,
  p80:  primitive.lightPink.p80,
  p90:  primitive.lightPink.p90,
} as const;

// Royal Blue (rb)
export const utilityRoyalBlue = {
  '90': primitive.royalBlue['90'],
  '80': primitive.royalBlue['80'],
  '70': primitive.royalBlue['70'],
  '60': primitive.royalBlue['60'],
  '50': primitive.royalBlue['50'],
  '40': primitive.royalBlue['40'],
  '30': primitive.royalBlue['30'],
  '20': primitive.royalBlue['20'],
  '10': primitive.royalBlue['10'],
  '00': primitive.royalBlue['00'],  // #DAEEFF DEFAULT
  p10:  primitive.royalBlue.p10,
  p20:  primitive.royalBlue.p20,
  p30:  primitive.royalBlue.p30,
  p40:  primitive.royalBlue.p40,
  p50:  primitive.royalBlue.p50,
  p60:  primitive.royalBlue.p60,
  p70:  primitive.royalBlue.p70,
  p80:  primitive.royalBlue.p80,
  p90:  primitive.royalBlue.p90,
} as const;

// Trusted Navy (tn)
export const utilityTrustedNavy = {
  '90': primitive.trustedNavy['90'],
  '80': primitive.trustedNavy['80'],
  '70': primitive.trustedNavy['70'],
  '60': primitive.trustedNavy['60'],
  '50': primitive.trustedNavy['50'],
  '40': primitive.trustedNavy['40'],
  '30': primitive.trustedNavy['30'],
  '20': primitive.trustedNavy['20'],
  '10': primitive.trustedNavy['10'],
  '00': primitive.trustedNavy['00'],  // #25287A DEFAULT
  p10:  primitive.trustedNavy.p10,
  p20:  primitive.trustedNavy.p20,
  p30:  primitive.trustedNavy.p30,
  p40:  primitive.trustedNavy.p40,
  p50:  primitive.trustedNavy.p50,
  p60:  primitive.trustedNavy.p60,
  p70:  primitive.trustedNavy.p70,
  p80:  primitive.trustedNavy.p80,
  p90:  primitive.trustedNavy.p90,
} as const;

// Confident Blue (cb)
export const utilityConfidentBlue = {
  '90': primitive.confidentBlue['90'],
  '80': primitive.confidentBlue['80'],
  '70': primitive.confidentBlue['70'],
  '60': primitive.confidentBlue['60'],
  '50': primitive.confidentBlue['50'],
  '40': primitive.confidentBlue['40'],
  '30': primitive.confidentBlue['30'],
  '20': primitive.confidentBlue['20'],
  '10': primitive.confidentBlue['10'],
  '00': primitive.confidentBlue['00'],  // #0077C0 DEFAULT
  p10:  primitive.confidentBlue.p10,
  p20:  primitive.confidentBlue.p20,
  p30:  primitive.confidentBlue.p30,
  p40:  primitive.confidentBlue.p40,
  p50:  primitive.confidentBlue.p50,
  p60:  primitive.confidentBlue.p60,
  p70:  primitive.confidentBlue.p70,
  p80:  primitive.confidentBlue.p80,
  p90:  primitive.confidentBlue.p90,
} as const;

// Refreshing Green (rg) — yellow-green accent
export const utilityRefreshingGreen = {
  '90': primitive.refreshingGreen['90'],
  '80': primitive.refreshingGreen['80'],
  '70': primitive.refreshingGreen['70'],
  '60': primitive.refreshingGreen['60'],
  '50': primitive.refreshingGreen['50'],
  '40': primitive.refreshingGreen['40'],
  '30': primitive.refreshingGreen['30'],
  '20': primitive.refreshingGreen['20'],
  '10': primitive.refreshingGreen['10'],
  '00': primitive.refreshingGreen['00'],  // #ACC022 DEFAULT
  p10:  primitive.refreshingGreen.p10,
  p20:  primitive.refreshingGreen.p20,
  p30:  primitive.refreshingGreen.p30,
  p40:  primitive.refreshingGreen.p40,
  p50:  primitive.refreshingGreen.p50,
  p60:  primitive.refreshingGreen.p60,
  p70:  primitive.refreshingGreen.p70,
  p80:  primitive.refreshingGreen.p80,
  p90:  primitive.refreshingGreen.p90,
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
// Full step scales — Ocean Blue (ob), Deep Blue (db), Sky Mist (sm),
// Dusky Sky (ds), Soft Purple (sp), Orchid Purple (op)
// ═══════════════════════════════════════════════════════════════════════════

// CM Primary — Ocean Blue (ob) full scale + Deep Blue (db) accents
export const cmPrimary = {
  // Ocean Blue full scale
  '90': primitive.oceanBlue['90'],
  '80': primitive.oceanBlue['80'],
  '70': primitive.oceanBlue['70'],
  '60': primitive.oceanBlue['60'],
  '50': primitive.oceanBlue['50'],
  '40': primitive.oceanBlue['40'],
  '30': primitive.oceanBlue['30'],
  '20': primitive.oceanBlue['20'],
  '10': primitive.oceanBlue['10'],
  '00': primitive.oceanBlue['00'],  // #477AB3 DEFAULT (ob-00)
  p10:  primitive.oceanBlue.p10,
  p20:  primitive.oceanBlue.p20,
  p30:  primitive.oceanBlue.p30,
  p40:  primitive.oceanBlue.p40,
  p50:  primitive.oceanBlue.p50,
  p60:  primitive.oceanBlue.p60,
  p70:  primitive.oceanBlue.p70,
  p80:  primitive.oceanBlue.p80,
  p90:  primitive.oceanBlue.p90,
  // Deep Blue accents (db)
  deep:    primitive.deepBlue['00'],  // #225889
  deeper:  primitive.deepBlue['30'],  // #183E60
} as const;

// CM Secondary — Sky Mist (sm) full scale + Dusky Sky (ds) accent
export const cmSecondary = {
  // Sky Mist full scale
  '90': primitive.skyMist['90'],
  '80': primitive.skyMist['80'],
  '70': primitive.skyMist['70'],
  '60': primitive.skyMist['60'],
  '50': primitive.skyMist['50'],
  '40': primitive.skyMist['40'],
  '30': primitive.skyMist['30'],
  '20': primitive.skyMist['20'],
  '10': primitive.skyMist['10'],
  '00': primitive.skyMist['00'],  // #A1C7E8 DEFAULT (sm-00)
  p10:  primitive.skyMist.p10,
  p20:  primitive.skyMist.p20,
  p30:  primitive.skyMist.p30,
  p40:  primitive.skyMist.p40,
  p50:  primitive.skyMist.p50,
  p60:  primitive.skyMist.p60,
  p70:  primitive.skyMist.p70,
  p80:  primitive.skyMist.p80,
  p90:  primitive.skyMist.p90,   // #F3F8FD subtle bg
  // Dusky Sky accent (ds)
  deep: primitive.duskySky['00'], // #6A8DCF
} as const;

// CM Tertiary — Soft Purple (sp) full scale + Orchid Purple (op) accents
export const cmTertiary = {
  // Soft Purple full scale
  '90': primitive.softPurple['90'],
  '80': primitive.softPurple['80'],
  '70': primitive.softPurple['70'],
  '60': primitive.softPurple['60'],
  '50': primitive.softPurple['50'],
  '40': primitive.softPurple['40'],
  '30': primitive.softPurple['30'],
  '20': primitive.softPurple['20'],
  '10': primitive.softPurple['10'],
  '00': primitive.softPurple['00'],  // #D7DBFF DEFAULT (sp-00)
  p10:  primitive.softPurple.p10,
  p20:  primitive.softPurple.p20,
  p30:  primitive.softPurple.p30,
  p40:  primitive.softPurple.p40,
  p50:  primitive.softPurple.p50,
  p60:  primitive.softPurple.p60,
  p70:  primitive.softPurple.p70,
  p80:  primitive.softPurple.p80,
  p90:  primitive.softPurple.p90,
  // Orchid Purple / Lavender accents (op / lp)
  mid:    primitive.lavender['00'],      // #A3A2DD (lp-00)
  deep:   primitive.orchidPurple['00'],  // #7B7AB9 (op-00)
  deeper: primitive.orchidPurple['30'],  // #565581 (op-30)
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM — Status colors
// ═══════════════════════════════════════════════════════════════════════════

// Success (Figma "Green" / gn) — full scale
// Source: Alias.json > System.Success
export const success = {
  '90':   primitive.green['90'],
  '80':   primitive.green['80'],
  '70':   primitive.green['70'],
  '60':   primitive.green['60'],
  '50':   primitive.green['50'],
  '40':   primitive.green['40'],   // #11662C — darker
  '30':   primitive.green['30'],
  '20':   primitive.green['20'],   // #16873A — hover
  '10':   primitive.green['10'],
  '00':   primitive.green['00'],   // #1EB950 — DEFAULT
  p10:    primitive.green.p10,
  p20:    primitive.green.p20,
  p30:    primitive.green.p30,
  p40:    primitive.green.p40,
  p50:    primitive.green.p50,     // #97DFAE
  p60:    primitive.green.p60,     // #ACE5BE
  p70:    primitive.green.p70,
  p80:    primitive.green.p80,     // #D4F2DE
  p90:    primitive.green.p90,     // #E8F8ED — subtle bg
  subtle: primitive.green.p90,
} as const;

// Warning (Figma "Refreshing Orange" / ro) — full scale
// Source: Alias.json > System.Warning
export const warning = {
  '90':   primitive.orange['90'],
  '80':   primitive.orange['80'],
  '70':   primitive.orange['70'],
  '60':   primitive.orange['60'],
  '50':   primitive.orange['50'],
  '40':   primitive.orange['40'],  // #996705 — darker
  '30':   primitive.orange['30'],
  '20':   primitive.orange['20'],  // #CC8906 — hover
  '10':   primitive.orange['10'],
  '00':   primitive.orange['00'],  // #FFAB08 — DEFAULT
  p10:    primitive.orange.p10,
  p20:    primitive.orange.p20,
  p30:    primitive.orange.p30,
  p40:    primitive.orange.p40,
  p50:    primitive.orange.p50,
  p60:    primitive.orange.p60,    // #FFDD9C
  p70:    primitive.orange.p70,
  p80:    primitive.orange.p80,    // #FFEECE
  p90:    primitive.orange.p90,    // #FFF7E6 — subtle bg
  subtle: primitive.orange.p90,
} as const;

// Error (Figma "Red" / rd) — full scale
// Source: Alias.json > System.Error
export const error = {
  '90':   primitive.red['90'],
  '80':   primitive.red['80'],
  '70':   primitive.red['70'],
  '60':   primitive.red['60'],
  '50':   primitive.red['50'],
  '40':   primitive.red['40'],
  '30':   primitive.red['30'],
  '20':   primitive.red['20'],   // #AE1A0C — hover
  '10':   primitive.red['10'],
  '00':   primitive.red['00'],   // #DA2110 — DEFAULT
  p10:    primitive.red.p10,
  p20:    primitive.red.p20,
  p30:    primitive.red.p30,
  p40:    primitive.red.p40,
  p50:    primitive.red.p50,
  p60:    primitive.red.p60,     // #F0A69F
  p70:    primitive.red.p70,
  p80:    primitive.red.p80,     // #F7D2CF
  p90:    primitive.red.p90,     // #FBE8E7 — subtle bg
  subtle: primitive.red.p90,
} as const;

// Info (Figma "Blue" / be) — full scale
// Source: Alias.json > System.Info
export const info = {
  '90':   primitive.blue['90'],
  '80':   primitive.blue['80'],
  '70':   primitive.blue['70'],
  '60':   primitive.blue['60'],
  '50':   primitive.blue['50'],
  '40':   primitive.blue['40'],   // #3C6A8B — darker
  '30':   primitive.blue['30'],
  '20':   primitive.blue['20'],
  '10':   primitive.blue['10'],
  '00':   primitive.blue['00'],   // #65B2E8 — DEFAULT
  p10:    primitive.blue.p10,
  p20:    primitive.blue.p20,
  p30:    primitive.blue.p30,
  p40:    primitive.blue.p40,
  p50:    primitive.blue.p50,
  p60:    primitive.blue.p60,     // #C1E0F5
  p70:    primitive.blue.p70,
  p80:    primitive.blue.p80,     // #E0EFFA
  p90:    primitive.blue.p90,     // #EFF7FC — subtle bg
  subtle: primitive.blue.p90,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SEMANTIC COMPONENT ROLES
// Source: Figma "AKDS-M-Light" — Mapped.json
// Built from alias scales above — used by Tailwind, Ant Design theme & components
// ═══════════════════════════════════════════════════════════════════════════

// ─── Text color roles ─────────────────────────────────────────────────────
// Figma: Global/Text.* tokens (TEXT_FILL scope)
export const textColor = {
  // ── Base hierarchy ──
  primary:          primitive.gray['80'],           // #12151A — main body text
  primaryHover:     primitive.gray['95'],           // #050507 — Text.Primary_hover
  secondary:        primitive.gray['40'],           // #37404F
  secondaryHover:   primitive.gray['60'],           // #242A34 — Text.Secondary_hover
  tertiary:         primitive.gray['20'],           // #495569
  tertiaryHover:    primitive.gray['40'],           // #37404F
  quaternary:       primitive.gray['00'],           // #5B6A83
  quaternaryHover:  primitive.gray['20'],           // #495569
  quinary:          primitive.gray.p20,             // #7C889C
  quinaryHover:     primitive.gray['00'],           // #5B6A83
  // ── Special ──
  white:            primitive.white,                // #FFFFFF — Text.White
  placeholder:      primitive.gray.p40,            // #9DA6B5
  placeholderHover: primitive.gray.p20,            // #7C889C
  disabled:         primitive.gray.p60,            // #BDC3CD
  disabledSubtle:   primitive.gray.p80,            // #DEE1E6
  // ── Brand ──
  brand: {
    default:  primitive.specialGreen['00'],  // #00AF43 — Text.Brand.Default
    dark:     primitive.specialGreen['20'],  // #008C36 — Text.Brand.Dark
    darker:   primitive.specialGreen['30'],  // #006928 — Text.Brand.Darker
    light:    primitive.specialGreen.p20,   // #33BF69 — Text.Brand.Light
    lighter:  primitive.specialGreen.p60,   // #99DFB4 — Text.Brand.Lighter
    subtle:   primitive.specialGreen.p90,   // #E5F7EC — Text.Brand.Subtle
  },
  // ── Status ──
  success: {
    default:  success['00'],   // #1EB950
    dark:     success['20'],   // #16873A
    subtle:   success.p90,    // #E8F8ED
  },
  warning: {
    default:  warning['00'],  // #FFAB08
    dark:     warning['20'],  // #CC8906
    subtle:   warning.p90,   // #FFF7E6
  },
  error: {
    default:  error['00'],   // #DA2110
    dark:     error['20'],   // #AE1A0C
    subtle:   error.p90,    // #FBE8E7
  },
  info: {
    default:  info['00'],   // #65B2E8
    dark:     info['40'],   // #3C6A8B
    subtle:   info.p90,    // #EFF7FC
  },
} as const;

// ─── Background color roles ───────────────────────────────────────────────
// Figma: Global/Background.* tokens (FRAME_FILL scope)
export const backgroundColor = {
  // ── Base hierarchy ──
  primary:          primitive.white,        // #FFFFFF — Background.Primary
  primaryHover:     primitive.gray.p95,     // #F7F8F9 — Background.Primary_hover
  secondary:        primitive.gray.p95,     // #F7F8F9 — Background.Secondary
  secondaryHover:   primitive.gray.p90,     // #EFF0F3 — Background.Secondary_hover
  tertiary:         primitive.gray.p80,     // #DEE1E6 — Background.Tertiary
  tertiaryHover:    primitive.gray.p70,     // #CED2DA — Background.Tertiary_hover
  quaternary:       primitive.gray.p70,     // #CED2DA — Background.Quaternary
  quaternaryHover:  primitive.gray.p60,     // #BDC3CD — Background.Quaternary_hover
  // ── Special ──
  solid:            primitive.gray['60'],   // #242A34 — Background.Solid (dark)
  transparent:      'transparent',          // Background.Transparent
  transparent10:    primitive.alpha.white[10], // rgba(255,255,255,0.1) — 10% overlay
  transparent80:    primitive.alpha.white[80], // rgba(255,255,255,0.8) — frosted
  // ── Disabled ──
  disabled:         primitive.gray.p90,     // #EFF0F3 — Background.Disabled
  disabledDarker:   primitive.gray.p80,     // #DEE1E6 — Background.Disabled_darker
  disabledSubtle:   primitive.gray.p95,     // #F7F8F9 — Background.Disabled_subtle
  // ── Brand ──
  brand: {
    subtle:   primitive.specialGreen.p90,   // #E5F7EC — Background.Brand.Subtle
    light:    primitive.specialGreen.p80,   // #CCEFD9 — Background.Brand.Light
    default:  primitive.specialGreen['00'], // #00AF43 — Background.Brand.Default
    dark:     primitive.specialGreen['20'], // #008C36 — Background.Brand.Dark
  },
  // ── Status ──
  success: {
    subtle:  success.p90,    // #E8F8ED
    light:   success.p80,    // #D4F2DE
    default: success['00'],  // #1EB950
  },
  warning: {
    subtle:  warning.p90,   // #FFF7E6
    light:   warning.p80,   // #FFEECE
    default: warning['00'], // #FFAB08
  },
  error: {
    subtle:  error.p90,    // #FBE8E7
    light:   error.p80,    // #F7D2CF
    default: error['00'],  // #DA2110
  },
  info: {
    subtle:  info.p90,    // #EFF7FC
    light:   info.p80,    // #E0EFFA
    default: info['00'],  // #65B2E8
  },
} as const;

// ─── Border color roles ───────────────────────────────────────────────────
// Figma: Global/Border.* tokens (STROKE scope)
export const borderColor = {
  // ── Base hierarchy ──
  primary:         primitive.gray.p80,             // #DEE1E6 — Border.Primary
  secondary:       primitive.gray.p60,             // #BDC3CD — Border.Secondary
  tertiary:        primitive.gray.p70,             // #CED2DA — Border.Tertiary
  // ── Special ──
  white:           primitive.white,                // #FFFFFF — Border.White
  disabled:        primitive.gray.p95,             // #F7F8F9 — Border.Disabled
  disabledDarker:  primitive.gray.p80,             // #DEE1E6 — Border.Disabled_darker
  disabledSubtle:  primitive.gray.p90,             // #EFF0F3 — Border.Disabled_subtle
  // ── Brand ──
  brand: {
    default:  primitive.specialGreen['00'],  // #00AF43 — Border.Brand.Default
    dark:     primitive.specialGreen['20'],  // #008C36 — Border.Brand.Dark
    light:    primitive.specialGreen.p20,   // #33BF69 — Border.Brand.Light
    lighter:  primitive.specialGreen.p60,   // #99DFB4 — Border.Brand.Lighter (focus ring)
    subtle:   primitive.specialGreen.p80,   // #CCEFD9 — Border.Brand.Subtle
  },
  // ── Status ──
  success: {
    default:  success['00'],  // #1EB950
    dark:     success['20'],  // #16873A
    light:    success.p60,   // focus ring
    subtle:   success.p80,   // #D4F2DE
  },
  warning: {
    default:  warning['00'],  // #FFAB08
    dark:     warning['20'],  // #CC8906
    light:    warning.p60,
    subtle:   warning.p80,
  },
  error: {
    default:  error['00'],  // #DA2110
    dark:     error['20'],  // #AE1A0C
    light:    error.p60,   // #F0A69F — focus ring
    subtle:   error.p80,   // #F7D2CF
  },
  info: {
    default:  info['00'],  // #65B2E8
    dark:     info['40'],  // #3C6A8B
    light:    info.p60,   // focus ring
    subtle:   info.p80,   // #E0EFFA
  },
} as const;

// ─── Icon color roles ─────────────────────────────────────────────────────
// Figma: Global/Icon.* tokens (ALL_FILLS scope)
// Mirrors textColor — icons follow the same hierarchy as text
export const iconColor = {
  primary:         primitive.gray['80'],           // #12151A
  primaryHover:    primitive.gray['95'],           // #050507
  secondary:       primitive.gray['40'],           // #37404F
  secondaryHover:  primitive.gray['60'],           // #242A34
  tertiary:        primitive.gray['20'],           // #495569
  quaternary:      primitive.gray['00'],           // #5B6A83
  quinary:         primitive.gray.p20,             // #7C889C
  white:           primitive.white,                // #FFFFFF
  disabled:        primitive.gray.p60,            // #BDC3CD
  brand: {
    default:  primitive.specialGreen['00'],  // #00AF43
    dark:     primitive.specialGreen['20'],  // #008C36
    darker:   primitive.specialGreen['30'],  // #006928
    light:    primitive.specialGreen.p20,   // #33BF69
    subtle:   primitive.specialGreen.p90,   // #E5F7EC
  },
  success: { default: success['00'], dark: success['20'] },
  warning: { default: warning['00'], dark: warning['20'] },
  error:   { default: error['00'],   dark: error['20']   },
  info:    { default: info['00'],    dark: info['40']    },
} as const;

// ─── Foreground color roles ───────────────────────────────────────────────
// Figma: Global/Foreground.* tokens (ALL_SCOPES)
// Used for high-contrast overlays, inverted surfaces
export const foregroundColor = {
  primary:    primitive.gray['80'],   // #12151A — on-light surface
  secondary:  primitive.gray['40'],   // #37404F
  tertiary:   primitive.gray['20'],   // #495569
  white:      primitive.white,        // #FFFFFF — on-dark surface
  brand:      primitive.specialGreen['00'],  // #00AF43
  brandDark:  primitive.specialGreen['20'],  // #008C36
  disabled:   primitive.gray.p60,    // #BDC3CD
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TAILWIND / COMPONENT SEMANTIC TOKENS
// Short-name exports consumed by tailwind.config.ts and component variants
// ═══════════════════════════════════════════════════════════════════════════

// ─── Brand scale (Tailwind + Ant Design theme) ────────────────────────────
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

// ─── Error scale (Tailwind + Ant Design theme) ────────────────────────────
export const errorColor = {
  default:     error['00'],   // #DA2110
  hover:       error['20'],   // #AE1A0C — darker ✓ (not the subtle)
  active:      error['30'],   // #98170B
  subtle:      error.p90,    // #FBE8E7 — outline/ghost hover bg
  text:        error['00'],  // #DA2110
  textHover:   error['20'],  // #AE1A0C
  border:      error['00'],  // #DA2110
  borderHover: error['20'],  // #AE1A0C
  focusRing:   error.p60,   // #F0A69F
  bgDisabled:  neutral.p90, // #EFF0F3
} as const;

// ─── Neutral scale (Tailwind + Ant Design theme) ──────────────────────────
export const neutralColor = {
  text:        primitive.gray['40'],   // #37404F
  textHover:   primitive.gray['60'],   // #242A34
  textStrong:  primitive.gray['80'],   // #12151A
  border:      primitive.gray.p80,     // #DEE1E6
  borderHover: primitive.gray.p60,     // #BDC3CD
  bg:          primitive.gray.p95,     // #F7F8F9
  bgHover:     primitive.gray.p95,     // #F7F8F9
  bgDisabled:  neutral.p90,           // #EFF0F3
  focusRing:   neutral.p80,           // #DEE1E6
} as const;

// ─── Status scale (Tailwind) ──────────────────────────────────────────────
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
  error: {
    default:   error['00'],   // #DA2110
    hover:     error['20'],   // #AE1A0C
    subtle:    error.p90,    // #FBE8E7
    focusRing: error.p60,    // #F0A69F
  },
  info: {
    default:   info['00'],    // #65B2E8
    hover:     info['40'],    // #3C6A8B
    subtle:    info.p90,     // #EFF7FC
    focusRing: info.p80,     // #E0EFFA
  },
} as const;

// Short-name re-exports (for tailwind.config.ts)
export const text       = textColor;
export const background = backgroundColor;
export const border     = borderColor;
export const icon       = iconColor;
export const foreground = foregroundColor;

// ─── Input component tokens ───────────────────────────────────────────────
// Source: Figma "Component/Input.*" — Component.Input.*
export const inputColor = {
  brand: {
    background:      primitive.white,               // #FFFFFF — default bg
    border:          primitive.gray.p80,            // #DEE1E6 — default border
    borderHover:     primitive.gray.p60,            // #BDC3CD — hover border
    borderActive:    primitive.specialGreen['00'],  // #00AF43 — focused border
    borderDisabled:  primitive.gray.p90,            // #EFF0F3 — disabled border
    text:            primitive.gray['80'],          // #12151A — input text
    placeholder:     primitive.gray.p40,           // #9DA6B5 — placeholder
    disabled:        primitive.gray.p40,           // #9DA6B5 — disabled text
    bgDisabled:      primitive.gray.p95,           // #F7F8F9 — disabled bg
  },
  error: {
    background:      primitive.white,               // #FFFFFF
    border:          primitive.red['00'],           // #DA2110 — error border
    borderHover:     primitive.red['20'],           // #AE1A0C — hover error border
    borderActive:    primitive.red['20'],           // #AE1A0C — focused error border
    borderDisabled:  primitive.gray.p90,            // #EFF0F3
    text:            primitive.gray['80'],          // #12151A
    placeholder:     primitive.gray.p40,           // #9DA6B5
    disabled:        primitive.gray.p40,           // #9DA6B5
    bgDisabled:      primitive.gray.p95,           // #F7F8F9
  },
} as const;

// ─── Breadcrumb component tokens ──────────────────────────────────────────
// Source: Figma "Component/Breadcrumb.*" — Component.Breadcrumb.*
export const breadcrumbColor = {
  brand: {
    text:           primitive.specialGreen['20'],  // #008C36 — active crumb
    textHover:      primitive.specialGreen['30'],  // #006928
    textInactive:   primitive.gray['40'],          // #37404F — inactive crumbs
    textDisabled:   primitive.gray.p60,           // #BDC3CD
    separator:      primitive.gray.p60,           // #BDC3CD — divider icon
  },
  neutral: {
    text:           primitive.gray['20'],          // #495569 — active crumb
    textHover:      primitive.gray['40'],          // #37404F
    textInactive:   primitive.gray.p20,           // #7C889C — inactive crumbs
    textDisabled:   primitive.gray.p60,           // #BDC3CD
    separator:      primitive.gray.p60,           // #BDC3CD
  },
} as const;

// ─── Button component tokens ──────────────────────────────────────────────
// Source: Figma "Component/Button.*" — Component.Button.*
export const buttonColor = {
  // ── Primary (filled) ─────────────────────────────────────────────────
  primary: {
    brand: {
      // bg=#00AF43 → hover #008C36, text=white → hover #E5F7EC
      default:  { bg: primitive.specialGreen['00'],  text: primitive.white,            border: primitive.specialGreen['00'],  icon: primitive.white },
      hover:    { bg: primitive.specialGreen['20'],  text: primitive.specialGreen.p90, border: primitive.specialGreen['20'],  icon: primitive.specialGreen.p90 },
      active:   { bg: primitive.specialGreen['30'],  text: primitive.specialGreen.p90, border: primitive.specialGreen['30'],  icon: primitive.specialGreen.p90 },
      disabled: { bg: primitive.gray.p90,            text: primitive.gray.p40,         border: primitive.gray.p95,            icon: primitive.gray.p40 },
    },
    neutral: {
      // bg=#37404F → hover #242A34, text=white
      default:  { bg: primitive.gray['40'],  text: primitive.white,       border: primitive.gray['40'],  icon: primitive.white },
      hover:    { bg: primitive.gray['60'],  text: primitive.white,       border: primitive.gray['60'],  icon: primitive.white },
      active:   { bg: primitive.gray['80'],  text: primitive.white,       border: primitive.gray['80'],  icon: primitive.white },
      disabled: { bg: primitive.gray.p90,   text: primitive.gray.p40,    border: primitive.gray.p95,   icon: primitive.gray.p40 },
    },
    error: {
      // bg=#DA2110 → hover #AE1A0C, text=white → hover #FBE8E7
      default:  { bg: primitive.red['00'],  text: primitive.white,    border: primitive.red['00'],  icon: primitive.white },
      hover:    { bg: primitive.red['20'],  text: primitive.red.p90,  border: primitive.red['20'],  icon: primitive.red.p90 },
      active:   { bg: primitive.red['30'],  text: primitive.red.p90,  border: primitive.red['30'],  icon: primitive.red.p90 },
      disabled: { bg: primitive.gray.p90,  text: primitive.gray.p40, border: primitive.gray.p95,  icon: primitive.gray.p40 },
    },
  },

  // ── Secondary (outline) ───────────────────────────────────────────────
  secondary: {
    brand: {
      // border=#00AF43, text=#008C36 → hover bg=#E5F7EC, border=#008C36, text=#006928
      default:  { bg: 'transparent',               text: primitive.specialGreen['20'], border: primitive.specialGreen['00'], icon: primitive.specialGreen['20'] },
      hover:    { bg: primitive.specialGreen.p90,  text: primitive.specialGreen['30'], border: primitive.specialGreen['20'], icon: primitive.specialGreen['30'] },
      active:   { bg: primitive.specialGreen.p90,  text: primitive.specialGreen['30'], border: primitive.specialGreen['20'], icon: primitive.specialGreen['30'] },
      disabled: { bg: primitive.gray.p90,          text: primitive.gray.p40,           border: primitive.gray.p95,          icon: primitive.gray.p40 },
    },
    neutral: {
      // border=#DEE1E6, text=#37404F → hover bg=#F7F8F9, border=#BDC3CD, text=#242A34
      default:  { bg: 'transparent',      text: primitive.gray['40'],  border: primitive.gray.p80,  icon: primitive.gray['40'] },
      hover:    { bg: primitive.gray.p95, text: primitive.gray['60'],  border: primitive.gray.p60,  icon: primitive.gray['60'] },
      active:   { bg: primitive.gray.p95, text: primitive.gray['60'],  border: primitive.gray.p60,  icon: primitive.gray['60'] },
      disabled: { bg: primitive.gray.p90, text: primitive.gray.p40,   border: primitive.gray.p95,  icon: primitive.gray.p40 },
    },
    error: {
      // border=#DA2110, text=#DA2110 → hover bg=#FBE8E7, border=#AE1A0C, text=#AE1A0C
      default:  { bg: 'transparent',     text: primitive.red['00'],  border: primitive.red['00'],  icon: primitive.red['00'] },
      hover:    { bg: primitive.red.p90, text: primitive.red['20'],  border: primitive.red['20'],  icon: primitive.red['20'] },
      active:   { bg: primitive.red.p90, text: primitive.red['20'],  border: primitive.red['20'],  icon: primitive.red['20'] },
      disabled: { bg: primitive.gray.p90, text: primitive.gray.p40, border: primitive.gray.p95,   icon: primitive.gray.p40 },
    },
  },

  // ── Ghost / Tertiary ──────────────────────────────────────────────────
  ghost: {
    brand: {
      // text=#008C36 → hover bg=#E5F7EC, text=#006928
      default:  { bg: 'transparent',              text: primitive.specialGreen['20'], border: 'transparent', icon: primitive.specialGreen['20'] },
      hover:    { bg: primitive.specialGreen.p90, text: primitive.specialGreen['30'], border: 'transparent', icon: primitive.specialGreen['30'] },
      active:   { bg: primitive.specialGreen.p90, text: primitive.specialGreen['30'], border: 'transparent', icon: primitive.specialGreen['30'] },
      disabled: { bg: primitive.gray.p90,         text: primitive.gray.p40,          border: 'transparent', icon: primitive.gray.p40 },
    },
    neutral: {
      // text=#242A34 → hover bg=#F7F8F9, text=#12151A
      default:  { bg: 'transparent',      text: primitive.gray['60'],  border: 'transparent', icon: primitive.gray['60'] },
      hover:    { bg: primitive.gray.p95, text: primitive.gray['80'],  border: 'transparent', icon: primitive.gray['80'] },
      active:   { bg: primitive.gray.p95, text: primitive.gray['80'],  border: 'transparent', icon: primitive.gray['80'] },
      disabled: { bg: primitive.gray.p90, text: primitive.gray.p40,   border: 'transparent', icon: primitive.gray.p40 },
    },
    error: {
      // text=#DA2110 → hover bg=#FBE8E7, text=#AE1A0C
      default:  { bg: 'transparent',     text: primitive.red['00'],  border: 'transparent', icon: primitive.red['00'] },
      hover:    { bg: primitive.red.p90, text: primitive.red['20'],  border: 'transparent', icon: primitive.red['20'] },
      active:   { bg: primitive.red.p90, text: primitive.red['20'],  border: 'transparent', icon: primitive.red['20'] },
      disabled: { bg: primitive.gray.p90, text: primitive.gray.p40, border: 'transparent', icon: primitive.gray.p40 },
    },
  },

  // ── Link ─────────────────────────────────────────────────────────────
  link: {
    brand: {
      text:         primitive.specialGreen['20'],  // #008C36
      textHover:    primitive.specialGreen['30'],  // #006928
      textDisabled: primitive.gray.p60,           // #BDC3CD
      icon:         primitive.specialGreen['20'],  // #008C36
      iconHover:    primitive.specialGreen['30'],  // #006928
      iconDisabled: primitive.gray.p60,           // #BDC3CD
    },
    neutral: {
      text:         primitive.gray['60'],   // #242A34
      textHover:    primitive.gray['80'],   // #12151A
      textDisabled: primitive.gray.p60,   // #BDC3CD
      icon:         primitive.gray['60'],   // #242A34
      iconHover:    primitive.gray['80'],   // #12151A
      iconDisabled: primitive.gray.p60,   // #BDC3CD
    },
    error: {
      text:         primitive.red['00'],   // #DA2110
      textHover:    primitive.red['20'],   // #AE1A0C
      textDisabled: primitive.gray.p60,  // #BDC3CD
      icon:         primitive.red['00'],   // #DA2110
      iconHover:    primitive.red['20'],   // #AE1A0C
      iconDisabled: primitive.gray.p60,  // #BDC3CD
    },
  },
} as const;
