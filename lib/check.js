import { CheckError } from './errors.js'

/** @param {any} value
 * @param {String} message
 * @return {any}
 * */
export function check(value = false, message = '') {
  if (!value) {
    throw new CheckError(message)
  }
  return value
}
