import { mkdir, stat as nodeStat, readFile, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

export default class Cache {
  #persistent_directory: string
  #persistent: boolean

  constructor(persistent = false, persistent_directory?: string) {
    this.#persistent_directory = persistent_directory || Cache.default_persistent_directory
    this.#persistent = persistent
  }

  static get temp_directory() {
    return `${tmpdir()}/youtubei.js`
  }

  static get default_persistent_directory() {
    return resolve(import.meta.dirname, '..', '..', '.cache', 'youtubei.js')
  }

  get cache_dir() {
    return this.#persistent ? this.#persistent_directory : Cache.temp_directory
  }

  async #createCache() {
    const dir = this.cache_dir
    try {
      const cwd = await nodeStat(dir)
      if (!cwd.isDirectory()) throw new Error('An unexpected file was found in place of the cache directory')
    } catch (e: any) {
      if (e?.code === 'ENOENT') await mkdir(dir, { recursive: true })
      else throw e
    }
  }

  async get(key: string) {
    await this.#createCache()
    const file = resolve(this.cache_dir, key)
    try {
      const stat = await nodeStat(file)
      if (stat.isFile()) {
        const data: Buffer = await readFile(file)
        return data.buffer as ArrayBuffer
      }
      throw new Error('An unexpected file was found in place of the cache key')
    } catch (e: any) {
      if (e?.code === 'ENOENT') return undefined
      throw e
    }
  }

  async set(key: string, value: ArrayBuffer) {
    await this.#createCache()
    const file = resolve(this.cache_dir, key)
    await writeFile(file, new Uint8Array(value))
  }

  async remove(key: string) {
    await this.#createCache()
    const file = resolve(this.cache_dir, key)
    try {
      await unlink(file)
    } catch (e: any) {
      if (e?.code === 'ENOENT') return
      throw e
    }
  }
}
