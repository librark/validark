import { CheckError } from './errors.js'

/**
 * @template Type
 * @param {unknown} value
 * @param {typeof Type=} type
 * @return {Type}
 */
export function check (value, { type = null, message = '' } = {}) {
  if (type) {
    let valid = true
    if (type.name === 'String') valid = (typeof value === 'string')
    else if (type.name === 'Number') valid = (typeof value === 'number')
    else if (type.name === 'Boolean') valid = (typeof value === 'boolean')
    else (valid = (value instanceof type))
    if (valid) return
    throw new CheckError(
      message || `Value "${value}" is not an instance of "${type.name}".`)
  } else if (!value) {
    throw new CheckError(message || `Value "${value}" is falsy.`)
  }
  return value
}
