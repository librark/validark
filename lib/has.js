import { HasError } from './errors.js'

export function has (instance, properties) {
  if (!instance) {
    throw new HasError(`Instance must be an object. Got "${instance}".`)
  }
  properties = [properties].flat().map(item => item.split(',').map(
    subitem => subitem.trim())).flat()
  for (const property of properties) {
    if (!Object.hasOwn(instance, property)) {
      throw new HasError(`Instance does not have property "${property}".`)
    }
  }
  return instance
}
