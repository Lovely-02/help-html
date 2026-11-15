# help-html

## 📖 项目简介

把帮助菜单数据变成 HTML 字符串的 TypeScript / npm 包。✨

它只负责生成 HTML，不负责启动浏览器、不负责截图、不负责渲染。

这是一个轻量的帮助菜单生成器，把整齐的 JSON 配置变成漂亮的 HTML 页面。🌸

无论是机器人指令面板、插件帮助页，还是项目内的快捷说明，都可以用几行配置快速生成。你负责准备内容，`help-html` 负责把它排版好。

## ✨ 核心特点

- 🎀 TypeScript 编写，提供完整类型提示
- 🧩 HTML、CSS、分组模板和条目模板分离，方便维护
- ⚡ 同步返回 HTML 字符串，不依赖浏览器运行时
- 🎨 明暗主题、背景图、字体和颜色都可以自定义
- 📐 自适应布局，支持每行 `1-6` 列，不固定页面宽高
- 🛡️ 自动转义文本，避免用户内容直接破坏 HTML

## 🚀 功能特性

- 📝 支持页面标题、菜单文案、分组标题、子标题、描述和页脚
- 🖌️ 支持分别设置各区域的字体、颜色、大小、对齐、字重和阴影
- 🖼️ 支持本地图片、字体文件、URL、`file://` 地址和 Data URL
- 🌙 支持 `auto`、`light`、`dark` 三种主题模式
- 🧊 支持面板透明度、毛玻璃模糊、行背景和边框配色
- 📦 生成结果可以直接交给 Puppeteer、Playwright 等工具渲染

## 安装

```bash
npm install help-html
```

## 最小示例

```js
import help from 'help-html'

const html = help({
	title: '我的帮助',
	list: [
		{
			name: '基础指令',
			list: [
				{ name: '/help', desc: '显示帮助菜单' },
				{ name: '/ping', desc: '检查服务状态' }
			]
		}
	]
})

console.log(html)
```

`help()` 会同步返回完整 HTML 字符串。所有主题参数都有默认值，`theme` 也可以完全省略。🌟

## 快速教程

### 1. 生成 HTML 文件

新建 `build-help.mjs`：

```js
import { writeFile } from 'node:fs/promises'
import help from 'help-html'

const html = help({
	title: '星尘助手',
	theme: {
		menu: 'HELP MENU',
		mode: 'dark',
		font: './assets/main.ttf',
		bgImage: './assets/background.jpg',
		color: '#ceb78b',
		desc: '#eeeeee',
		panel: 'rgba(6, 21, 31, .72)',
		blur: 3
	},
	columns: 2,
	list: [
		{
			name: '常用功能',
			desc: '日常使用',
			list: [
				{ name: '/help', desc: '打开帮助' },
				{ name: '/status', desc: '查看状态' }
			]
		}
	]
})

await writeFile('./help.html', html, 'utf8')
console.log('帮助页面已生成：help.html')
```

然后用浏览器或其他 HTML 工具打开 `help.html` 即可。页面会自动铺满可用空间，不固定宽高。📖

### 2. 自定义标题样式

`theme.styles` 可以分别控制菜单、大标题、小标题、子标题、描述和页脚：

```js
const html = help({
	title: '自定义帮助',
	theme: {
		menu: 'COMMAND MENU',
		styles: {
			menu: { color: '#3b82f6', size: '14px', align: 'center' },
			title: { color: '#ffffff', size: '40px', align: 'center' },
			group: { color: '#ceb78b', size: '18px', align: 'left' },
			item: { color: '#ffffff', size: '16px', align: 'left' },
			desc: { color: '#eeeeee', size: '12px', align: 'left' },
			footer: { color: '#aaaaaa', size: '13px', align: 'center' }
		}
	},
	list: []
})
```

菜单的 `align` 默认是 `inherit`，会跟随大标题对齐：大标题居中时菜单在下方居中，右对齐时菜单靠右。标题后的分组说明会紧跟横杠显示。🎨

## 参数说明

### 顶层参数

| 参数      | 类型          | 默认值          | 说明                   |
| --------- | ------------- | --------------- | ---------------------- |
| `title`   | `string`      | `HELP`          | 页面大标题             |
| `theme`   | `object`      | `{}`            | 主题配置，可省略       |
| `list`    | `HelpGroup[]` | `[]`            | 帮助分组               |
| `columns` | `number`      | `2`             | 每行列数，支持 `1-6`   |
| `baseDir` | `string`      | `process.cwd()` | 相对资源路径的基准目录 |

### `list` 数据

```ts
type HelpGroup = {
	name: string
	desc?: string
	list?: HelpItem[]
}

type HelpItem = {
	name: string
	desc?: string
}
```

### `theme` 基础配置

| 参数          | 默认值                                     | 说明                                       |
| ------------- | ------------------------------------------ | ------------------------------------------ |
| `bgImage`     | `''`                                       | 背景图路径、URL、`file://` 地址或 Data URL |
| `font`        | `''`                                       | 全局字体文件，如 `./assets/main.ttf`       |
| `menu`        | `''`                                       | `COMMAND MENU` 文案；为空时不显示          |
| `mode`        | `auto`                                     | `auto`、`light` 或 `dark`                  |
| `bgColor`     | `#eee9e3`                                  | 页面底色                                   |
| `panelBorder` | `rgba(69, 55, 44, 0.08)`                | 面板边框颜色                               |
| `accent`      | `#edaa7d`                                  | 强调色、装饰线和标记点颜色                 |
| `muted`       | `#72747a`                                  | 辅助文字颜色                               |
| `color`       | `#30343b`                                  | 主文字颜色，默认深灰                       |
| `size`        | `16px`                                     | 基础字号，也支持数字，如 `18`              |
| `footer`      | `''`                                       | 页脚文字；为空时不显示                     |
| `shadow`      | `none`                                     | 主文字阴影                                 |
| `desc`        | `#72747a`                                  | 描述文字颜色                               |
| `panel`       | `rgba(249, 247, 243, 0.98)`                | 面板底色                                   |
| `blur`        | `3`                                        | 面板毛玻璃模糊值，最终按 px 处理           |
| `panelShadow` | `0 20px 60px -24px rgba(48, 39, 32, 0.24)` | 面板阴影                                   |

### `theme` 布局与颜色

| 参数           | 默认值                     | 说明                         |
| -------------- | -------------------------- | ---------------------------- |
| `headBg`       | `#292d35` | 页面标题区底色               |
| `groupLine`    | `rgba(185, 88, 44, 0.22)`  | 小标题横杠颜色               |
| `row1`         | `#ffffff`  | 奇数帮助行底色               |
| `row2`         | `#ffffff`  | 偶数帮助行底色               |
| `itemBorder`   | `rgba(69, 55, 44, 0.1)`   | 帮助行边框颜色               |
| `pagePad`      | `32px`                | 页面内边距                   |
| `panelPad`     | `28px`                     | 面板内边距                   |
| `panelRad`     | `24px`                     | 面板圆角                     |
| `groupGap`     | `28px`                     | 分组之间的间距               |
| `itemGap`      | `12px`                     | 帮助行之间的间距             |
| `itemRad`      | `14px`                     | 帮助行圆角                   |
| `itemPad`      | `18px 20px`                | 帮助行内边距                 |
| `headGap`      | `28px`                     | 页面标题下方间距             |
| `headPad`      | `0px`                     | 标题左侧内边距               |
| `headBorder`   | `0px`                      | 标题左侧强调线宽度           |
| `groupPad`     | `0px`                | 分组标题栏内边距             |
| `groupRad`     | `0px`                     | 分组标题栏圆角               |
| `groupHeadGap` | `14px`                     | 分组标题与帮助行间距         |
| `nameGap`      | `12px`                     | 小标题、横杠和说明之间的间距 |
| `contentGap`   | `0px`                     | 帮助行标记点与文字之间的间距 |
| `lineWidth`    | `0px`                     | 小标题后的横杠宽度           |
| `markColor`    | `#edaa7d`                  | 帮助行标记点颜色             |
| `markSize`     | `0px`                      | 帮助行标记点大小             |
| `ringColor`    | `rgba(185, 88, 44, 0.22)`  | 标记点外环颜色               |
| `ringSize`     | `0px`                      | 标记点外环大小               |
| `footGap`      | `32px`                     | 页脚上方间距                 |
| `footPad`      | `20px`                     | 页脚上方内边距               |
| `footBorder`   | `rgba(69, 55, 44, 0.1)`   | 页脚分隔线颜色               |
| `bgSize`       | `cover`                    | 背景图尺寸，如 `contain`     |
| `bgPos`        | `center`                   | 背景图位置，如 `top left`    |

颜色支持十六进制、`rgb()`、`rgba()`、`hsl()`、`hsla()` 和 CSS 颜色名。尺寸支持 `px`、`rem`、`em`、`%`、`vh`、`vw` 等 CSS 单位。

### `theme.styles`

可配置的样式区域：`menu`、`title`、`group`、`item`、`desc`、`footer`。每项都支持以下字段：

| 字段            | 默认值           | 说明                                              |
| --------------- | ---------------- | ------------------------------------------------- |
| `font`          | `''`             | 当前区域单独使用的字体文件                        |
| `color`         | 继承对应主题颜色 | 文字颜色                                          |
| `size`          | 见下表           | 字体大小                                          |
| `align`         | 见下表           | `left`、`center`、`right`、`justify` 或 `inherit` |
| `weight`        | 见下表           | 字重，如 `400`、`700`、`bold`                     |
| `shadow`        | `none`           | 文字阴影                                          |
| `lineHeight`    | `1.5`            | 行高                                              |
| `letterSpacing` | `0`              | 字间距                                            |
| `opacity`       | `1`              | 透明度，范围 `0-1`                                |
| `transform`     | `none`           | `uppercase`、`lowercase` 或 `capitalize`          |

大标题默认使用暖白色，自定义 `theme.color` 或 `theme.styles.title.color` 可以覆盖。

各区域默认值：

| 区域     | `size`    | `align`   | `weight` | `transform` |
| -------- | --------- | --------- | -------- | ----------- |
| `menu`   | `0.82em`  | `inherit` | `700`    | `uppercase` |
| `title`  | `3em`     | `left`    | `800`    | `none`      |
| `group`  | `1.15em`  | `left`    | `800`    | `none`      |
| `item`   | `1em`     | `left`    | `700`    | `none`      |
| `desc`   | `0.875em` | `left`    | `400`    | `none`      |
| `footer` | `0.82em`  | `center`  | `400`    | `none`      |

## 资源路径

`bgImage` 和 `font` 支持本地路径、URL、`file://` 地址和 Data URL。相对路径默认相对于当前工作目录；指定 `baseDir` 后，会相对于该目录解析：

```js
const html = help({
	baseDir: './assets',
	theme: {
		bgImage: './background.jpg',
		font: './main.ttf'
	}
})
```

本地字体会自动生成 `@font-face`，不需要手动拼接 CSS。🪄

## API

```ts
help(options?: HelpOptions): string
render(options?: HelpOptions): string
normalize(options?: HelpOptions): NormalizedHelpOptions
clearCache(): void
```

`help()` 是默认导出，`help()` 与 `render()` 返回相同结果。`normalize()` 用于只处理和校验参数，`clearCache()` 用于开发时重新读取 `resources/` 中的模板。

## 本地开发

```bash
pnpm install
pnpm build
```

构建流程会依次执行代码检查、TypeScript 编译和压缩。📦

模板资源位于 `resources/`：

- `template.html`：页面主模板
- `group.html`：分组模板
- `item.html`：帮助行模板
- `style.css`：样式模板
