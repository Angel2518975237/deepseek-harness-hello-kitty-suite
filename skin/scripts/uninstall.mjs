import { existsSync, mkdirSync, renameSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh')
const skinsDir = join(dshHome, 'skins')
const target = join(skinsDir, 'hello-kitty-expressive')

if (!existsSync(target)) {
  console.log(`Skin is not installed: ${target}`)
  process.exit(0)
}

const removedDir = join(skinsDir, '.removed')
mkdirSync(removedDir, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const recoverable = join(removedDir, `hello-kitty-expressive-${stamp}`)
renameSync(target, recoverable)

console.log(`Skin removed from the catalog: ${target}`)
console.log(`Recoverable copy: ${recoverable}`)
console.log('If it was active, select 官方默认 or another skin in 设置 → 皮肤中心。')
