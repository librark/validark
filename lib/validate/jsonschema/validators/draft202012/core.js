import { ValidationError } from '../../common/errors.js'
import { sessionDatabase } from '../../common/database.js'
import { reference, dynamicReference } from '../base/index.js'

export default {
  __boolean__: (value) => {
    if (!value) return [new ValidationError('Schema has value "false"')]
    return []
  },
  $ref: (value, instance, validate) => {
    const [baseUri] = sessionDatabase.get('base').slice(-1)
    const subSchema = reference(value, baseUri)
    let uri = new URL(value, baseUri)
    if (subSchema.$id && !subSchema.$id.includes(':')) {
      uri = new URL(baseUri)
    }
    const [subBaseUri] = uri.href.split('#')
    sessionDatabase.get('base').push(subBaseUri)
    const errors = validate(subSchema, instance)
    sessionDatabase.get('base').pop()
    return errors
  },
  $dynamicRef: (value, instance, validate) => {
    const subSchema = dynamicReference(value)
    return validate(subSchema, instance)
  }
}
