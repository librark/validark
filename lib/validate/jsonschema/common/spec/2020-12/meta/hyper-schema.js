export default {
  $schema: 'https://json-schema.org/draft/2020-12/hyper-schema',
  $id: 'https://json-schema.org/draft/2020-12/meta/hyper-schema',
  $vocabulary: {
    'https://json-schema.org/draft/2019-09/vocab/hyper-schema': true
  },
  $dynamicAnchor: 'meta',

  title: 'JSON Hyper-Schema Vocabulary Schema',
  type: ['object', 'boolean'],
  properties: {
    base: {
      type: 'string',
      format: 'uri-template'
    },
    links: {
      type: 'array',
      items: {
        $ref: 'https://json-schema.org/draft/2020-12/links'
      }
    }
  },
  links: [
    {
      rel: 'self',
      href: '{+%24id}'
    }
  ]
}
