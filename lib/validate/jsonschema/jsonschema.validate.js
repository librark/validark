import { ValidationError } from '../../common/errors.js'

const uriDatabase = new Map()
const schemaDatabase = new Map()

/** @param {Object} schema
 * @param {Array[Object] | Object} instance
 * @return {boolean}
 * */
export function validateJsonSchema (schema, instance) {
  uriDatabase.set('base', [])
  schemaDatabase.set('', schema)

  //console.log('SchemaDatabase:::', schemaDatabase)

  const errors = validate(schema, instance)
  //console.log('|||RESULT:::', !errors.length)
  return !errors.length
}

/** @param {Object} schemasObject @return {void} */
export function loadSchemas (schemasObject) {
  for (const [uri, schema] of Object.entries(schemasObject)) {
    schemaDatabase.set(uri, schema)
  }
}

const validate = (schema, instance) => {
  const errors = []
  if (schema?.$id) uriDatabase.get('base').push(schema.$id)
  if ([true, false].includes(schema)) schema = { __boolean__: schema }
  for (const [rule, value] of Object.entries(schema)) {
    const validator = validators[rule]
    if (!validator) continue
    errors.push(...validator(value, instance, validate, schema))
  }
  if (schema?.$id) uriDatabase.get('base').pop()
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

const resolve = (document, pointer) => {
  let value = document

  const tokens = (pointer.replace('#', '').split('/') || []).filter(Boolean)

  for (let token of tokens) {
    token = decodeURIComponent(
      token.replaceAll('~1', '/').replaceAll('~0', '~'))
    value = value[token]
  }

  return value
}

const reference = (uri) => {
  const [base] = uriDatabase.get('base').slice(-1)

  let pointer = uri
  let document = schemaDatabase.get('') 

  //console.log('base:::', base, 'pointer:::', pointer, 'document:::', document)

  try {
    const url = new URL(uri, base)
    //console.log('Built URL:::', url)
    document = schemaDatabase.get(url.origin + url.pathname)
    pointer = url.hash
  } catch {}

  const schema = resolve(document, pointer)

  return schema
}


const validators = {
  __boolean__: (value) => {
    if (!value) return [new ValidationError('Schema has value "false"')]
    return []
  },
  enum: (value, instance) => {
    if (!value.map(item => JSON.stringify(item)).includes(
      JSON.stringify(instance))) return [new ValidationError(
      `The value must be included in enum ${value}: Got ${instance}.`)]
    return []
  },
  const: (value, instance) => {
    if (value?.constructor === Object && instance?.constructor === Object) {
      instance = Object.fromEntries(Object.keys(value).map(
        key => [key, instance[key]]))
    }
    if (JSON.stringify(value) !== JSON.stringify(instance)) return [new ValidationError(
      `The value must be the constant ${value}: Got ${instance}.`)]
    return []
  },
  maximum: (value, instance) => {
    if (!['integer', 'number'].includes(getType(instance))) return []
    if (instance > value) return [new ValidationError(
        `The maximum value must be ${value}: Got ${instance}.`)]
    return []
  },
  exclusiveMaximum: (value, instance) => {
    if (!['integer', 'number'].includes(getType(instance))) return []
    if (instance >= value) return [new ValidationError(
        `The maximum value must be lower than ${value}: Got ${instance}.`)]
    return []
  },
  minimum: (value, instance) => {
    if (!['integer', 'number'].includes(getType(instance))) return []
    if (instance < value) return [new ValidationError(
        `The minimum value must be ${value}: Got ${instance}.`)]
    return []
  },
  exclusiveMinimum: (value, instance) => {
    if (!['integer', 'number'].includes(getType(instance))) return []
    if (instance <= value) return [new ValidationError(
        `The minimum value must be higher than ${value}: Got ${instance}.`)]
    return []
  },
  maxItems: (value, instance) => {
    if (!['array'].includes(getType(instance))) return []
    if (instance.length > value) return [new ValidationError(
        `The maximum length must be ${value}: Got ${instance.length}.`)]
    return []
  },
  maxLength: (value, instance) => {
    if (getType(instance) !== 'string') return []
    const length = [...instance].length
    if (length > value) return [new ValidationError(
      `The max length is ${value}: Got ${length}.`)]
    return []
  },
  minItems: (value, instance) => {
    if (!['array'].includes(getType(instance))) return []
    if (instance.length < value) return [new ValidationError(
        `The minimum length must be ${value}: Got ${instance.length}.`)]
    return []
  },
  minLength: (value, instance) => {
    if (getType(instance) !== 'string') return []
    const length = [...instance].length
    if (length < value) return [new ValidationError(
      `The min length is ${value}: Got ${length}.`)]
    return []
  },
  multipleOf: (value, instance) => {
    if (!['number', 'integer'].includes(getType(instance))) return []
    const factor = Math.pow(10, 15)
    const remainder = (instance * factor) % (value * factor)
    if (remainder !== 0) return [new ValidationError(
      `Must be a multiple of ${value}: Got ${instance}.`)]
    return []
  },
  type: (value, instance) => {
    const values = [value].flat()
    if (values.includes('number') && [
      'number', 'integer'].includes(getType(instance))) return []
    if (!values.includes(getType(instance))) return [new ValidationError(
        `The type must be ${value}: Got ${getType(instance)}.`)]
    return []
  },
  pattern: (value, instance) => {
    if (getType(instance) !== 'string') return []
    if (!(new RegExp(value).test(instance))) return [
      new ValidationError(
        `The instance must match pattern ${value}: Got ${instance}.`)]
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
  prefixItems: (value, instance, validate) => {
    if (getType(instance) !== 'array') return []
    const errors = []
    const length = Math.min(value.length, instance.length) 
    for (let i = 0; i < length; i++) {
      errors.push(...validate(value[i], instance[i]))
    }
    return errors
  },
  uniqueItems: (value, instance) => {
    if (!value) return []
    const sortedObject = (item) => {
      if (item?.constructor !== Object) return item
      const sortedItem = {}
      for (const key of Object.keys(item).sort()) {
        sortedItem[key] = sortedObject(item[key])
      }
      return sortedItem
    }
    instance = instance.map(item => JSON.stringify(sortedObject(item)))
    const instanceSet = Array.from(new Set(instance))
    if (JSON.stringify(instance) !== JSON.stringify(instanceSet)) return [
      new ValidationError(`Items must be unique: Got ${instance}.`)
    ]
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
      `Only one of the schemas must be valid. Got ${numberOfNonErrors}.`)]
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
  items: (value, instance, validate, schema) => {
    if (getType(instance) !== 'array') return []
    const items = instance.slice(schema?.prefixItems?.length || 0)
    const errors = items.map(item => validate(value, item))
    return errors.flat()
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
  contains: (value, instance, validate) => {
    const errors = []
    if (getType(instance) !== 'array') return []
    for (const item of instance) {
      errors.push(validate(value, item))
    }
    const passing = errors.filter(collection => !collection.length)
    if (!passing.length) return [new ValidationError(
      `None of the items contain ${value}: Got ${instance}.`)]
    return []
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
  },
  $id: (value, _instance, _validate, schema) => {
    schemaDatabase.set(value, schema)
    return []
  },
  $ref: (value, instance, validate) => {
    const subSchema = reference(value)

    //console.log('RefValue', value, 'SubSchema::', subSchema, 'Instance::', instance)
    const errors = validate(subSchema, instance)

    return errors
  }
}
