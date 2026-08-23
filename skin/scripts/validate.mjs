import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const skinRoot = join(packageRoot, 'skin')
const skinDir = join(skinRoot, 'hello-kitty-expressive')
const manifestPath = join(skinDir, 'skin.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh')
const profile = process.env.DSH_PROFILE || 'web'
const defaultModule = join(
  dshHome,
  'profiles',
  profile,
  'node_modules',
  '@linxin666',
  'dsh-client-ui-skin-center',
  'lib',
  'index.js',
)
const modulePath = process.env.SKIN_CENTER_MODULE || defaultModule

if (!existsSync(modulePath)) {
  throw new Error(`Skin Center validator not found: ${modulePath}`)
}

const {
  loadSkinCatalog,
  transformSkinCss,
  validateSkinManifestV2,
} = await import(pathToFileURL(modulePath).href)

const validation = validateSkinManifestV2(manifest)
if (!validation.ok) {
  throw new Error(`skin.json validation failed:\n${validation.errors.join('\n')}`)
}

if (manifest.id !== 'hello-kitty-expressive') {
  throw new Error('skin id must match its directory name')
}

for (const field of ['stylesheet', 'patches']) {
  const relative = manifest.contributes[field]
  if (!relative) continue
  const path = join(skinDir, relative)
  if (!existsSync(path)) throw new Error(`missing contributes.${field}: ${relative}`)
  const css = readFileSync(path, 'utf8')
  const transformed = transformSkinCss(css, {
    skinId: manifest.id,
    filename: relative,
  })
  const scopedCss = transformed.code || transformed.css
  if (typeof scopedCss !== 'string') {
    throw new Error(`${relative} returned an unsupported transform result`)
  }
  if (!scopedCss.includes(`html[data-dsh-skin="${manifest.id}"]`)) {
    throw new Error(`${relative} was not scoped by Skin Center`)
  }
  for (const warning of transformed.warnings || []) {
    console.warn(`warning: ${warning}`)
  }
}

const assetUrls = [
  ...readFileSync(join(skinDir, 'skin.css'), 'utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g),
  ...readFileSync(join(skinDir, 'patches.css'), 'utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g),
].map((match) => match[1])

for (const assetUrl of assetUrls) {
  const path = resolve(skinDir, assetUrl)
  if (!path.startsWith(`${skinDir}/`) || !existsSync(path)) {
    throw new Error(`missing or escaping CSS asset: ${assetUrl}`)
  }
}

const catalog = loadSkinCatalog({
  builtinDir: join(packageRoot, '.no-builtins'),
  userDir: skinRoot,
})
if (catalog.diagnostics.length > 0) {
  throw new Error(`catalog diagnostics:\n${JSON.stringify(catalog.diagnostics, null, 2)}`)
}
if (!catalog.skins.some((skin) => skin.manifest.id === manifest.id)) {
  throw new Error('skin did not appear in the user catalog')
}

console.log(`Validated ${manifest.name} (${manifest.id}) v${manifest.version}`)
console.log(`Assets: ${assetUrls.length}; CSS files: 2; catalog entries: ${catalog.skins.length}`)
