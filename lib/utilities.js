class CheckError extends Error {}

/** @param {any} value
 * @param {String} message
 * @return {any}
 * */
export function check(value = false, message = '') {
  if (!value) {
    throw new CheckError(`check failed. ${message}`.trim())
  }
  return value
}

class GrabError extends Error {}

/** @param {Object} container
 * @param {String} key
 * @return {any}
 * */
export function grab(container = null, key = '', fallback = undefined) {
  if (!container || typeof container !== 'object') {
    throw new GrabError(
      `Argument "container" must be an object. Got "${container}"`)
  }
  const value = container[key]
  if (value === undefined) {
    if (fallback === undefined) {
      throw new GrabError(`Key "${key}" not found`)
    }
    return fallback 
  }
  return value
}
