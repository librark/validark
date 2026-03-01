import assert from 'node:assert/strict'
import { it } from 'node:test'
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
