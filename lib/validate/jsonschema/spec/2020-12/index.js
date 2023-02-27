import hyperSchema from './hyper-schema.js'
import links from './links.js'
import schema from './schema.js'
import meta from './meta/index.js'
import output from './output/index.js'

export default [
    ...meta,
    ...output,
    hyperSchema,
    links,
    schema
]
