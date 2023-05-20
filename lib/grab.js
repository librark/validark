import { GrabError } from './errors.js'

/** @param {Object} container
 * @param {String} key
 * @return {any}
 * */
export function grab (container, key, fallback) {
  let primary = key
  let secondary = key
  let constructor = null
  if (typeof key === 'function') {
    constructor = key
    secondary = constructor.name
    primary = secondary.charAt(0).toLowerCase() + secondary.slice(1)
  } else if (Array.isArray(key)) {
    constructor = key[1]
    secondary = key[0] 
    primary = secondary.charAt(0).toLowerCase() + secondary.slice(1)

  }

  if (!container || typeof container !== 'object') {
    throw new GrabError(
      `Container must be an object. Got "${container}"`)
  }

  let value = container[primary]
  if (value === undefined) {
    value = container[secondary]
  }

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
