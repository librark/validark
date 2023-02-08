/**
 * @param {AsyncFunction|object} target
 * @param {{ cacher: Cacher, lifetime: number }} options
 * @returns {AsyncFunction|Proxy}
 */
export function cache (target, {
  cacher=new MemoryCacher(), lifetime=600_000, methods=[]
} = {}) {

  const type = typeof target
  if (!['function', 'object'].includes(type)) {
    return target
  }

  if (target.constructor.name === 'AsyncFunction') {
    const wrapper = async (...args) => {
      const key = `${target.name}.${JSON.stringify(args)}`

      let { value, expiration=Infinity } = await cacher.get(key)

      const moment = Date.now()
      if (value === undefined || moment > expiration) {
        value = await target(...args)
        await cacher.set(key, { value, expiration: moment + lifetime })
      }

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
      return cache(target[property].bind(target), { cacher, lifetime })
    }
  })
}

/** @abstract */
export class Cacher {
  /**
   * @param {string} key
   * @returns {Promise<{{value?: any: expiration?: number}}>} */
  async get (key) {
    throw new Error('Not implemented.')
  }

  /** @param {string} key @param {{ value: any, expiration?: number }} content
   * @returns {Promise<void>} */
  async set (_key, { value, expiration }) {
    throw new Error('Not implemented.')
  }
}

class MemoryCacher extends Cacher {
  constructor () {
    super()
    this.data = new Map()
  }

  async get (key) {
    return this.data.get(key) || {}
  }

  async set (key, { value, expiration }) {
    this.data.set(key, { value, expiration })
  }
}
