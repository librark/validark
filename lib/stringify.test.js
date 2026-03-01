import assert from 'node:assert/strict'
import { it } from 'node:test'
import { outdent } from './format.js'
import { stringify } from './stringify.js'

it('stringify: converts to a string any data', () => {
  const structure = {
    key: 'value'
  }

  const result = stringify(structure)

  assert.deepStrictEqual(result, '[object Object]')
})

it('stringify: stringifies simple json data', () => {
  const structure = {
    key: 'value'
  }

  const result = stringify(structure, 'json')

  assert.deepStrictEqual(result, '{"key":"value"}')
})

it('stringify graphql: stringifies simple json data', () => {
  const structure = {
    query: {
      hello: true,
      world: true
    }
  }

  const result = stringify(structure, 'graphql')

  assert.deepStrictEqual(result, outdent(`
      query {
        hello
        world
      }
    `).trim())
})

it('stringify graphql: ignores the keys of falsy values', () => {
  const structure = {
    query: {
      hello: false,
      world: true
    }
  }

  const result = stringify(structure, 'gql')

  assert.deepStrictEqual(result, outdent(`
      query {
        world
      }
    `).trim())
})

it('stringify graphql: stringifies deeply nested json data', () => {
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

  assert.deepStrictEqual(result, outdent(`
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

it('stringify graphql: adds a name to the resulting statement', () => {
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

  assert.deepStrictEqual(result, outdent(`
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

it('stringify graphql: adds the given arguments to the resulting statement', () => {
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

  assert.deepStrictEqual(result, outdent(`
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

it('stringify graphql: supports alias field declarations', () => {
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

  assert.deepStrictEqual(result, outdent(`
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

it('stringify graphql: allows disabling parts of the structure', () => {
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

  assert.deepStrictEqual(result, outdent(`
      query ItemsQuery($limit: Int, $order: String) {
        itemsQuery(limit: $limit) {
          id
          name
        }
      }
    `).trim())
})
