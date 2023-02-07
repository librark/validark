/**
 * @param {AsyncFunction|object} target
 * @param {{ storer: Storer, lifetime: number }} options
 * @returns {AsyncFunction|Proxy}
 */
export function cache (target, {
  storer=new MemoryStorer(), lifetime=600_000
} = {}) {

  const type = typeof target
  if (!['function', 'object'].includes(type)) {
    return target
  }

  if (target.constructor.name === 'AsyncFunction') {
    const wrapper = async (...args) => {
      const key = JSON.stringify(args)

      let { value, expiration=Infinity } = await storer.get(key)

      const moment = Date.now()
      if (value === undefined || moment > expiration) {
        value = await target(...args)
        await storer.set(key, { value, expiration: moment + lifetime })
      }

      return value
    }
    return wrapper
  }

  if (target.constructor.name === 'Function') return target

  return new Proxy(target, {
    get (target, property) {
      if (target[property].constructor.name === 'AsyncFunction') {
        return cache(target[property].bind(target), { storer, lifetime })
      }
      return Reflect.get(...arguments)
    }
  })
}

/** @abstract */
export class Storer {
  /**
   * @param {string} key
   * @returns {Promise<{{value?: any: expiration?: number}}>} */
  async get (key) {
    throw new Error('Not implemented.')
  }

  /** @param {string} key @param {{ value: any, expiration?: number }}
   * @returns {Promise<void>} */
  async set (_key, { value, expiration }) {
    throw new Error('Not implemented.')
  }
}

class MemoryStorer extends Storer {
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
