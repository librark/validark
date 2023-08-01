import { ValidationError } from '../../common/errors.js'
import { getType } from '../base/index.js'

export default {
  type: (value, instance) => {
    const values = [value].flat()
    if (values.includes('number') && [
      'number', 'integer'].includes(getType(instance))) return []
    if (!values.includes(getType(instance))) {
      return [new ValidationError(
        `The type must be ${value}: Got ${getType(instance)}.`)]
    }
    return []
  },
  const: (value, instance) => {
    if (value?.constructor === Object && instance?.constructor === Object) {
      instance = Object.fromEntries(Object.keys(value).map(
        key => [key, instance[key]]))
    }
    if (JSON.stringify(value) !== JSON.stringify(instance)) {
      return [
        new ValidationError(
        `The value must be the constant ${value}: Got ${instance}.`)]
    }
    return []
  },
  enum: (value, instance) => {
    if (!value.map(item => JSON.stringify(item)).includes(
      JSON.stringify(instance))) {
      return [new ValidationError(
      `The value must be included in enum ${value}: Got ${instance}.`)]
    }
    return []
  },
  multipleOf: (value, instance) => {
    if (!['number', 'integer'].includes(getType(instance))) return []
    let pow = 0
    if (!Number.isInteger(value)) {
      pow = (
        value.toFixed(20).replace(/\.?0+$/, '').split('.').pop().length)
    }
    if (!Number.isInteger(instance)) {
      pow = Math.min(
        pow, instance.toFixed(20).replace(/\.?0+$/, '').split('.').pop().length)
    }
    const factor = Math.pow(10, pow)
    const remainder = (instance * factor) % (value * factor)
    if (remainder !== 0) {
      return [new ValidationError(
      `Must be a multiple of ${value}: Got ${instance}.`)]
    }
    return []
  },
  maximum: (value, instance) => {
    if (!['integer', 'number'].includes(getType(instance))) return []
    if (instance > value) {
      return [new ValidationError(
        `The maximum value must be ${value}: Got ${instance}.`)]
    }
    return []
  },
  exclusiveMaximum: (value, instance) => {
    if (!['integer', 'number'].includes(getType(instance))) return []
    if (instance >= value) {
      return [new ValidationError(
        `The maximum value must be lower than ${value}: Got ${instance}.`)]
    }
    return []
  },
  minimum: (value, instance) => {
    if (!['integer', 'number'].includes(getType(instance))) return []
    if (instance < value) {
      return [new ValidationError(
        `The minimum value must be ${value}: Got ${instance}.`)]
    }
    return []
  },
  exclusiveMinimum: (value, instance) => {
    if (!['integer', 'number'].includes(getType(instance))) return []
    if (instance <= value) {
      return [new ValidationError(
        `The minimum value must be higher than ${value}: Got ${instance}.`)]
    }
    return []
  },
  maxLength: (value, instance) => {
    if (getType(instance) !== 'string') return []
    const length = [...instance].length
    if (length > value) {
      return [new ValidationError(
      `The max length is ${value}: Got ${length}.`)]
    }
    return []
  },
  minLength: (value, instance) => {
    if (getType(instance) !== 'string') return []
    const length = [...instance].length
    if (length < value) {
      return [new ValidationError(
      `The min length is ${value}: Got ${length}.`)]
    }
    return []
  },
  pattern: (value, instance) => {
    if (getType(instance) !== 'string') return []
    if (!(new RegExp(value).test(instance))) {
      return [
        new ValidationError(
        `The instance must match pattern ${value}: Got ${instance}.`)]
    }
    return []
  },
  maxItems: (value, instance) => {
    if (!['array'].includes(getType(instance))) return []
    if (instance.length > value) {
      return [new ValidationError(
        `The maximum length must be ${value}: Got ${instance.length}.`)]
    }
    return []
  },
  minItems: (value, instance) => {
    if (!['array'].includes(getType(instance))) return []
    if (instance.length < value) {
      return [new ValidationError(
        `The minimum length must be ${value}: Got ${instance.length}.`)]
    }
    return []
  },
  uniqueItems: (value, instance) => {
    if (!['array'].includes(getType(instance))) return []
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
    if (JSON.stringify(instance) !== JSON.stringify(instanceSet)) {
      return [
        new ValidationError(`Items must be unique: Got ${instance}.`)
      ]
    }
    return []
  },

  maxProperties: (value, instance) => {
    if (getType(instance) !== 'object') return []
    const numberOfProperties = Object.keys(instance).length
    if (numberOfProperties > value) {
      return [new ValidationError(
      `The maximum number of properties is ${value}: ` +
      `Got ${numberOfProperties}`)]
    }
    return []
  },
  minProperties: (value, instance) => {
    if (getType(instance) !== 'object') return []
    const numberOfProperties = Object.keys(instance).length
    if (numberOfProperties < value) {
      return [new ValidationError(
      `The minimum number of properties is ${value}: ` +
      `Got ${numberOfProperties}`)]
    }
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
  dependentRequired: (value, instance) => {
    if (getType(instance) !== 'object') return []
    const errors = []
    for (const property of Object.keys(value)) {
      if (!Object.keys(instance).includes(property)) continue

      for (const dependent of value[property]) {
        if (!Object.keys(instance).includes(dependent)) {
          errors.push(new ValidationError(
            `Property ${property} depends on ${dependent} but it is missing.`))
        }
      }
    }
    return errors
  }
}
