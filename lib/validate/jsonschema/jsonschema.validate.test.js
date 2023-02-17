import { tmpdir } from 'os'
import { join } from 'path'
import { readdirSync, readFileSync } from 'fs'
import { execSync } from 'child_process'
import { validateJsonSchema } from './jsonschema.validate.js'


describe('validateJsonSchema', () => {
  let testSuitePath = '' 

  beforeAll(() => {
    const tmp = tmpdir()
    const testSuite = 'JSON-Schema-Test-Suite' 
    const testSuiteRepository = (
      `https://github.com/json-schema-org/${testSuite}.git`)
    execSync(`git -C ${testSuite} pull || git clone ${testSuiteRepository}`, {
      stdio: [0, 1, 2], cwd: tmp
    })
    testSuitePath = join(tmp, testSuite)
  })


  it('defines a validateJsonSchema function', async () => {
    expect(validateJsonSchema).toBeTruthy()
  })

  it('conforms to draft "draft2020-12" test suite', () => {
    const draftDirectory = join(testSuitePath, 'tests', 'draft2020-12')
    const totalTestFiles = readdirSync(draftDirectory).filter(
      file => file.endsWith('.json')) 
    const included = ['type.json']
    const testFiles = totalTestFiles.filter(
      item => included.includes(item))

    for (const testFile of testFiles) {
      console.info('#'.repeat(2), 'TEST_FILE:', testFile)
      const testSuite = JSON.parse(
        readFileSync(join(draftDirectory, testFile)))

      for (const testCase of testSuite) {
        console.info('*'.repeat(4), 'TEST_CASE:', testCase.description)
        const schema = testCase.schema

        for (const testInstance of testCase.tests) {
          console.info('>'.repeat(8), 'TEST:', testInstance.description)
          const result = validateJsonSchema(schema, testInstance.data)
          expect(testInstance.valid).toEqual(result)
        }
      }
    }
  })
})
