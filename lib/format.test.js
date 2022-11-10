import { dedent, outdent } from './format.js'

describe('dedent', () => {
  it('can dedent a certain text', () => {
    const text = `Hi,
    this text has a nice indentation
    because we defined a dedent function.`

    const expected = (
      'Hi,\n' +
      'this text has a nice indentation\n' +
      'because we defined a dedent function.')

    const result = dedent(text)

    expect(result).toBe(expected)
  })
})

describe('outdent', () => {
  it('can outdent a certain text', () => {
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

    expect(result).toBe(expected)
  })
})
