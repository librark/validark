import { sessionDatabase } from '../../common/index.js'
import { getType, evaluateProperty, evaluateItem } from '../base/index.js'

export default {
  unevaluatedProperties: (value, instance, validate) => {
    if (getType(instance) !== 'object') return []

    const errors = []
    const [evaluated] = sessionDatabase.get('evaluatedProperties').slice(-1)

    const unevaluated = Object.keys(instance).filter(
      property => !evaluated.has(property))
    for (const property of unevaluated) {
      errors.push(...validate(value, instance[property]))
      evaluateProperty(property)
    }

    return errors
  },
  unevaluatedItems: (value, instance, validate) => {
    if (getType(instance) !== 'array') return []

    const errors = []
    const [evaluated] = sessionDatabase.get('evaluatedItems').slice(-1)

    for (const [index, item] of instance.entries()) {
      if (item === evaluated[index]) continue
      errors.push(...validate(value, item))
      evaluateItem(item, index)
    }

    return errors
  }
}
