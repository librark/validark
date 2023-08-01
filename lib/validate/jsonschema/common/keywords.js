import specMap from './spec/index.js'

const defaultSchema = 'https://json-schema.org/draft/2020-12/schema'

export const keywords = (schemaUri) => {
  if (!(schemaUri in specMap)) {
    schemaUri = defaultSchema
  }

  const metaSchemas = specMap[schemaUri]

  const keywords = new Set([''])
  for (const metaSchema of metaSchemas) {
    Object.keys(metaSchema.properties || {}).forEach(
      property => keywords.add(property))
  }

  return Array.from(keywords)
}
