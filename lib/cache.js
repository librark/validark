/**
 * @param {AsyncFunction|object} target
 * @param {{ cacher?: Cacher, lifetime?: number, methods?: string[] }} options
 * @returns {AsyncFunction|Proxy}
 */
export function cache (target, {
  cacher = new MemoryCacher(), size = 128, lifetime = 600_000, methods = []
} = {}) {
  const type = typeof target
  if (!['function', 'object'].includes(type)) {
    return target
  }

  if (target.constructor.name === 'AsyncFunction') {
    const wrapper = async (...args) => {
      const key = `${target.name}.${JSON.stringify(args)}`

      let { value, expiration = Infinity } = (
        await cacher.remove(key)) || {}

      const moment = Date.now()
      if (value === undefined || moment > expiration) {
        value = await target(...args)
        expiration = moment + lifetime
      }

      const count = await cacher.add(key, { value, expiration })
      if (count >= size) await cacher.remove()

      return value
    }
    return wrapper
  }

  if (target.constructor.name === 'Function') return target

  return new Proxy(target, {
    get (target, property) {
      if (target[property].constructor.name !== 'AsyncFunction') {
        return Reflect.get(...arguments)
      }
      if (methods.length && !methods.includes(property)) {
        return Reflect.get(...arguments)
      }
      return cache(target[property].bind(target), { cacher, size, lifetime, methods })
    }
  })
}

/** @abstract */
export class Cacher {
  /** @param {string} key @param {{ value: any, expiration?: number }} content
   * @returns {Promise<number>} */
  async add (_key, { value, expiration }) {
    throw new Error('Not implemented.')
  }

  /**
   * @param {string} key
   * @returns {Promise<{{value?: any: expiration?: number}}>} */
  async remove (key = '') {
    throw new Error('Not implemented.')
  }
}

class MemoryCacher extends Cacher {
  constructor () {
    super()
    this.data = new Map()
  }

  async add (key, { value, expiration }) {
    this.data.set(key, { value, expiration })
    return this.data.size
  }

  async remove (key = '') {
    key = key || this.data.keys().next().value
    const value = this.data.get(key)
    this.data.delete(key)
    return value
  }
}
