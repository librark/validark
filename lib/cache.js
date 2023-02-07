/** 
 * @param {object} object
 * @return {AsyncFunction|Proxy}
 */
export function cache (target) {
  if (target.constructor.name === 'AsyncFunction') {
    const storer = new MemoryStorer()
    const wrapper = async (...args) => {
      const key = JSON.stringify(args)
      let value = await storer.get(key)
      if (value === undefined) {
        value = await target(...args)
        await storer.set(key, value)
      }
      return value
    }
    return wrapper
  }

  if (target.constructor.name === 'Function') {
    return target
  }

  return new Proxy(target, {
    get (target, property) {
      if (target[property].constructor.name === 'AsyncFunction') {
        return cache(target[property].bind(target))
      }
      return target[property].bind(target)
    }
  })
}

export class Storer {
  /** @param {string} key @returns {Promise<any>} */
  async get (_key) {
    throw new Error('Not implemented.')
  }

  /** @param {string} key @returns {Promise<void>} */
  async set (_key, _value) {
    throw new Error('Not implemented.')
  }

  /** @param {string} key @returns {Promise<any>} */
  async remove (_key) {
    throw new Error('Not implemented.')
  }
}

export class MemoryStorer extends Storer {
  constructor () {
    super()
    this.data = {}
  }

  async get (key) {
    return this.data[key]
  }

  async set (key, value) {
    this.data[key] = value
  }

  async remove (key) {
    delete this.data[key]
  }
}
