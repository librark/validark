import { ValidationError } from '../../common/errors.js'

/** @param {Object} schema
 * @param {Array[Object] | Object} instance
 * @return {boolean}
 * */
export function validateJsonSchema (schema, instance) {
  const errors = validate(schema, instance)
  return !errors.length
}

const validate = (schema, instance) => {
  const errors = []
  if ([true, false].includes(schema)) schema = { __boolean__: schema }
  for (const [rule, value] of Object.entries(schema)) {
    const validator = validators[rule]
    if (!validator) continue
    errors.push(...validator(value, instance, validate))
  }
  return errors
}

const getType = (instance) => {
  if (instance?.constructor === String) return 'string'
  if (Number.isInteger(instance)) return 'integer'
  if (instance?.constructor === Number) return 'number'
  if (instance?.constructor === Boolean) return 'boolean'
  if (instance?.constructor === Array) return 'array'
  if (instance === null) return 'null'
  return 'object'
}

const validators = {
  __boolean__: (value) => {
    if (!value) return [new ValidationError('False schema')]
    return []
  },
  maximum: (value, instance) => {
    if (!['integer', 'number'].includes(getType(instance))) return []
    if (instance > value) return [new ValidationError(
        `The maximum value must be ${value}: Got ${instance}`)]
    return []
  },
  minimum: (value, instance) => {
    if (!['integer', 'number'].includes(getType(instance))) return []
    if (instance < value) return [new ValidationError(
        `The minimum value must be ${value}: Got ${instance}`)]
    return []
  },
  maxItems: (value, instance) => {
    if (!['array'].includes(getType(instance))) return []
    if (instance.length > value) return [new ValidationError(
        `The maximum length must be ${value}: Got ${instance.length}`)]
    return []
  },
  minItems: (value, instance) => {
    if (!['array'].includes(getType(instance))) return []
    if (instance.length < value) return [new ValidationError(
        `The minimum length must be ${value}: Got ${instance.length}`)]
    return []
  },
  type: (value, instance) => {
    const values = [value].flat()
    if (values.includes('number') && [
      'number', 'integer'].includes(getType(instance))) return []
    if (!values.includes(getType(instance))) return [new ValidationError(
        `The type must be ${value}: Got ${getType(instance)}`)]
    return []
  },
  pattern: (value, instance) => {
    if (getType(instance) !== 'string') return []
    if (!(new RegExp(value).test(instance))) return [
      new ValidationError(
        `The instance must match pattern ${value}: Got ${instance}`)]
    return []
  },
  properties: (value, instance, validate) => {
    const errors = []
    if (getType(instance) !== 'object') return []
    const ownProperties = Object.getOwnPropertyNames(instance)
    for (const [property, schema] of Object.entries(value)) {
      if (!ownProperties.includes(property)) continue
      if (instance[property] === undefined) continue
      errors.push(...validate(schema, instance[property]))
    }
    return errors
  }
}
