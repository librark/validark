import { NeedError } from './errors.js'

export function need (type, fallback) {
  if (fallback === undefined) {
    throw new NeedError(`A value of type "${type.name}" is needed.`)
  }

  if (!((fallback.constructor === type) || (fallback instanceof type))) {
    throw new NeedError(
      `The fallback value must be of type "${type.name}". ` +
      `Got "${fallback.constructor.name}".`)
  }

  return fallback
}
