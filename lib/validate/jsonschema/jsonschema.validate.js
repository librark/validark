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

  const schemaProperties = schema?.properties || {}
  
  const schemaPropertyKeys = Object.keys(schemaProperties) 
  const instancePropertyKeys = Object.keys(instance) 

  const intersectionProperties = schemaPropertyKeys.filter(
    key => instancePropertyKeys.includes(key))

  if (!intersectionProperties.length && !schema.additionalProperties) {
    return true
  }

  const results = []
  for (const key of intersectionProperties) {
    results.push(validateJsonSchema(schemaProperties[key], instance[key]))
  }

  const differenceProperties = instancePropertyKeys.filter(
    key => !schemaPropertyKeys.includes(key))

  const additionalProperties = schema?.additionalProperties || {}
  for (const key of differenceProperties) {
    results.push(validateJsonSchema(additionalProperties, instance[key]))
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
