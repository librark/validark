import { sessionDatabase } from '../../common/index.js'
import { getType, evaluateProperty } from '../base/index.js'

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
  }
}
