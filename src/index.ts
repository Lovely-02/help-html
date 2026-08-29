import { DEFAULT_THEME, normalize } from "./options.js"
import { render } from "./renderer.js"
import { clearCache } from "./resources.js"
import type { HelpOptions } from "./types.js"

export type {
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
  TextStyles,
  TextTransform,
  ThemeMode,
} from "./types.js"
export { clearCache, DEFAULT_THEME, normalize, render }

export function help(options: HelpOptions = {}): string {
  return render(options)
}

export default help
