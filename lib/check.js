import { CheckError } from './errors.js'

/** 
 * @template Type
 * @param {unknown} value
 * @param {typeof Type=} type
 * @return {Type}
 */
export function check (value, type = null) {
  if (!value) {
    throw new CheckError(`Value "${value}" is falsy.`)
  } else if (type && value.constructor !== type) {
    throw new CheckError(
      `Value "${value}" is not an instance of "${type.name}".`)
  }
  return value
}
