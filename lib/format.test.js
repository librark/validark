import assert from 'node:assert/strict'
import { it } from 'node:test'
import { format, dedent, outdent } from './format.js'

it('format: can format a template string with the given variables', () => {
  const template = '${this.city} is the capital of ${this.country}'
  const variables = { city: 'Bogota', country: 'Colombia' }

  const result = format(template, variables)

  assert.strictEqual(result, 'Bogota is the capital of Colombia')
})

it('dedent: can dedent a certain text', () => {
  const text = `Hi,
    this text has a nice indentation
    because we defined a dedent function.`

  const expected = (
    'Hi,\n' +
    'this text has a nice indentation\n' +
    'because we defined a dedent function.')

  const result = dedent(text)

  assert.strictEqual(result, expected)
})

it('outdent: can outdent a certain text', () => {
  const text = `
      query {
        items {
          id
          name
          price
        }
      }
    `
  const expected = (
    '\n' +
    'query {\n' +
    '  items {\n' +
    '    id\n' +
    '    name\n' +
    '    price\n' +
    '  }\n' +
    '}\n' +
    ''
  )

  const result = outdent(text)

  assert.strictEqual(result, expected)
})
