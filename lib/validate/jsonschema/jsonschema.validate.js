import { sessionDatabase, load } from './common/index.js'
import { validate } from './validators/index.js'

const defaultSchema = 'https://json-schema.org/draft/2020-12/schema'
const defaultUri = String(new URL('root', import.meta.url))

/** @param {Object} schema
 * @param {Array[Object] | Object} instance
 * @return {boolean}
 * */
export function validateJsonSchema (schema, instance) {
  sessionDatabase.set('schema', [defaultSchema])
  sessionDatabase.set('base', [defaultUri])
  sessionDatabase.set('evaluatedProperties', [new Set()])
  load({ [defaultUri]: schema })

  const errors = validate(schema, instance)

  return !errors.length
}
