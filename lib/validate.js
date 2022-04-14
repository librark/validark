import { ValidationError } from './errors.js'

/** @param {Object} schema
 * @param {Array[Object]} records
 * @return {Array[Object]}
 * */
export function validate(schema, records) {
  if (!Array.isArray(records)) {
    throw new ValidationError('The "records" parameter must be an array.')
  }

  const result = []
  for(const [index, record] of records.entries()) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      throw new ValidationError(
        `Record "${index}" is not an object. Got "${record}".`)
    }

    const item = {}
    for(let [field, validator] of Object.entries(schema)) {
      const required = field[0] === '*'
      field = required ? field.slice(1) : field

      let [key, value] = [undefined, undefined]
      for(key of field.split(":=").reverse()) {
        value = ((typeof record[key] !== 'undefined') ? 
          record[key] : value)
      }

      if(required && typeof value === 'undefined') {
        throw new ValidationError(`The field "${key}" is required.`)
      }

      if(typeof value !== 'undefined') {

        if(Array.isArray(value)) {
          validator = validator.pop()
          if(typeof validator === 'object' && validator !== null) { 
            item[key] = validate(validator, value)
          } else {
            item[key] = value.map(item => validator(item))
          }
          continue
        } else 
          if(typeof validator === 'object' && validator !== null) {
          item[key] = validate(validator, [value]).shift()
          continue
        }

        const outcome = validator(value)
        if(Number.isNaN(outcome)) {
          throw new ValidationError(
            `The field "${key}" must be a number. Got "${value}".`)
        } else if(outcome instanceof Error) {
          throw outcome
        }
        item[key] = outcome
      }

    }
    result.push(item)
  }

  return result
}
