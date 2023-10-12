import { sessionDatabase, load } from './common/index.js'
import { validate } from './validators/index.js'

const defaultSchema = 'https://json-schema.org/draft/2020-12/schema'
const defaultUri = String(new URL(import.meta.url))

/** @param {Object} schema
 * @param {Array[Object] | Object} instance
 * @return {boolean}
 * */
export function validateJsonSchema (schema, instance, strict = true) {
  sessionDatabase.set('schema', [defaultSchema])
  sessionDatabase.set('base', [defaultUri])
  sessionDatabase.set('evaluatedProperties', [new Set()])
  sessionDatabase.set('evaluatedItems', [[]])
  load({ [defaultUri]: schema })

  const errors = validate(schema, instance)
  if (strict && errors.length) {
    const message = errors.map(error => error.message).join('\n')
    throw new AggregateError(errors, 'JsonSchemaError\n\n' + message)
  }

  return !errors.length
}
