/** @param {Object} schema
 * @param {Array[Object] | Object} instance
 * @return {Array[Object] | Object}
 * */
export function validateJsonSchema (schema, instance) {
  const types = [schema.type].flat()
  const primitives = {
    'integer': (value) => Number.isInteger(value),
    'number': (value) => value?.constructor === Number,
    'string': (value) => value?.constructor === String,
    'object': (value) => value?.constructor === Object,
    'array': (value) => value?.constructor === Array,
    'boolean': (value) => value?.constructor === Boolean,
    'null': (value) => value === null,
  }

  return types.some(type =>primitives[type](instance))
}
