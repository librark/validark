import { tmpdir } from 'os'
import { join } from 'path'
import { readdirSync, readFileSync } from 'fs'
import { execSync } from 'child_process'
import { validateJsonSchema, loadSchemas } from './jsonschema.validate.js'

const included = [
  'additionalProperties.json',
  'allOf.json',
  'anyOf.json',
  'boolean_schema.json',
  'const.json',
  'contains.json',
  'enum.json',
  'exclusiveMaximum.json',
  'exclusiveMinimum.json',
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
  //'not.json',
  'oneOf.json',
  'pattern.json',
  'patternProperties.json',
  'prefixItems.json',
  'properties.json',
  'required.json',
  'type.json',
  //'unevaluatedProperties.json',
  'uniqueItems.json',
  //'defs.json',
  //'id.json',
  //'ref.json',
]

function recurse (directory) {
  const read = (path) => {
    const directories = readdirSync(path, { withFileTypes: true })
    return directories.map(item => {
      const entry = join(path, item.name)
      return item.isDirectory() ? read(entry) : entry
    })
  }
  return read(directory).flat(Number.POSITIVE_INFINITY)
}

describe('validateJsonSchema', () => {
  const tmp = tmpdir()
  const testSuite = 'JSON-Schema-Test-Suite' 
  const spec = 'json-schema-spec'
  const draft = '2020-12'
  if (process.env.JSONSCHEMA_SKIP_DOWNLOAD) {
    console.info('Json Schema Test Suite Download Skipped.')
  } else {
    const testSuiteRepository = (
      `https://github.com/json-schema-org/${testSuite}.git`)
    const downloadTestSuiteCommand = (
      `git -C ${testSuite} pull || git clone ${testSuiteRepository}`)
    execSync(downloadTestSuiteCommand, { stdio: [0, 1, 2], cwd: tmp })
    const specRepository = (
      'https://github.com/json-schema-org/json-schema-spec.git')
    const downloadSpecCommand = (
      `git -C ${spec} pull || git clone ${specRepository}`)
    execSync(downloadSpecCommand, { stdio: [0, 1, 2], cwd: tmp })
    const switchBranchCommand = (
      `git -C ${spec} switch ${draft}`)
    execSync(switchBranchCommand, { stdio: [0, 1, 2], cwd: tmp })
  }
  const specSchemas = {}
  const files = recurse(join(tmp, spec)).filter(
    file => file.endsWith('.json'))
  for (const file of files) {
    const schema = JSON.parse(readFileSync(file))
    specSchemas[schema.$id] = schema
  }
  loadSchemas(specSchemas)

  const remotesFile = 'jsonschema_remotes.json'
  const remoteSchemasCommand = (
    `${testSuite}/bin/jsonschema_suite remotes > ${remotesFile}`)
  execSync(remoteSchemasCommand, { stdio: [0, 1, 2], cwd: tmp })
  const remotes = JSON.parse(readFileSync(join(tmp, remotesFile)))
  loadSchemas(remotes)

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
      const testSuite = JSON.parse(
        readFileSync(join(draftDirectory, testFile)))

      describe.each(testSuite)('$description',
        ({ description, schema, tests  }) => {
          it.each(tests)('$description', ({ description, data, valid }) => {
              //const section = 'minContains = 0 makes contains always pass'
              //if (section === description) {
                //console.log('>>>', description, schema, data, valid)
              //}
              const result = validateJsonSchema(schema, data)
              expect(result).toEqual(valid)
          })
        })
    })
  })

})
