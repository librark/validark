export default {
  $schema: 'https://json-schema.org/draft/2020-12/hyper-schema',
  $id: 'https://json-schema.org/draft/2020-12/hyper-schema',
  $vocabulary: {
    'https://json-schema.org/draft/2020-12/vocab/core': true,
    'https://json-schema.org/draft/2020-12/vocab/applicator': true,
    'https://json-schema.org/draft/2020-12/vocab/unevaluated': true,
    'https://json-schema.org/draft/2020-12/vocab/validation': true,
    'https://json-schema.org/draft/2020-12/vocab/meta-data': true,
    'https://json-schema.org/draft/2020-12/vocab/format-annotation': true,
    'https://json-schema.org/draft/2020-12/vocab/content': true,
    'https://json-schema.org/draft/2019-09/vocab/hyper-schema': true
  },
  $dynamicAnchor: 'meta',

  title: 'JSON Hyper-Schema',
  allOf: [
    { $ref: 'https://json-schema.org/draft/2020-12/schema' },
    { $ref: 'https://json-schema.org/draft/2020-12/meta/hyper-schema' }
  ],
  links: [
    {
      rel: 'self',
      href: '{+%24id}'
    }
  ]
}
