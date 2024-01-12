import { CheckError } from './errors.js'

/**
 * @template Type
 * @param {unknown} value
 * @param {typeof Type=} type
 * @return {Type}
 */
export function check (value, { type = null, message = '' } = {}) {
  if (!value) {
    throw new CheckError(message || `Value "${value}" is falsy.`)
  } else if (type && !(value instanceof type)) {
    throw new CheckError(
      message || `Value "${value}" is not an instance of "${type.name}".`)
  }
  return value
}
