import assert from 'node:assert/strict'
import { it } from 'node:test'
import { outdent } from './format.js'
import { stringify } from './stringify.js'
import { structure } from './structure.js'

class Alpha {
  constructor (attributes) {
    this.first = attributes.first
    this.second = attributes.second
    this.third = attributes.third
  }

  async customMethod (input) {
    return input + this.first + this.second + this.third
  }
}

it('transforms an object with methods into a plain data structure', () => {
    const object = {
      element: 'content',
      customMethod () {
        return this.element
      }
    }

    const result = structure(object)

    assert.deepStrictEqual(result, {
      element: 'content'
    })
  })

it('transforms a class instance into a plain data structure', () => {
    const instance = new Alpha({ first: 1, third: 3 })

    const result = structure(instance)

    assert.deepStrictEqual(result, {
      first: 1,
      third: 3
    })
  })

it('transforms an array of instances to an array of structures', () => {
    const collection = [
      new Alpha({ first: 1, third: 3 }),
      new Alpha({ second: 2 }),
      new Alpha({ first: 1, second: 2, third: 3 })
    ]

    const result = structure(collection)

    assert.deepStrictEqual(result, [
      { first: 1, third: 3 },
      { second: 2 },
      { first: 1, second: 2, third: 3 }
    ])
  })

it('transforms graphql statements into object structures', () => {
  const statement = outdent(`
    query ItemsQuery($limit: Int, $order: String) {
      topItems: itemsQuery(limit: $limit) {
        id
        name
      }
      newItems: itemsQuery(limit: 1) {
        name
      }
    }
  `).trim()

  const result = structure(statement, 'graphql')

  assert.deepStrictEqual(result, {
    query: {
      __name: 'ItemsQuery',
      __arguments: { $limit: 'Int', $order: 'String' },
      'topItems: itemsQuery': {
        __arguments: { limit: '$limit' },
        id: true,
        name: true
      },
      'newItems: itemsQuery': {
        __arguments: { limit: 1 },
        name: true
      }
    }
  })
})

it('transforms operation graphql statements without explicit format', () => {
  const statement = outdent(`
    query {
      hello
      world
    }
  `).trim()

  const result = structure(statement)

  assert.deepStrictEqual(result, {
    query: {
      hello: true,
      world: true
    }
  })
})

it('reverses stringify graphql output', () => {
  const input = {
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

  const result = structure(stringify(input, 'graphql'), 'gql')

  assert.deepStrictEqual(result, input)
})

it('keeps cloning behavior if graphql format is requested for non-strings', () => {
  const input = {
    query: {
      hello: true
    }
  }

  const result = structure(input, 'graphql')

  assert.deepStrictEqual(result, input)
  assert.notStrictEqual(result, input)
  assert.notStrictEqual(result.query, input.query)
})

it('parses scalar fields with complex graphql argument values', () => {
  const statement = outdent(`
    query {
      # comma and comment tolerance
      scalar(
        text: "line\\nnext",
        list: [1, -2.5, true, null, $limit],
        input: { active: false, label: "tab\\tvalue" },
        amount: -3
      )
    }
  `).trim()

  const result = structure(statement, 'gql')

  assert.deepStrictEqual(result, {
    query: {
      scalar: {
        __arguments: {
          text: 'line\nnext',
          list: [1, -2.5, true, null, '$limit'],
          input: { active: false, label: 'tab\tvalue' },
          amount: -3
        }
      }
    }
  })
})

it('parses named mutation and subscription operations', () => {
  const statement = outdent(`
    mutation SaveOne {
      save(id: 1) {
        ok
      }
    }

    subscription WatchOne {
      watch
    }
  `).trim()

  const result = structure(statement, 'graphql')

  assert.deepStrictEqual(result, {
    mutation: {
      __name: 'SaveOne',
      save: {
        __arguments: { id: 1 },
        ok: true
      }
    },
    subscription: {
      __name: 'WatchOne',
      watch: true
    }
  })
})
