import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(packageRoot, 'skin', 'hello-kitty-expressive')
const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh')
const profile = process.env.DSH_PROFILE || 'web'
const skinsDir = join(dshHome, 'skins')
const target = join(skinsDir, 'hello-kitty-expressive')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')

if (!existsSync(join(source, 'skin.json'))) {
  throw new Error(`Skin source is incomplete: ${source}`)
}

mkdirSync(skinsDir, { recursive: true })
const stagingRoot = mkdtempSync(join(skinsDir, '.hello-kitty-expressive-'))
const staging = join(stagingRoot, basename(target))
cpSync(source, staging, { recursive: true, errorOnExist: true })

let backup = null
try {
  if (existsSync(target)) {
    backup = `${target}.backup-${stamp}`
    renameSync(target, backup)
  }
  renameSync(staging, target)
  rmSync(stagingRoot, { recursive: true, force: true })
} catch (error) {
  if (existsSync(stagingRoot)) rmSync(stagingRoot, { recursive: true, force: true })
  if (backup && !existsSync(target) && existsSync(backup)) renameSync(backup, target)
  throw error
}

const profileRoot = join(dshHome, 'profiles', profile)
const skinCenterModule = join(
  profileRoot,
  'node_modules',
  '@linxin666',
  'dsh-client-ui-skin-center',
)
const patchPath = join(profileRoot, 'cordis.patch.yml')

let enabledSkinCenter = false
if (existsSync(skinCenterModule) && existsSync(patchPath)) {
  const original = readFileSync(patchPath, 'utf8')
  const lines = original.split('\n')
  let inside = false
  let found = false
  let changed = false

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (/^\s*-\s+id:\s*['"]?web-ui-skin-center['"]?\s*$/.test(line)) {
      inside = true
      found = true
      continue
    }
    if (inside && /^\s*-\s+id:/.test(line)) inside = false
    if (inside && /^\s+disabled:\s*true\s*$/.test(line)) {
      lines[index] = line.replace(/true\s*$/, 'false')
      changed = true
    }
  }

  if (!found) {
    lines.push('- id: web-ui-skin-center', '  disabled: false')
    changed = true
  }

  if (changed) {
    writeFileSync(`${patchPath}.backup-${stamp}`, original)
    writeFileSync(patchPath, lines.join('\n'))
  }
  enabledSkinCenter = true
}

console.log(`Installed skin: ${target}`)
if (backup) console.log(`Previous version backed up: ${backup}`)
if (enabledSkinCenter) {
  console.log('Skin Center is enabled for the selected profile.')
  console.log('Restart DeepSeek Harness, then open 设置 → 皮肤中心 → 甜心工作台·强化版 → 应用。')
} else {
  console.log('Skin Center was not found in this profile.')
  console.log('Install @linxin666/dsh-client-ui-skin-center, then open 设置 → 皮肤中心 to apply the skin.')
}
