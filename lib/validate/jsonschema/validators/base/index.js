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

export const reference = (fragment) => {
  const [baseUri] = sessionDatabase.get('base').slice(-1)
  const uri = new URL(fragment, baseUri)
  const schema = schemaDatabase.get(uri.toString())
  if (schema) return schema
  const [address, pointer] = uri.href.split('#')
  const document = schemaDatabase.get(address)
  return resolve(document, pointer)
}
