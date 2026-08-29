import { normalize } from "./options.js"
import { load } from "./resources.js"
import type { HelpOptions, NormalizedHelpOptions, NormalizedTextStyle } from "./types.js"

type TemplateValues = Record<string, string>
const STYLE_KEYS = ["menu", "title", "group", "item", "desc", "footer"] as const

function itemAlign(align: NormalizedTextStyle["align"]): string {
  if (align === "center") return "center"
  if (align === "right") return "flex-end"
  if (align === "justify") return "stretch"
  return "flex-start"
}

function fill(template: string, values: TemplateValues): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  )
}

function escHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function escUrl(value: string): string {
  return value.replace(/["\\\r\n]/g, character => `\\${character}`)
}

function addStyle(values: TemplateValues, key: string, style: NormalizedTextStyle): void {
  values[`${key}-font-source`] = style.fontSource
    ? escUrl(style.fontSource)
    : "data:font/ttf;base64,"
  values[`${key}-font-format`] = style.fontFormat
  values[`${key}-font-family`] = style.fontFamily
  values[`${key}-color`] = style.color
  values[`${key}-size`] = style.size
  values[`${key}-align`] = style.align
  values[`${key}-weight`] = style.weight
  values[`${key}-shadow`] = style.shadow
  values[`${key}-line-height`] = style.lineHeight
  values[`${key}-letter-spacing`] = style.letterSpacing
  values[`${key}-opacity`] = String(style.opacity)
  values[`${key}-transform`] = style.transform
}

function groups(resources: ReturnType<typeof load>, options: NormalizedHelpOptions): string {
  return options.list
    .map(group => {
      const items =
        group.list
          ?.map(item =>
            fill(resources.item, {
              name: escHtml(item.name),
              desc: escHtml(item.desc ?? ""),
            }),
          )
          .join("") ?? ""

      return fill(resources.group, {
        name: escHtml(group.name),
        desc: escHtml(group.desc ?? ""),
        items,
      })
    })
    .join("")
}

function css(resources: ReturnType<typeof load>, options: NormalizedHelpOptions): string {
  const { theme } = options
  const backgroundImage = theme.backgroundImage ? `url("${escUrl(theme.backgroundImage)}")` : "none"
  const values: TemplateValues = {
    "background-image": backgroundImage,
    "background-size": theme.backgroundSize,
    "background-position": theme.backgroundPosition,
    "header-align": itemAlign(theme.styles.title.align),
    "header-width": theme.styles.title.align === "justify" ? "100%" : "fit-content",
    "page-bg-color": theme.pageBgColor,
    "panel-border-color": theme.panelBorderColor,
    "accent-color": theme.accentColor,
    "muted-color": theme.mutedColor,
    "page-padding": theme.pagePadding,
    "container-padding": theme.containerPadding,
    "container-radius": theme.containerRadius,
    "cont-bg-color": theme.contBgColor,
    "cont-bg-blur": theme.contBgBlur,
    "panel-shadow": theme.panelShadow,
    "header-bg-color": theme.headerBgColor,
    "group-line-color": theme.groupLineColor,
    "row-bg-color-1": theme.rowBgColor1,
    "row-bg-color-2": theme.rowBgColor2,
    "item-border-color": theme.itemBorderColor,
    "item-radius": theme.itemRadius,
    "item-padding": theme.itemPadding,
    "group-gap": theme.groupGap,
    "item-gap": theme.itemGap,
    "header-margin-bottom": theme.headerMarginBottom,
    "header-padding-left": theme.headerPaddingLeft,
    "header-border-width": theme.headerBorderWidth,
    "group-heading-padding": theme.groupHeadingPadding,
    "group-heading-radius": theme.groupHeadingRadius,
    "group-heading-margin-bottom": theme.groupHeadingMarginBottom,
    "group-name-gap": theme.groupNameGap,
    "item-content-gap": theme.itemContentGap,
    "group-line-width": theme.groupLineWidth,
    "marker-color": theme.markerColor,
    "marker-size": theme.markerSize,
    "marker-ring-color": theme.markerRingColor,
    "marker-ring-size": theme.markerRingSize,
    "footer-margin-top": theme.footerMarginTop,
    "footer-padding-top": theme.footerPaddingTop,
    "footer-border-color": theme.footerBorderColor,
    "font-color": theme.fontColor,
    "font-size": theme.fontSize,
    columns: String(options.columns),
  }

  values["global-font-source"] = theme.font ? escUrl(theme.font) : "data:font/ttf;base64,"
  values["global-font-format"] = theme.fontFormat

  for (const key of STYLE_KEYS) addStyle(values, key, theme.styles[key])
  return fill(resources.style, values)
}

export function render(input: HelpOptions = {}): string {
  const options = normalize(input)
  const resources = load()

  return fill(resources.document, {
    theme: options.theme.mode,
    title: escHtml(options.title),
    menu: escHtml(options.theme.commandMenu),
    style: css(resources, options),
    groups: groups(resources, options),
    footer: escHtml(options.theme.pageFooter),
  })
}
