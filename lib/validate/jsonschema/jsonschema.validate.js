/** @param {Object} schema
 * @param {Array[Object] | Object} instance
 * @return {boolean}
 * */
export function validateJsonSchema (schema, instance) {
  if (schema?.constructor === Boolean) return schema

  const instanceType = getType(instance)
  const schemaTypes = [schema.type || []].flat()

  const primitives = ['integer', 'number', 'string', 'boolean', 'null']
  if (primitives.includes(instanceType) && !schema.properties) {
    if (instanceType === 'integer' && schemaTypes.includes('number')) {
      schemaTypes.push('integer')
    }
    return schemaTypes.includes(instanceType)
  }

  if (schemaTypes.length && !schemaTypes.includes(instanceType)) return false

  if (['array', ...primitives].includes(instanceType)) return true

  const results = []
  const properties = schema?.properties || {}
  
  if (!Object.keys(instance).some(key => Object.keys(
    properties).includes(key))) {
    return true
  }

  for (const [property, subSchema] of Object.entries(properties)) {
    const value = instance[property]
    if (value === undefined) continue
    results.push(validateJsonSchema(subSchema, instance[property]))
  }

  const additionalProperties = schema?.additionalProperties || {}
  for (const [property, subSchema] of Object.entries(additionalProperties)) {
    const value = instance[property]
    if (value === undefined) continue
    results.push(validateJsonSchema(subSchema, instance[property]))
  }

  return results.every(Boolean)
}

const getType = (instance) => {
  if (instance?.constructor === String) return 'string'
  if (Number.isInteger(instance)) return 'integer'
  if (instance?.constructor === Number) return 'number'
  if (instance?.constructor === Boolean) return 'boolean'
  if (instance?.constructor === Array) return 'array'
  if (instance?.constructor === Object) return 'object'
  if (instance === null) return 'null'
}
