import { CheckError } from './errors.js'

/** @param {unknown} value
 * @param {String} message
 * @return {unknown}
 * */
export function check (value = false, message = '') {
  if (!value) {
    throw new CheckError(message)
  }
  return value
}
