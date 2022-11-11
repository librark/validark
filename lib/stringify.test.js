import { outdent } from './format.js'
import { stringify } from './stringify.js'

describe('validate', () => {
  it('converts to a string any data', () => {
    const structure = {
      key: 'value'
    }

    const result = stringify(structure)

    expect(result).toEqual('[object Object]')
  })

  it('stringifies simple json data', () => {
    const structure = {
      key: 'value'
    }

    const result = stringify(structure, 'json')

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

  it('adds a name to the resulting statement', () => {
    const structure = {
      query: {
        __name: 'ItemsQuery',
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
      query ItemsQuery {
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

  it('adds the given arguments to the resulting statement', () => {
    const structure = {
      query: {
        __name: 'ItemsQuery',
        __arguments: { $limit: 'Int', $order: 'String' },
        itemsQuery: {
          __arguments: { limit: '$limit' },
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
    }

    const result = stringify(structure, 'graphql')

    expect(result).toEqual(outdent(`
      query ItemsQuery($limit: Int, $order: String) {
        itemsQuery(limit: $limit) {
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
      }
    `).trim())
  })

  it('supports alias field declarations', () => {
    const structure = {
      query: {
        __name: 'ItemsQuery',
        'topItems: itemsQuery': {
          __arguments: { limit: 5 },
          name: true
        },
        'newItems: itemsQuery': {
          __arguments: { limit: 1 },
          name: true
        }
      }
    }

    const result = stringify(structure, 'graphql')

    expect(result).toEqual(outdent(`
      query ItemsQuery {
        topItems: itemsQuery(limit: 5) {
          name
        }
        newItems: itemsQuery(limit: 1) {
          name
        }
      }
    `).trim())
  })

  it('allows for the disablement of parts of the structure', () => {
    const structure = {
      query: {
        __name: 'ItemsQuery',
        __arguments: { $limit: 'Int', $order: 'String' },
        itemsQuery: {
          __arguments: { limit: '$limit' },
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
    }

    const subStructure = { ...structure }
    subStructure.query.itemsQuery.items = false

    const result = stringify(subStructure, 'graphql')

    expect(result).toEqual(outdent(`
      query ItemsQuery($limit: Int, $order: String) {
        itemsQuery(limit: $limit) {
          id
          name
        }
      }
    `).trim())
  })
})
