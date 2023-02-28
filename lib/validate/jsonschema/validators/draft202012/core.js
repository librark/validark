import { ValidationError } from '../../common/errors.js'
import { schemaDatabase } from '../../common/database.js'
import { reference } from '../base/index.js'

export default {
  __boolean__: (value) => {
    if (!value) return [new ValidationError('Schema has value "false"')]
    return []
  },
  $id: (value, _instance, _validate, schema) => {
    schemaDatabase.set(value, schema)
    return []
  },
  $ref: (value, instance, validate) => {
    const subSchema = reference(value)
    const errors = validate(subSchema, instance)
    return errors
  }
}

