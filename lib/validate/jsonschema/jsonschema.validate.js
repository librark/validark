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
    errors.push(...validator(value, instance, validate, schema))
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
    if (!value) return [new ValidationError('Schema has value "false"')]
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
  maxLength: (value, instance) => {
    if (getType(instance) !== 'string') return []
    const length = [...instance].length
    if (length > value) return [new ValidationError(
      `The max length is ${value}: Got ${length}`)]
    return []
  },
  minItems: (value, instance) => {
    if (!['array'].includes(getType(instance))) return []
    if (instance.length < value) return [new ValidationError(
        `The minimum length must be ${value}: Got ${instance.length}`)]
    return []
  },
  minLength: (value, instance) => {
    if (getType(instance) !== 'string') return []
    const length = [...instance].length
    if (length < value) return [new ValidationError(
      `The min length is ${value}: Got ${length}`)]
    return []
  },
  multipleOf: (value, instance) => {
    if (!['number', 'integer'].includes(getType(instance))) return []
    const factor = Math.pow(10, 15)
    const remainder = (instance * factor) % (value * factor)
    if (remainder !== 0) return [new ValidationError(
      `Must be a multiple of ${value}: Got ${instance}`)]
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
  required: (value, instance) => {
    if (getType(instance) !== 'object') return []
    const ownProperties = Object.getOwnPropertyNames(instance)
    const missingProperties = value.filter(
      key => !ownProperties.includes(key))
    if (missingProperties.length) {
      return [new ValidationError(`Properties ${value} are required: ` +
        `Got ${missingProperties} missing.`)]
    }
    return []
  },
  oneOf: (value, instance, validate) => {
    const errors = []
    for (const subSchema of value) {
      errors.push(validate(subSchema, instance))
    }
    const errorNumbers = errors.map(collection => collection.length)
    const numberOfNonErrors = errorNumbers.filter(
      number => number === 0).length
    if (numberOfNonErrors === 1) return []
    if (numberOfNonErrors > 1) return [new ValidationError(
      `Only one of the schemas must be valid. Got ${numberOfNonErrors}`)]
    return errors.flat()
  },
  anyOf: (value, instance, validate) => {
    const errors = []
    for (const subSchema of value) {
      errors.push(validate(subSchema, instance))
    }
    const errorNumbers = errors.map(collection => collection.length)
    const anyNonErrors = !Math.min(...errorNumbers)
    if (anyNonErrors) return []
    return errors.flat()
  },
  allOf: (value, instance, validate) => {
    const errors = []
    for (const subSchema of value) {
      errors.push(validate(subSchema, instance))
    }
    return errors.flat()
  },
  properties: (value, instance, validate) => {
    const errors = []
    if (getType(instance) !== 'object') return []
    const ownProperties = Object.getOwnPropertyNames(instance)
    for (const [property, subSchema] of Object.entries(value)) {
      if (!ownProperties.includes(property)) continue
      errors.push(...validate(subSchema, instance[property]))
    }
    return errors
  },
  patternProperties: (value, instance, validate) => {
    const errors = []
    for (const [pattern, subSchema] of Object.entries(value)) {
      const matchedProperties = Object.keys(instance).filter(
        key => new RegExp(pattern).test(key))
      for (const property of matchedProperties) {
        errors.push(...validate(subSchema, instance[property]))
      }
    }
    return errors
  },
  additionalProperties: (value, instance, validate, schema) => {
    const errors = []
    if (getType(instance) !== 'object') return []
    const schemaPropertyKeys = Object.keys(schema.properties || {})
    let instancePropertyKeys = Object.keys(instance) 
    const patternPropertyKeys = Object.keys(schema.patternProperties || {})
    instancePropertyKeys = instancePropertyKeys.filter(
      key => !patternPropertyKeys.some(
        pattern => new RegExp(pattern).test(key)))
    const differenceProperties = instancePropertyKeys.filter(
      key => !schemaPropertyKeys.includes(key))
    if (value === false && differenceProperties.length) {
      return [new ValidationError(
        `No additionalProperties beyond ${schemaPropertyKeys} are allowed: ` +
        `Got ${differenceProperties} as additional properties.`)]
    }
    for (const additionalKey of differenceProperties) {
      errors.push(...validate(value, instance[additionalKey]))
    }
    return errors
  }
}
