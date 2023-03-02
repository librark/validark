import { sessionDatabase } from '../../common/database.js'
import { ValidationError } from '../../common/errors.js'
import {
  evaluateProperty, resetProperties, cloneProperties,
  evaluateItem, resetItems, cloneItems,
  getType, 
} from '../base/index.js'

export default {
  prefixItems: (value, instance, validate) => {
    if (getType(instance) !== 'array') return []
    const errors = []
    const length = Math.min(value.length, instance.length) 
    for (let i = 0; i < length; i++) {
      errors.push(...validate(value[i], instance[i]))
    }
    if (!errors.length) {
      const [evaluatedItems] = cloneItems()
      if (length > evaluatedItems.length) resetItems(
        [...Array(length).keys()].map(index => instance[index]))
    }
    return errors
  },
  items: (value, instance, validate, schema) => {
    if (getType(instance) !== 'array') return []
    const items = instance.slice(schema?.prefixItems?.length || 0)
    const errors = []
    for (const item of items) {
      errors.push(...validate(value, item))
    }
    if (!errors.length) items.forEach(item => evaluateItem(item))

    return errors
  },
  contains: (value, instance, validate, schema) => {
    const errors = []
    if (getType(instance) !== 'array') return []
    for (const item of instance) {
      const subErrors = validate(value, item)
      if (!subErrors.length) evaluateItem(item)
      errors.push(subErrors)
    }
    //if (!errors.length) instance.forEach(item => evaluateItem(item))

    const passing = errors.filter(collection => !collection.length)
    if (passing.length > (schema.maxContains || Infinity)) return [
      new ValidationError(`At most ${schema.maxContains} items must ` +
      `contain ${value}: Got ${passing.length}`)]
    if (passing.length < (schema.minContains || 0)) return [
      new ValidationError(`At least ${schema.maxContains} items must ` +
      `contain ${value}: Got ${passing.length}`)]
    if (schema.minContains === 0) return []
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
    for (const property of differenceProperties) {
      const subErrors = validate(value, instance[property])
      if (!subErrors.length) evaluateProperty(property)
      errors.push(...subErrors)
    }
    return errors
  },
  properties: (value, instance, validate) => {
    const errors = []
    if (getType(instance) !== 'object') return []
    const ownProperties = Object.getOwnPropertyNames(instance)
    for (const [property, subSchema] of Object.entries(value)) {
      if (!ownProperties.includes(property)) continue
      const subErrors = validate(subSchema, instance[property])
      if (!subErrors.length) evaluateProperty(property)
      errors.push(...subErrors)
    }
    return errors
  },
  patternProperties: (value, instance, validate) => {
    const errors = []
    for (const [pattern, subSchema] of Object.entries(value)) {
      const matchedProperties = Object.keys(instance).filter(
        key => new RegExp(pattern).test(key))
      for (const property of matchedProperties) {
        const subErrors = validate(subSchema, instance[property])
        if (!subErrors.length) evaluateProperty(property)
        errors.push(...subErrors)
      }
    }
    return errors
  },
  dependentSchemas: (value, instance, validate) => {
    if (getType(instance) !== 'object') return []
    const errors = []
    for (const [property, subSchema] of Object.entries(value)) {
      if (Object.keys(instance).includes(property)) {
        errors.push(...validate(subSchema, instance))
      }
    }
    return errors
  },
  propertyNames: (value, instance, validate) => {
    if (getType(instance) !== 'object') return []
    const errors = []
    errors.push(Object.keys(instance).map(
      property => validate(value, property)))
    return errors.flat(Infinity)
  },
  if: (value, instance, validate, schema) => {
    const errors = validate(value, instance)
    if (!errors.length && schema.then) {
      return validate(schema.then, instance)
    }
    if (errors.length && schema.else) {
      return validate(schema.else, instance)
    }
    return []
  },
  allOf: (value, instance, validate) => {
    const errors = []
    for (const subSchema of value) {
      errors.push(validate(subSchema, instance))
    }
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
  oneOf: (value, instance, validate) => {
    const errors = []
    for (const subSchema of value) {
      const evaluatedPropertiesBackup = new Set(
        ...sessionDatabase.get('evaluatedProperties').slice(-1))
      const subErrors = validate(subSchema, instance)
      if (subErrors.length) {
        sessionDatabase.get('evaluatedProperties').pop()
        sessionDatabase.get('evaluatedProperties').push(
          evaluatedPropertiesBackup)
      }
      errors.push(subErrors)
    }
    const errorNumbers = errors.map(collection => collection.length)
    const numberOfNonErrors = errorNumbers.filter(
      number => number === 0).length
    if (numberOfNonErrors === 1) return []
    if (numberOfNonErrors > 1) return [new ValidationError(
      `Only one of the schemas must be valid. Got ${numberOfNonErrors}.`)]
    return errors.flat()
  },
  not: (value, instance, validate) => {
    const evaluatedPropertiesBackup = new Set(
      ...sessionDatabase.get('evaluatedProperties').slice(-1))
    const evaluatedItemsBackup = new Array(
      ...sessionDatabase.get('evaluatedItems').slice(-1))
    const errors = validate(value, instance) 
    if (!errors.length) return [new ValidationError(
      `The instance ${instance} must not validate to schema ${value}.`)]
    resetItems()
    sessionDatabase.get('evaluatedProperties').pop()
    sessionDatabase.get('evaluatedProperties').push(evaluatedPropertiesBackup)
    return []
  }
}
