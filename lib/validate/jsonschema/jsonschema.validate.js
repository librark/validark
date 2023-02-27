import { uriDatabase } from './components/database.js'
import { validate } from './components/validators.js'
import { load } from './components/load.js'
import schemas202012 from './spec/2020-12/index.js'

load(schemas202012)
const defaultUri = String(new URL('root', import.meta.url))

/** @param {Object} schema
 * @param {Array[Object] | Object} instance
 * @return {boolean}
 * */
export function validateJsonSchema (schema, instance) {
  load({ [defaultUri]: schema })
  uriDatabase.set('base', [defaultUri])

  const errors = validate(schema, instance)

  return !errors.length
}
