import assert from 'node:assert/strict'
import { it } from 'node:test'
import { dirname, join } from 'path'
import { readdirSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { load } from './common/load.js'
import { validateJsonSchema } from './jsonschema.validate.js'

const included = [
  'additionalProperties.json',
  'allOf.json',
  'anchor.json',
  'anyOf.json',
  'boolean_schema.json',
  'const.json',
  'contains.json',
  'content.json',
  'default.json',
  'defs.json',
  'dependentRequired.json',
  'dependentSchemas.json',
  'dynamicRef.json',
  'enum.json',
  'exclusiveMaximum.json',
  'exclusiveMinimum.json',
  'format.json',
  'id.json',
  'if-then-else.json',
  'infinite-loop-detection.json',
  'items.json',
  'maxContains.json',
  'maxItems.json',
  'maxLength.json',
  'maxProperties.json',
  'maximum.json',
  'minContains.json',
  'minItems.json',
  'minLength.json',
  'minProperties.json',
  'minimum.json',
  'multipleOf.json',
  'not.json',
  'oneOf.json',
  'pattern.json',
  'patternProperties.json',
  'prefixItems.json',
  'properties.json',
  'propertyNames.json',
  'ref.json',
  'refRemote.json',
  'required.json',
  'type.json',
  'unevaluatedItems.json',
  'unevaluatedProperties.json',
  'uniqueItems.json',
  'unknownKeyword.json',
  'vocabulary.json'
]

const currentPath = dirname(fileURLToPath(import.meta.url))
const testsDirectory = join(currentPath, '__tests__')
const remotesFile = 'jsonschema_remotes.json'
const remotes = JSON.parse(readFileSync(join(testsDirectory, remotesFile)))
load(remotes)

const draftDirectory = join(testsDirectory, 'draft2020-12')
const totalTestFiles = readdirSync(draftDirectory).filter(
  file => file.endsWith('.json'))
const testFiles = totalTestFiles.filter(
  item => included.includes(item))

console.info(
  `Including ${included.length} test files of ${totalTestFiles.length}.`)

for (const testFile of testFiles) {
  const testSuite = JSON.parse(
    readFileSync(join(draftDirectory, testFile)))

  for (const suiteCase of testSuite) {
    const { description: suiteDescription, schema, tests } = suiteCase

    for (const testCase of tests) {
      const { description: testDescription, data, valid } = testCase
      const testName = [
        'validateJsonSchema',
        'draft2020-12',
        testFile,
        suiteDescription,
        testDescription
      ].join(' | ')

      it(testName, () => {
        const result = validateJsonSchema(schema, data, false)
        assert.strictEqual(result, valid)
      })
    }
  }
}

it('validateJsonSchema strict: raises an aggregate error in strict mode', () => {
  const schema = { type: 'string' }
  const instance = 13

  assert.throws(() => validateJsonSchema(schema, instance), AggregateError)
})
