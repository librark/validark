import { outdent } from './format.js'
import { stringify } from './stringify.js'

describe('validate', () => {
  it('stringifies simple json data', () => {
    const structure = {
      key: 'value'
    }

    const result = stringify(structure)

    expect(result).toEqual('{"key":"value"}')
  })
})

describe('validate:graphql', () => {
  it('stringifies simple json data', () => {
    const structure = {
      query: {
        hello: true,
        world: true
      }
    }

    const result = stringify(structure, 'graphql')

    expect(result).toEqual(outdent(`
      query {
        hello
        world
      }
    `).trim())
  })

  it('ignores the keys of falsy values', () => {
    const structure = {
      query: {
        hello: false,
        world: true
      }
    }

    const result = stringify(structure, 'gql')

    expect(result).toEqual(outdent(`
      query {
        world
      }
    `).trim())
  })

  it('stringifies deeply nested json data', () => {
    const structure = {
      query: {
        id: true,
        name: true,
        items: {
          price: true,
          category: {
            name: true,
            rank: true
          }
        }
      }
    }

    const result = stringify(structure, 'graphql')

    expect(result).toEqual(outdent(`
      query {
        id
        name
        items {
          price
          category {
            name
            rank
          }
        }
      }
    `).trim())
  })
})
