export default {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://json-schema.org/draft/2020-12/links',
  title: 'Link Description Object',

  type: 'object',
  properties: {
    anchor: {
      type: 'string',
      format: 'uri-template'
    },
    anchorPointer: {
      type: 'string',
      anyOf: [
        { format: 'json-pointer' },
        { format: 'relative-json-pointer' }
      ]
    },
    rel: {
      anyOf: [
        { type: 'string' },
        {
          type: 'array',
          items: { type: 'string' },
          minItems: 1
        }
      ]
    },
    href: {
      type: 'string',
      format: 'uri-template'
    },
    hrefSchema: {
      $dynamicRef: 'https://json-schema.org/draft/2020-12/hyper-schema#meta',
      default: false
    },
    templatePointers: {
      type: 'object',
      additionalProperties: {
        type: 'string',
        anyOf: [
          { format: 'json-pointer' },
          { format: 'relative-json-pointer' }
        ]
      }
    },
    templateRequired: {
      type: 'array',
      items: {
        type: 'string'
      },
      uniqueItems: true
    },
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    targetSchema: {
      $dynamicRef: 'https://json-schema.org/draft/2020-12/hyper-schema#meta',
      default: true
    },
    targetMediaType: {
      type: 'string'
    },
    targetHints: {},
    headerSchema: {
      $dynamicRef: 'https://json-schema.org/draft/2020-12/hyper-schema#meta',
      default: true
    },
    submissionMediaType: {
      type: 'string',
      default: 'application/json'
    },
    submissionSchema: {
      $dynamicRef: 'https://json-schema.org/draft/2020-12/hyper-schema#meta',
      default: true
    },
    $comment: {
      type: 'string'
    }
  },
  required: ['rel', 'href']
}
