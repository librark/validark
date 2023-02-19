import { tmpdir } from 'os'
import { join } from 'path'
import { readdirSync, readFileSync } from 'fs'
import { execSync } from 'child_process'
import { validateJsonSchema } from './jsonschema.validate.js'

const included = [
  'additionalProperties.json',
  'allOf.json',
  'anyOf.json',
  'boolean_schema.json',
  'maxItems.json',
  'maxLength.json',
  'maximum.json',
  'minItems.json',
  'minLength.json',
  'minimum.json',
  'multipleOf.json',
  'oneOf.json',
  'pattern.json',
  'patternProperties.json',
  'properties.json',
  'required.json',
  'type.json',
]

describe('validateJsonSchema', () => {
  const tmp = tmpdir()
  const testSuite = 'JSON-Schema-Test-Suite' 
  const testSuiteRepository = (
    `https://github.com/json-schema-org/${testSuite}.git`)
  const exec = `git -C ${testSuite} pull || git clone ${testSuiteRepository}`
  if (process.env.SKIP_JSONSCHEMA_TESTSUITE_DOWNLOAD) {
    console.info('Json Schema Test Suite Download Skipped.')
  } else {
    execSync(exec, { stdio: [0, 1, 2], cwd: tmp })
  }

  const testSuitePath = join(tmp, testSuite)
  const draftDirectory = join(testSuitePath, 'tests', 'draft2020-12')
  const totalTestFiles = readdirSync(draftDirectory).filter(
    file => file.endsWith('.json')) 
  const testFiles = totalTestFiles.filter(
    item => included.includes(item))

  describe("JsonSchema Draft 2020-12", () => {
    describe.each(testFiles)('File: %s', (testFile) => {
      const testSuite = JSON.parse(
        readFileSync(join(draftDirectory, testFile)))

      describe.each(testSuite)('$description',
        ({ description, schema, tests  }) => {
          it.each(tests)('$description', ({ description, data, valid }) => {
            const section = "0.0075 is multiple of 0.0001"
            const result = validateJsonSchema(schema, data)
            expect(result).toEqual(valid)
          })
        })
    })
  })

})
