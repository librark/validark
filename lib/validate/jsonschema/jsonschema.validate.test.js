import { tmpdir } from 'os'
import { join } from 'path'
import { readdirSync, readFileSync } from 'fs'
import { execSync } from 'child_process'
import { validateJsonSchema } from './jsonschema.validate.js'

const included = [
  'additionalProperties.json',
  'boolean_schema.json',
  'maxItems.json',
  'maximum.json',
  'minItems.json',
  'minimum.json',
  'pattern.json',
  'patternProperties.json',
  'properties.json',
  'type.json',
]

describe('validateJsonSchema', () => {
  const tmp = tmpdir()
  const testSuite = 'JSON-Schema-Test-Suite' 
  const testSuiteRepository = (
    `https://github.com/json-schema-org/${testSuite}.git`)
  const exec = `git -C ${testSuite} pull || git clone ${testSuiteRepository}`
  //execSync(exec, { stdio: [0, 1, 2], cwd: tmp })

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
            const result = validateJsonSchema(schema, data)
            expect(result).toEqual(valid)
          })
        })
    })
  })

})
