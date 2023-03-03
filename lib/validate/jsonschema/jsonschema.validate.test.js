import { tmpdir } from 'os'
import { join } from 'path'
import { execSync } from 'child_process'
import { readdirSync, readFileSync } from 'fs'
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
  'vocabulary.json',
]

describe('validateJsonSchema', () => {
  const tmp = tmpdir()
  const testSuite = 'JSON-Schema-Test-Suite' 
  if (process.env.JSONSCHEMA_SKIP_DOWNLOAD) {
    console.info('Json Schema Test Suite Download Skipped.')
  } else {
    const testSuiteRepository = (
      `https://github.com/json-schema-org/${testSuite}.git`)
    const downloadTestSuiteCommand = (
      `git -C ${testSuite} pull || git clone ${testSuiteRepository}`)
    execSync(downloadTestSuiteCommand, { stdio: [0, 1, 2], cwd: tmp })
  }

  const remotesFile = 'jsonschema_remotes.json'
  const remoteSchemasCommand = (
    `${testSuite}/bin/jsonschema_suite remotes > ${remotesFile}`)
  execSync(remoteSchemasCommand, { stdio: [0, 1, 2], cwd: tmp })
  const remotes = JSON.parse(readFileSync(join(tmp, remotesFile)))
  load(remotes)

  const testSuitePath = join(tmp, testSuite)
  const draftDirectory = join(testSuitePath, 'tests', 'draft2020-12')
  const totalTestFiles = readdirSync(draftDirectory).filter(
    file => file.endsWith('.json')) 
  const testFiles = totalTestFiles.filter(
    item => included.includes(item))
  console.info(
    `Including ${included.length} test files of ${totalTestFiles.length}.`)

  describe("JsonSchema Draft 2020-12", () => {
    describe.each(testFiles)('File: %s', (testFile) => {
      let testSuite = JSON.parse(
        readFileSync(join(draftDirectory, testFile)))

      describe.each(testSuite)('$description',
        ({ description, schema, tests  }) => {
          it.each(tests)('$description', ({ description, data, valid }) => {
            const result = validateJsonSchema(schema, data, false)
            expect(result).toEqual(valid)
          })
        })
    })
  })
})

describe('validateJsonSchema:strict', () => {
  it('raises an aggregate error in strict mode', () => {
    expect.assertions(1)
    const schema = { 'type': 'string' }
    const instance = 13
    try {
      validateJsonSchema(schema, instance)
    } catch (error) {
      console.log('ERROR:::', error)
      expect(error).toBeInstanceOf(AggregateError)
    }
  })
})
