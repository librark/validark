export default {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://json-schema.org/draft/2020-12/output/schema',
  description: 'A schema that validates the minimum requirements for validation output',

  anyOf: [
    { $ref: '#/$defs/flag' },
    { $ref: '#/$defs/basic' },
    { $ref: '#/$defs/detailed' },
    { $ref: '#/$defs/verbose' }
  ],
  $defs: {
    outputUnit: {
      properties: {
        valid: { type: 'boolean' },
        keywordLocation: {
          type: 'string',
          format: 'json-pointer'
        },
        absoluteKeywordLocation: {
          type: 'string',
          format: 'uri'
        },
        instanceLocation: {
          type: 'string',
          format: 'json-pointer'
        },
        error: {
          type: 'string'
        },
        errors: {
          $ref: '#/$defs/outputUnitArray'
        },
        annotations: {
          $ref: '#/$defs/outputUnitArray'
        }
      },
      required: ['valid', 'keywordLocation', 'instanceLocation'],
      allOf: [
        {
          if: {
            properties: {
              valid: { const: false }
            }
          },
          then: {
            anyOf: [
              {
                required: ['error']
              },
              {
                required: ['errors']
              }
            ]
          }
        },
        {
          if: {
            anyOf: [
              {
                properties: {
                  keywordLocation: {
                    pattern: '/\\$ref/'
                  }
                }
              },
              {
                properties: {
                  keywordLocation: {
                    pattern: '/\\$dynamicRef/'
                  }
                }
              }
            ]
          },
          then: {
            required: ['absoluteKeywordLocation']
          }
        }
      ]
    },
    outputUnitArray: {
      type: 'array',
      items: { $ref: '#/$defs/outputUnit' }
    },
    flag: {
      properties: {
        valid: { type: 'boolean' }
      },
      required: ['valid']
    },
    basic: { $ref: '#/$defs/outputUnit' },
    detailed: { $ref: '#/$defs/outputUnit' },
    verbose: { $ref: '#/$defs/outputUnit' }
  }
}
