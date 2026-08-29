import path from "node:path"
import { pathToFileURL } from "node:url"
import type {
  HelpGroup,
  HelpItem,
  HelpOptions,
  HelpThemeOptions,
  NormalizedHelpOptions,
  NormalizedTextStyle,
  NormalizedTextStyles,
  NormalizedThemeOptions,
  TextAlign,
  TextStyleOptions,
  TextTransform,
  ThemeMode,
} from "./types.js"

const COLOR_PATTERN = /^(?:#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i
const SIZE_PATTERN = /^\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw)$/i
const SPACING_PATTERN =
  /^(?:0|auto|-?\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|pt))(?:\s+(?:0|auto|-?\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|pt))){0,3}$/i
const SHADOW_PATTERN = /^(?:none|[\w\s#(),.%+-]+)$/i
const POSITION_PATTERN = /^[\w.%+-]+(?:\s+[\w.%+-]+){0,2}$/i
const TRANSFORM_VALUES: TextTransform[] = ["none", "uppercase", "lowercase", "capitalize"]
const ALIGN_VALUES: TextAlign[] = ["left", "center", "right", "justify", "inherit"]
const STYLE_KEYS = ["menu", "title", "group", "item", "desc", "footer"] as const
const STYLE_FAMILY_NAMES: Record<(typeof STYLE_KEYS)[number], string> = {
  menu: "HelpMenuFont",
  title: "HelpTitleFont",
  group: "HelpGroupFont",
  item: "HelpItemFont",
  desc: "HelpDescFont",
  footer: "HelpFooterFont",
}

export const DEFAULT_THEME: Required<HelpThemeOptions> = {
  bgImage: "",
  font: "",
  menu: "",
  mode: "auto",
  bgColor: "#edf2f7",
  panelBorder: "rgba(255, 255, 255, 0.72)",
  accent: "#3b82f6",
  muted: "#64748b",
  color: "#000000",
  size: "16px",
  footer: "",
  shadow: "none",
  desc: "#64748b",
  panel: "rgba(255, 255, 255, 0.88)",
  blur: 3,
  panelShadow: "0 24px 56px -22px rgba(15, 23, 42, 0.18)",
  headBg: "rgba(59, 130, 246, 0.08)",
  groupLine: "rgba(59, 130, 246, 0.2)",
  row1: "rgba(15, 23, 42, 0.045)",
  row2: "rgba(15, 23, 42, 0.075)",
  itemBorder: "rgba(15, 23, 42, 0.06)",
  pagePad: "48px 40px",
  panelPad: "42px",
  panelRad: "28px",
  groupGap: "36px",
  itemGap: "12px",
  itemRad: "14px",
  itemPad: "14px 16px",
  headGap: "38px",
  headPad: "20px",
  headBorder: "6px",
  groupPad: "12px 16px",
  groupRad: "10px",
  groupHeadGap: "18px",
  nameGap: "12px",
  contentGap: "12px",
  lineWidth: "58px",
  markColor: "#3b82f6",
  markSize: "8px",
  ringColor: "rgba(59, 130, 246, 0.2)",
  ringSize: "4px",
  footGap: "24px",
  footPad: "10px",
  footBorder: "rgba(15, 23, 42, 0.06)",
  bgSize: "cover",
  bgPos: "center",
  styles: {
    menu: {
      font: "",
      color: "#3b82f6",
      size: "0.82em",
      align: "inherit",
      weight: 700,
      shadow: "none",
      lineHeight: "1.2",
      letterSpacing: "0.24em",
      opacity: 1,
      transform: "uppercase",
    },
    title: {
      font: "",
      color: "#000000",
      size: "2.7em",
      align: "left",
      weight: 800,
      shadow: "none",
      lineHeight: "1.15",
      letterSpacing: "0",
      opacity: 1,
      transform: "none",
    },
    group: {
      font: "",
      color: "#000000",
      size: "1.05em",
      align: "left",
      weight: 800,
      shadow: "none",
      lineHeight: "1.2",
      letterSpacing: "0",
      opacity: 1,
      transform: "none",
    },
    item: {
      font: "",
      color: "#000000",
      size: "1em",
      align: "left",
      weight: 700,
      shadow: "none",
      lineHeight: "1.2",
      letterSpacing: "0",
      opacity: 1,
      transform: "none",
    },
    desc: {
      font: "",
      color: "#64748b",
      size: "0.8em",
      align: "left",
      weight: 400,
      shadow: "none",
      lineHeight: "1.2",
      letterSpacing: "0",
      opacity: 1,
      transform: "none",
    },
    footer: {
      font: "",
      color: "#64748b",
      size: "0.82em",
      align: "center",
      weight: 400,
      shadow: "none",
      lineHeight: "1.2",
      letterSpacing: "0",
      opacity: 1,
      transform: "none",
    },
  },
}

const DARK_DEFAULTS = {
  pageBgColor: "#171a1b",
  panelBorderColor: "rgba(255, 255, 255, 0.14)",
  accentColor: "#8dd3c7",
  mutedColor: "#aeb8b7",
  fontColor: "#f4f7f5",
  descColor: "#d7dfdc",
  contBgColor: "rgba(31, 35, 36, 0.94)",
  panelShadow: "0 24px 56px -22px rgba(0, 0, 0, 0.35)",
  headerBgColor: "rgba(141, 211, 199, 0.12)",
  groupLineColor: "rgba(141, 211, 199, 0.28)",
  rowBgColor1: "rgba(255, 255, 255, 0.06)",
  rowBgColor2: "rgba(255, 255, 255, 0.1)",
  itemBorderColor: "rgba(255, 255, 255, 0.12)",
  markerColor: "#8dd3c7",
  markerRingColor: "rgba(141, 211, 199, 0.28)",
  footerBorderColor: "rgba(255, 255, 255, 0.12)",
}

function isObj(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function text(value: unknown, fallback = ""): string {
  return value === undefined || value === null ? fallback : String(value)
}

function str(value: unknown, fieldName: string): string {
  if (typeof value !== "string") throw new TypeError(`${fieldName} must be a string`)
  return value
}

function checkColor(value: string, fieldName: string): string {
  if (!COLOR_PATTERN.test(value)) throw new TypeError(`${fieldName} must be a valid CSS color`)
  return value
}

function normSize(value: unknown, fallback: string, fieldName: string): string {
  const normalized = typeof value === "number" ? `${value}px` : text(value, fallback).trim()
  if (!SIZE_PATTERN.test(normalized))
    throw new TypeError(`${fieldName} must be a CSS size such as 16px`)
  return normalized
}

function normSpace(value: unknown, fallback: string, fieldName: string): string {
  const normalized = typeof value === "number" ? `${value}px` : text(value, fallback).trim()
  if (!SPACING_PATTERN.test(normalized))
    throw new TypeError(`${fieldName} must be valid CSS spacing`)
  return normalized
}

function normShadow(value: unknown, fallback: string, fieldName: string): string {
  const normalized = text(value, fallback).trim()
  if (!SHADOW_PATTERN.test(normalized))
    throw new TypeError(`${fieldName} must be a valid CSS shadow`)
  return normalized
}

function normPos(value: unknown, fallback: string, fieldName: string): string {
  const normalized = text(value, fallback).trim()
  if (!POSITION_PATTERN.test(normalized))
    throw new TypeError(`${fieldName} must be valid CSS values`)
  return normalized
}

function getMode(value: unknown): ThemeMode {
  const requested = text(value, "auto").trim().toLowerCase()
  if (!["auto", "dark", "light"].includes(requested)) {
    throw new TypeError("theme.mode must be auto, dark, or light")
  }
  if (requested !== "auto") return requested as ThemeMode

  const hour = new Date().getHours()
  return hour >= 6 && hour <= 18 ? "light" : "dark"
}

function asset(value: string, baseDir: string): string {
  const asset = value.trim()
  if (!asset) return ""
  if (/^(?:https?:|data:|file:)/i.test(asset)) return asset
  return pathToFileURL(path.resolve(baseDir, asset)).href
}

function fontType(fontUrl: string): string {
  const resourcePath = fontUrl.split(/[?#]/, 1)[0] ?? fontUrl
  const extension = resourcePath.split(".").pop()?.toLowerCase()
  if (extension === "woff2") return "woff2"
  if (extension === "woff") return "woff"
  if (extension === "otf") return "opentype"
  return "truetype"
}

function normItem(item: unknown, groupIndex: number, itemIndex: number): HelpItem {
  if (!isObj(item)) {
    throw new TypeError(`list[${groupIndex}].list[${itemIndex}] must be an object`)
  }

  return {
    name: text(item.name),
    desc: text(item.desc),
  }
}

function normGroup(group: unknown, groupIndex: number): HelpGroup {
  if (!isObj(group)) throw new TypeError(`list[${groupIndex}] must be an object`)

  const items = group.list === undefined ? [] : group.list
  if (!Array.isArray(items)) throw new TypeError(`list[${groupIndex}].list must be an array`)

  return {
    name: text(group.name),
    desc: text(group.desc),
    list: items.map((item, itemIndex) => normItem(item, groupIndex, itemIndex)),
  }
}

function normWeight(value: unknown, fallback: string, fieldName: string): string {
  const normalized = text(value, fallback).trim().toLowerCase()
  if (!/^(?:normal|bold|bolder|lighter|[1-9]00)$/.test(normalized)) {
    throw new TypeError(`${fieldName} must be normal, bold, or a value from 100 to 900`)
  }
  return normalized
}

function normOpacity(value: unknown, fallback: number, fieldName: string): number {
  const opacity = value === undefined ? fallback : Number(value)
  if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
    throw new TypeError(`${fieldName} must be a number from 0 to 1`)
  }
  return opacity
}

function normAlign(value: unknown, fallback: TextAlign, fieldName: string): TextAlign {
  const normalized = text(value, fallback).trim().toLowerCase() as TextAlign
  if (!ALIGN_VALUES.includes(normalized))
    throw new TypeError(`${fieldName} must be left, center, right, justify, or inherit`)
  return normalized
}

function normTransform(value: unknown, fallback: TextTransform, fieldName: string): TextTransform {
  const normalized = text(value, fallback).trim().toLowerCase() as TextTransform
  if (!TRANSFORM_VALUES.includes(normalized)) {
    throw new TypeError(`${fieldName} must be none, uppercase, lowercase, or capitalize`)
  }
  return normalized
}

function normLine(value: unknown, fallback: string, fieldName: string): string {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) throw new TypeError(`${fieldName} must be positive`)
    return String(value)
  }
  const normalized = text(value, fallback).trim()
  if (
    normalized !== "normal" &&
    !SIZE_PATTERN.test(normalized) &&
    !/^\d+(?:\.\d+)?$/.test(normalized)
  ) {
    throw new TypeError(`${fieldName} must be a valid CSS line-height`)
  }
  return normalized
}

function normStyle(
  rawStyle: unknown,
  defaults: TextStyleOptions,
  baseDir: string,
  globalFont: string,
  globalFontFormat: string,
  familyName: string,
  styleName: string,
  defaultColor: string,
): NormalizedTextStyle {
  const style = rawStyle === undefined ? {} : rawStyle
  if (!isObj(style)) throw new TypeError(`theme.styles.${styleName} must be an object`)

  const customFont =
    style.font === undefined || style.font === ""
      ? ""
      : asset(str(style.font, `theme.styles.${styleName}.font`), baseDir)
  const fontSource = customFont || globalFont
  const fontFormat = customFont ? fontType(customFont) : globalFontFormat

  return {
    fontSource,
    fontFormat,
    fontFamily: customFont ? familyName : "HelpCustomFont",
    color:
      style.color === undefined || style.color === ""
        ? defaultColor
        : checkColor(
            str(style.color, `theme.styles.${styleName}.color`).trim(),
            `theme.styles.${styleName}.color`,
          ),
    size: normSize(style.size, text(defaults.size, "16px"), `theme.styles.${styleName}.size`),
    align: normAlign(
      style.align,
      (defaults.align ?? "left") as TextAlign,
      `theme.styles.${styleName}.align`,
    ),
    weight: normWeight(
      style.weight,
      text(defaults.weight, "400"),
      `theme.styles.${styleName}.weight`,
    ),
    shadow: normShadow(
      style.shadow,
      text(defaults.shadow, "none"),
      `theme.styles.${styleName}.shadow`,
    ),
    lineHeight: normLine(
      style.lineHeight,
      text(defaults.lineHeight, "1.2"),
      `theme.styles.${styleName}.lineHeight`,
    ),
    letterSpacing: normSpace(
      style.letterSpacing,
      text(defaults.letterSpacing, "0"),
      `theme.styles.${styleName}.letterSpacing`,
    ),
    opacity: normOpacity(style.opacity, defaults.opacity ?? 1, `theme.styles.${styleName}.opacity`),
    transform: normTransform(
      style.transform,
      (defaults.transform ?? "none") as TextTransform,
      `theme.styles.${styleName}.transform`,
    ),
  }
}

function normStyles(
  rawStyles: unknown,
  baseDir: string,
  theme: {
    font: string
    fontFormat: string
    fontColor: string
    descColor: string
    mutedColor: string
    fontShadow: string
    accentColor: string
  },
): NormalizedTextStyles {
  const styles = rawStyles === undefined ? {} : rawStyles
  if (!isObj(styles)) throw new TypeError("theme.styles must be an object")

  const defaults: Record<(typeof STYLE_KEYS)[number], TextStyleOptions> = {
    menu: { ...DEFAULT_THEME.styles.menu, color: theme.accentColor },
    title: { ...DEFAULT_THEME.styles.title, color: theme.fontColor, shadow: theme.fontShadow },
    group: { ...DEFAULT_THEME.styles.group, color: theme.fontColor, shadow: theme.fontShadow },
    item: { ...DEFAULT_THEME.styles.item, color: theme.fontColor, shadow: theme.fontShadow },
    desc: { ...DEFAULT_THEME.styles.desc, color: theme.descColor },
    footer: { ...DEFAULT_THEME.styles.footer, color: theme.mutedColor },
  }

  return Object.fromEntries(
    STYLE_KEYS.map(styleName => [
      styleName,
      normStyle(
        styles[styleName],
        defaults[styleName],
        baseDir,
        theme.font,
        theme.fontFormat,
        STYLE_FAMILY_NAMES[styleName],
        styleName,
        defaults[styleName].color ?? theme.fontColor,
      ),
    ]),
  ) as unknown as NormalizedTextStyles
}

function normTheme(theme: unknown, baseDir: string): NormalizedThemeOptions {
  if (theme === undefined) theme = {}
  if (!isObj(theme)) throw new TypeError("theme must be an object")

  const typedTheme = theme as Partial<HelpThemeOptions>
  const mode = getMode(typedTheme.mode ?? DEFAULT_THEME.mode)
  const color = (value: unknown, fallback: string, fieldName: string): string =>
    checkColor(
      str(value === undefined || value === "" ? fallback : value, fieldName).trim(),
      fieldName,
    )
  const fontColorInput = typedTheme.color
  const fontColor = checkColor(
    str(
      fontColorInput === undefined || fontColorInput === ""
        ? mode === "dark"
          ? DARK_DEFAULTS.fontColor
          : DEFAULT_THEME.color
        : fontColorInput,
      "theme.color",
    ).trim(),
    "theme.color",
  )
  const descColorInput = typedTheme.desc
  const descColor = checkColor(
    str(
      descColorInput === undefined || descColorInput === ""
        ? mode === "dark"
          ? DARK_DEFAULTS.descColor
          : DEFAULT_THEME.desc
        : descColorInput,
      "theme.desc",
    ).trim(),
    "theme.desc",
  )
  const fontSizeInput = typedTheme.size
  const fontSize = normSize(
    fontSizeInput === undefined || fontSizeInput === "" ? DEFAULT_THEME.size : fontSizeInput,
    text(DEFAULT_THEME.size, "16px"),
    "theme.size",
  )
  const font = asset(str(typedTheme.font ?? DEFAULT_THEME.font, "theme.font"), baseDir)
  const fontFormat = fontType(font)
  const fontShadow = normShadow(typedTheme.shadow, DEFAULT_THEME.shadow, "theme.shadow")
  const pageBgColor = color(
    typedTheme.bgColor,
    mode === "dark" ? DARK_DEFAULTS.pageBgColor : DEFAULT_THEME.bgColor,
    "theme.bgColor",
  )
  const panelBorderColor = color(
    typedTheme.panelBorder,
    mode === "dark" ? DARK_DEFAULTS.panelBorderColor : DEFAULT_THEME.panelBorder,
    "theme.panelBorder",
  )
  const accentColor = color(
    typedTheme.accent,
    mode === "dark" ? DARK_DEFAULTS.accentColor : DEFAULT_THEME.accent,
    "theme.accent",
  )
  const mutedColor = color(
    typedTheme.muted,
    mode === "dark" ? DARK_DEFAULTS.mutedColor : DEFAULT_THEME.muted,
    "theme.muted",
  )
  const panelShadow = normShadow(
    typedTheme.panelShadow,
    mode === "dark" ? DARK_DEFAULTS.panelShadow : DEFAULT_THEME.panelShadow,
    "theme.panelShadow",
  )
  const groupLineColor = color(
    typedTheme.groupLine,
    mode === "dark" ? DARK_DEFAULTS.groupLineColor : DEFAULT_THEME.groupLine,
    "theme.groupLine",
  )
  const itemBorderColor = color(
    typedTheme.itemBorder,
    mode === "dark" ? DARK_DEFAULTS.itemBorderColor : DEFAULT_THEME.itemBorder,
    "theme.itemBorder",
  )
  const markerColor = color(
    typedTheme.markColor,
    mode === "dark" ? DARK_DEFAULTS.markerColor : DEFAULT_THEME.markColor,
    "theme.markColor",
  )
  const markerRingColor = color(
    typedTheme.ringColor,
    mode === "dark" ? DARK_DEFAULTS.markerRingColor : DEFAULT_THEME.ringColor,
    "theme.ringColor",
  )
  const footerBorderColor = color(
    typedTheme.footBorder,
    mode === "dark" ? DARK_DEFAULTS.footerBorderColor : DEFAULT_THEME.footBorder,
    "theme.footBorder",
  )
  const styles = normStyles(typedTheme.styles, baseDir, {
    font,
    fontFormat,
    fontColor,
    descColor,
    mutedColor,
    fontShadow,
    accentColor,
  })

  return {
    mode,
    backgroundImage: asset(
      str(typedTheme.bgImage ?? DEFAULT_THEME.bgImage, "theme.bgImage"),
      baseDir,
    ),
    backgroundSize: normPos(typedTheme.bgSize, DEFAULT_THEME.bgSize, "theme.bgSize"),
    backgroundPosition: normPos(typedTheme.bgPos, DEFAULT_THEME.bgPos, "theme.bgPos"),
    font,
    fontFormat,
    fontColor,
    fontSize,
    descColor,
    fontShadow,
    pageBgColor,
    panelBorderColor,
    accentColor,
    mutedColor,
    contBgColor: color(
      typedTheme.panel,
      mode === "dark" ? DARK_DEFAULTS.contBgColor : DEFAULT_THEME.panel,
      "theme.panel",
    ),
    contBgBlur: normSpace(typedTheme.blur, `${DEFAULT_THEME.blur}px`, "theme.blur"),
    panelShadow,
    headerBgColor: color(
      typedTheme.headBg,
      mode === "dark" ? DARK_DEFAULTS.headerBgColor : DEFAULT_THEME.headBg,
      "theme.headBg",
    ),
    groupLineColor,
    rowBgColor1: color(
      typedTheme.row1,
      mode === "dark" ? DARK_DEFAULTS.rowBgColor1 : DEFAULT_THEME.row1,
      "theme.row1",
    ),
    rowBgColor2: color(
      typedTheme.row2,
      mode === "dark" ? DARK_DEFAULTS.rowBgColor2 : DEFAULT_THEME.row2,
      "theme.row2",
    ),
    itemBorderColor,
    pagePadding: normSpace(typedTheme.pagePad, DEFAULT_THEME.pagePad, "theme.pagePad"),
    containerPadding: normSpace(typedTheme.panelPad, DEFAULT_THEME.panelPad, "theme.panelPad"),
    containerRadius: normSpace(typedTheme.panelRad, DEFAULT_THEME.panelRad, "theme.panelRad"),
    groupGap: normSpace(typedTheme.groupGap, DEFAULT_THEME.groupGap, "theme.groupGap"),
    itemGap: normSpace(typedTheme.itemGap, DEFAULT_THEME.itemGap, "theme.itemGap"),
    itemRadius: normSpace(typedTheme.itemRad, DEFAULT_THEME.itemRad, "theme.itemRad"),
    itemPadding: normSpace(typedTheme.itemPad, DEFAULT_THEME.itemPad, "theme.itemPad"),
    headerMarginBottom: normSpace(typedTheme.headGap, text(DEFAULT_THEME.headGap), "theme.headGap"),
    headerPaddingLeft: normSpace(typedTheme.headPad, text(DEFAULT_THEME.headPad), "theme.headPad"),
    headerBorderWidth: normSpace(
      typedTheme.headBorder,
      text(DEFAULT_THEME.headBorder),
      "theme.headBorder",
    ),
    groupHeadingPadding: normSpace(typedTheme.groupPad, DEFAULT_THEME.groupPad, "theme.groupPad"),
    groupHeadingRadius: normSpace(typedTheme.groupRad, DEFAULT_THEME.groupRad, "theme.groupRad"),
    groupHeadingMarginBottom: normSpace(
      typedTheme.groupHeadGap,
      text(DEFAULT_THEME.groupHeadGap),
      "theme.groupHeadGap",
    ),
    groupNameGap: normSpace(typedTheme.nameGap, text(DEFAULT_THEME.nameGap), "theme.nameGap"),
    itemContentGap: normSpace(
      typedTheme.contentGap,
      text(DEFAULT_THEME.contentGap),
      "theme.contentGap",
    ),
    groupLineWidth: normSpace(
      typedTheme.lineWidth,
      text(DEFAULT_THEME.lineWidth),
      "theme.lineWidth",
    ),
    markerColor,
    markerSize: normSpace(typedTheme.markSize, text(DEFAULT_THEME.markSize), "theme.markSize"),
    markerRingColor,
    markerRingSize: normSpace(typedTheme.ringSize, text(DEFAULT_THEME.ringSize), "theme.ringSize"),
    footerMarginTop: normSpace(typedTheme.footGap, text(DEFAULT_THEME.footGap), "theme.footGap"),
    footerPaddingTop: normSpace(typedTheme.footPad, text(DEFAULT_THEME.footPad), "theme.footPad"),
    footerBorderColor,
    commandMenu: text(typedTheme.menu ?? DEFAULT_THEME.menu),
    pageFooter: text(typedTheme.footer ?? DEFAULT_THEME.footer),
    styles,
  }
}

function normCols(value: unknown): number {
  const columns = Number(value)
  if (!Number.isFinite(columns) || columns <= 0)
    throw new TypeError("columns must be a positive number")
  if (!Number.isInteger(columns) || columns > 6)
    throw new TypeError("columns must be an integer from 1 to 6")
  return columns
}

export function normalize(input: HelpOptions = {}): NormalizedHelpOptions {
  if (!isObj(input)) throw new TypeError("help options must be an object")

  const options = input as Record<string, unknown>
  const baseDir = path.resolve(text(options.baseDir, process.cwd()))
  const rawList = options.list === undefined ? [] : options.list
  if (!Array.isArray(rawList)) throw new TypeError("list must be an array")

  return {
    title: text(options.title, "HELP"),
    theme: normTheme(options.theme, baseDir),
    list: rawList.map((group, groupIndex) => normGroup(group, groupIndex)),
    columns: options.columns === undefined ? 2 : normCols(options.columns),
  }
}
