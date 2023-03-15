import { sessionDatabase, schemaDatabase } from '../../common/database.js'

export const getType = (instance) => {
  if (instance?.constructor === String) return 'string'
  if (Number.isInteger(instance)) return 'integer'
  if (instance?.constructor === Number) return 'number'
  if (instance?.constructor === Boolean) return 'boolean'
  if (instance?.constructor === Array) return 'array'
  if (instance === null) return 'null'
  return 'object'
}

export const resolve = (document, pointer) => {
  let value = document
  const tokens = pointer.split('/').filter(Boolean)
  for (let token of tokens) {
    token = decodeURIComponent(
      token.replaceAll('~1', '/').replaceAll('~0', '~'))
    value = value[token]
  }
  return value
}

export const reference = (fragment, baseUri) => {
  const uri = new URL(fragment, baseUri)
  const [address, pointer] = uri.href.split('#')

  const schema = schemaDatabase.get(uri.toString())
  if (schema) return schema

  const document = schemaDatabase.get(address)
  return resolve(document, pointer)
}

export const dynamicReference = (fragment) => {
  let schema = undefined
  const scope = sessionDatabase.get('base').slice().reverse()
  for (let [index, baseUri] of scope.entries()) {
    const uri = new URL(fragment, baseUri)
    if (fragment.startsWith('#/')) return reference(fragment, baseUri)
    const currentSchema = schemaDatabase.get(uri.toString())
    if (currentSchema) {
      if (fragment.endsWith(currentSchema.$dynamicAnchor)) {
        schema = currentSchema
        fragment = uri.hash
        continue
      } else if (index === 0 && fragment.endsWith(currentSchema.$anchor)) {
        schema = currentSchema
        break
      }
    }
  }
  return schema
}

export const evaluateProperty = (property) => {
  for (const set of sessionDatabase.get('evaluatedProperties')) {
    set.add(property)
  }
}

export const resetProperties = (properties=new Set()) => {
  sessionDatabase.get('evaluatedProperties').pop()
  sessionDatabase.get('evaluatedProperties').push(properties)
}

export const cloneProperties = () => {
  return new Set(...sessionDatabase.get('evaluatedProperties').slice(-1))
}

export const evaluateItem = (item, index) => {
  for (const array of sessionDatabase.get('evaluatedItems')) {
    array[index] = item
  }
}

export const resetItems = (items=[]) => {
  sessionDatabase.get('evaluatedItems').pop()
  sessionDatabase.get('evaluatedItems').push(items)
}
