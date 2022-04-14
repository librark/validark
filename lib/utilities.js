/** @param {any} value
 * @param {String} message
 * @return {any}
 * */
export function check(value = false, message = '') {
  if (!value) {
    throw Error(`check failed. ${message}`.trim())
  }
  return value
}
