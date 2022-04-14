import { GrabError } from './errors.js'

/** @param {Object} container
 * @param {String} key
 * @return {any}
 * */
export function grab(container, key, fallback) {
  let constructor = null
  if (typeof key === 'function') {
    constructor = key 
    key = (constructor.name.charAt(0).toLowerCase() +
      constructor.name.slice(1))
  }

  if (!container || typeof container !== 'object') {
    throw new GrabError(
      `Container must be an object. Got "${container}"`)
  }
  const value = container[key]
  if (value === undefined) {
    if (fallback === undefined) {
      throw new GrabError(`Key "${key}" not found`)
    }
    return fallback 
  }

  if (constructor && !(value instanceof constructor)) { 
    const type = value?.constructor.name
    throw new Error(`Expecting "${constructor.name}" but got "${type}"`)
  }

  return value
}
