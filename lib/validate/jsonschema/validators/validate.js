import { schemaDatabase, sessionDatabase } from '../common/database.js'
import { vocabularies } from './vocabularies.js'

export const validate = (schema, instance) => {
  const errors = []
  if (schema?.$schema) {
    const [schemaUri] = sessionDatabase.get('schema').slice(-1)
    sessionDatabase.get('schema').push(
      String(new URL(schema.$schema, schemaUri)))
  }
  if (schema?.$id) {
    const [baseUri] = sessionDatabase.get('base').slice(-1)
    sessionDatabase.get('base').push(String(new URL(schema.$id, baseUri)))
  }
  const validators = schemaValidators()
  if ([true, false].includes(schema)) schema = { __boolean__: schema }
  for (const [rule, value] of Object.entries(schema)) {
    const validator = validators[rule]
    if (!validator) continue
    errors.push(...validator(value, instance, validate, schema))
  }
  if (schema?.$id) sessionDatabase.get('base').pop()
  if (schema?.$schema) sessionDatabase.get('schema').pop()
  return errors
}

const schemaValidators = () => {
  const [schemaUri] = sessionDatabase.get('schema').slice(-1)
  const schema = schemaDatabase.get(schemaUri)

  const vocabularyUris = []
  for (let [key, value] of Object.entries(schema.$vocabulary || {})) {
    if (value) vocabularyUris.push(key)
  }

  const validators = {}
  for (const uri of vocabularyUris) {
    const vocabularyValidators = vocabularies[uri]
    Object.assign(validators, vocabularyValidators)
  }

  return validators
}