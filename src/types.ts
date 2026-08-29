export type ThemeMode = "light" | "dark"
export type TextAlign = "left" | "center" | "right" | "justify" | "inherit"
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize"

export interface HelpItem {
  name: string
  desc?: string
}

export interface HelpGroup {
  name: string
  desc?: string
  list?: HelpItem[]
}

export interface TextStyleOptions {
  font?: string
  color?: string
  size?: string | number
  align?: TextAlign
  weight?: string | number
  shadow?: string
  lineHeight?: string | number
  letterSpacing?: string | number
  opacity?: number
  transform?: TextTransform
}

export interface TextStyles {
  menu?: TextStyleOptions
  title?: TextStyleOptions
  group?: TextStyleOptions
  item?: TextStyleOptions
  desc?: TextStyleOptions
  footer?: TextStyleOptions
}

export interface HelpThemeOptions {
  bgImage?: string
  font?: string
  menu?: string
  mode?: "auto" | "dark" | "light"
  bgColor?: string
  panelBorder?: string
  accent?: string
  muted?: string
  color?: string
  size?: string | number
  footer?: string
  shadow?: string
  desc?: string
  panel?: string
  blur?: string | number
  panelShadow?: string
  headBg?: string
  groupLine?: string
  row1?: string
  row2?: string
  itemBorder?: string
  pagePad?: string
  panelPad?: string
  panelRad?: string
  groupGap?: string
  itemGap?: string
  itemRad?: string
  itemPad?: string
  headGap?: string | number
  headPad?: string | number
  headBorder?: string | number
  groupPad?: string
  groupRad?: string
  groupHeadGap?: string | number
  nameGap?: string | number
  contentGap?: string | number
  lineWidth?: string | number
  markColor?: string
  markSize?: string | number
  ringColor?: string
  ringSize?: string | number
  footGap?: string | number
  footPad?: string | number
  footBorder?: string
  bgSize?: string
  bgPos?: string
  styles?: TextStyles
}

export interface HelpOptions {
  title?: string
  theme?: HelpThemeOptions
  list?: HelpGroup[]
  columns?: number
  baseDir?: string
}

export interface NormalizedTextStyle {
  fontSource: string
  fontFormat: string
  fontFamily: string
  color: string
  size: string
  align: TextAlign
  weight: string
  shadow: string
  lineHeight: string
  letterSpacing: string
  opacity: number
  transform: TextTransform
}

export interface NormalizedTextStyles {
  menu: NormalizedTextStyle
  title: NormalizedTextStyle
  group: NormalizedTextStyle
  item: NormalizedTextStyle
  desc: NormalizedTextStyle
  footer: NormalizedTextStyle
}

export interface NormalizedThemeOptions {
  mode: ThemeMode
  backgroundImage: string
  backgroundSize: string
  backgroundPosition: string
  font: string
  fontFormat: string
  fontColor: string
  fontSize: string
  descColor: string
  fontShadow: string
  pageBgColor: string
  panelBorderColor: string
  accentColor: string
  mutedColor: string
  contBgColor: string
  contBgBlur: string
  panelShadow: string
  headerBgColor: string
  groupLineColor: string
  rowBgColor1: string
  rowBgColor2: string
  itemBorderColor: string
  pagePadding: string
  containerPadding: string
  containerRadius: string
  groupGap: string
  itemGap: string
  itemRadius: string
  itemPadding: string
  headerMarginBottom: string
  headerPaddingLeft: string
  headerBorderWidth: string
  groupHeadingPadding: string
  groupHeadingRadius: string
  groupHeadingMarginBottom: string
  groupNameGap: string
  itemContentGap: string
  groupLineWidth: string
  markerColor: string
  markerSize: string
  markerRingColor: string
  markerRingSize: string
  footerMarginTop: string
  footerPaddingTop: string
  footerBorderColor: string
  commandMenu: string
  pageFooter: string
  styles: NormalizedTextStyles
}

export interface NormalizedHelpOptions {
  title: string
  theme: NormalizedThemeOptions
  list: HelpGroup[]
  columns: number
}
