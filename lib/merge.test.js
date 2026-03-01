import assert from 'node:assert/strict'
import { it } from 'node:test'
import { merge } from './merge.js'

it('merges two simple objects', () => {
    const first = {
      name: 'john doe'
    }

    const second = {
      message: 'hello world'
    }

    const result = merge(first, second)

    assert.deepStrictEqual(result, {
      name: 'john doe',
      message: 'hello world'
    })
  })

it('merges two complext and nested objects', () => {
    const first = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string' }
      }
    }

    const second = {
      properties: {
        createdAt: { example: '2023-08-30T17:33:06.934Z' },
        name: { type: 'string' }
      }
    }

    const result = merge(first, second)

    assert.deepStrictEqual(result, {
      type: 'object',
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string', example: '2023-08-30T17:33:06.934Z' },
        name: { type: 'string' }
      }
    })
  })
