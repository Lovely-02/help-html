import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export interface HelpResources {
  document: string
  group: string
  item: string
  style: string
}

const RESOURCE_DIR = fileURLToPath(new URL("../resources/", import.meta.url))
const resourceCache = new Map<string, string>()

function read(fileName: string): string {
  const cached = resourceCache.get(fileName)
  if (cached !== undefined) return cached

  const content = readFileSync(path.join(RESOURCE_DIR, fileName), "utf8")
  resourceCache.set(fileName, content)
  return content
}

export function load(): HelpResources {
  return {
    document: read("template.html"),
    group: read("group.html"),
    item: read("item.html"),
    style: read("style.css"),
  }
}

export function clearCache(): void {
  resourceCache.clear()
}
