import { validateDefault } from './default/index.js'
import { validateJsonSchema } from './jsonschema/index.js'

/** @param {object} schema
 * @param {Array<object>|object} instance
 * @param {{dialect:string}} options
 * @return {Array<object>|object}
 * */
export function validate (schema, instance, { dialect, strict } = {}) {
  if (dialect?.toLowerCase() === 'jsonschema') {
    validateJsonSchema(schema, instance)
    return instance
  }
  return validateDefault(schema, instance, { strict })
}
