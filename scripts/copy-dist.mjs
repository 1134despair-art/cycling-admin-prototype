import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const source = path.join(root, 'RuoYi-Vue3-master', 'RuoYi-Vue3-master', 'dist')
const target = path.join(root, 'dist')

if (!existsSync(path.join(source, 'index.html'))) {
  throw new Error('The Vue build did not produce dist/index.html')
}

rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
cpSync(source, target, { recursive: true })
