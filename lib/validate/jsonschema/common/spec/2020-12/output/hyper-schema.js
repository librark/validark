export default {
  $schema: 'https://json-schema.org/draft/2019-09/schema',
  $id: 'https://json-schema.org/draft/2019-09/output/hyper-schema',
  title: 'JSON Hyper-Schema Output',
  type: 'array',
  items: {
    allOf: [
      { $ref: 'https://json-schema.org/draft/2019-09/links#/$defs/noRequiredFields' }
    ],
    type: 'object',
    required: [
      'contextUri',
      'contextPointer',
      'rel',
      'attachmentPointer'
    ],
    if: { required: ['hrefSchema'] },
    then: { required: ['hrefInputTemplates', 'hrefPrepopulatedInput'] },
    else: { required: ['targetUri'] },
    properties: {
      contextUri: {
        $comment: 'The fully resolved URI of the link context, including a fragment if it is possible to construct one for the given media type and instance',
        type: 'string',
        format: 'uri'
      },
      contextPointer: {
        $comment: 'The absolute JSON Pointer to the location in the instance that is the context of the link.  If the context resource supports JSON Pointer fragments, this will the string form of the identical JSON Pointer',
        type: 'string',
        format: 'json-pointer'
      },
      rel: {
        type: 'string'
      },
      targetUri: {
        $comment: 'The fully resolved target URI',
        type: 'string',
        format: 'uri'
      },
      hrefInputTemplates: {
        $comment: 'The list of partially resolved URI Templates, starting with "href", followed by applicable "base" values from nearest to furthest.',
        type: 'array',
        items: {
          type: 'string',
          format: 'uri-template'
        }
      },
      hrefPrepopulatedInput: {
        $comment: 'The initial data set to be presented with the input form when URI Template input is accepted.',
        type: 'object',
        propertyNames: {
          $comment: "These are all URI Template variable names, specifically the 'varname' production from RFC 6570, Section 2.3",
          pattern: '^(?:\\w|(?:%[a-f\\d]{2}))+(?:\\.(?:\\w|(?:%[a-f\\d]{2})))*$'
        }
      },
      attachmentPointer: {
        $comment: 'The absolute JSON Pointer, in string form, of the position to which this resolved link applies',
        type: 'string',
        format: 'json-pointer'
      }
    }
  }
}
