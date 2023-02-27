import { schemaDatabase } from './database.js'
import { validators } from './validators.js'

/** @param {Object|Array} schemasObject @return {void} */
export function loadSchemas (schemasObject) {
  if (Array.isArray(schemasObject)) {
    schemasObject = Object.fromEntries(
      schemasObject.map(schema => [schema.$id, schema]))
  }

  const knownKeywords = ['', '$defs', ...Object.keys(validators)]
  const scan = (schema, baseUri, key='') => {
    if (schema.$id) {
      const uri = new URL(schema.$id, baseUri)
      schemaDatabase.set(uri.toString(), schema)
      baseUri = uri.toString()
    }

    const anchors = ['$anchor', '$dynamicAnchor'].map(
      key => schema[key]).filter(Boolean).filter(
        anchor => anchor.constructor === String)
    for (const anchor of anchors) {
      const uri = new URL(baseUri)
      uri.hash = anchor
      if (schemaDatabase.has(uri.toString())) continue
      schemaDatabase.set(uri.toString(), schema)
    }

    for (const [property, value] of Object.entries(schema)) {
      if (property === 'enum') continue
      if (key !== '$defs' && !knownKeywords.includes(property)) continue
      if (![Object, Array].includes(value?.constructor)) continue
      const subSchemas = [value].flat()
      for (const subSchema of subSchemas) {
        scan(subSchema, baseUri, property)
      }
    }
  }

  for (const [uri, schema] of Object.entries(schemasObject)) {
    schemaDatabase.set(uri, schema)
    scan(schema, uri)
  }
}
