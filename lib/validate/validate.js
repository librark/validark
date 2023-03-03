import { validateDefault } from './default/index.js'
import { validateJsonSchema } from './jsonschema/index.js'

/** @param {Object} schema
 * @param {Array[Object] | Object} instance
 * @param {string} format
 * @return {Array[Object] | Object}
 * */
export function validate (schema, instance) {
  return validateDefault(schema, instance)
}
