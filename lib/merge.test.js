import { merge } from './merge.js'

describe('merge', () => {
  it('merges two simple objects', () => {
    const first = {
      name: 'john doe'
    }

    const second = {
      message: 'hello world'
    }

    const result = merge(first, second)

    expect(result).toEqual({
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

    expect(result).toEqual({
      type: 'object',
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string', example: '2023-08-30T17:33:06.934Z' },
        name: { type: 'string' }
      }
    })
  })
})
