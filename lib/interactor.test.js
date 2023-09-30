import { describe, it, expect } from '@jest/globals'
import { validate } from './validate/index.js'
import { Interactor } from './interactor.js'

describe('Interactor', () => {
  it('defines a common interface for all interactors', () => {
    expect(() => new Interactor()).toThrow()
  })

  it('defines a common interface for all interactors', () => {
    expect(() => new Interactor()).toThrow()
  })

  it('validates interactor interactions using data schemas', async () => {
    class MockInteractor extends Interactor {
      schema = {
        input: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  age: { type: 'integer' }
                }
              }
            }
          }
        },
        output: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'string' },
                  name: { type: 'string' },
                  age: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    }
    class StandardMockInteractor extends MockInteractor {
      constructor () {
        const dialect = 'jsonschema'
        const validator = (schema, instance) => validate(
          schema, instance, { dialect })
        super({ validator })
      }

      async perform (input) {
        return {
          data: input.data.map(item => ({ ...item, status: 'active' }))
        }
      }
    }

    const interactor = new StandardMockInteractor()
    const output = await interactor.execute({
      data: [
        { id: 'I001', name: 'John Doe', age: 35 },
        { id: 'I002', name: 'Rogan Roe', age: 40 },
        { id: 'I003', name: 'Mei Moe', age: 50 }
      ]
    })

    expect(output).toEqual({
      data: [
        { id: 'I001', status: 'active', name: 'John Doe', age: 35 },
        { id: 'I002', status: 'active', name: 'Rogan Roe', age: 40 },
        { id: 'I003', status: 'active', name: 'Mei Moe', age: 50 }
      ]
    })
  })

  it('might use other validators', () => {
    const noopValidator = (_schema, _instance) => {}
    class MockInteractor extends Interactor {}
    class StandardMockInteractor extends MockInteractor {}

    const interactor = new StandardMockInteractor({ validator: noopValidator })

    expect(interactor.validator).toBe(noopValidator)
  })

  it('defines a "perform" abstract method', async () => {
    class MockInteractor extends Interactor {}
    class StandardMockInteractor extends MockInteractor {}

    const interactor = new StandardMockInteractor()

    await expect(interactor.perform({})).rejects.toThrow()
  })

  it('throws if its immediate subclasses try to be instantiated', () => {
    class MockInteractor extends Interactor {}
    expect(() => new MockInteractor()).toThrow(
      'Interactor classes must be extended.')
  })

  it('does not perform validation if no schemas are provided', async () => {
    class MockInteractor extends Interactor {}
    class StandardMockInteractor extends MockInteractor {
      async perform (input) {
        return {
          data: input.data.map(item => ({ ...item }))
        }
      }
    }

    const interactor = new StandardMockInteractor()
    const output = await interactor.execute({
      data: [
        { id: 'I001', name: 'John Doe', age: 35 },
        { id: 'I002', name: 'Rogan Roe', age: 40 },
        { id: 'I003', name: 'Mei Moe', age: 50 }
      ]
    })

    expect(output).toEqual({
      data: [
        { id: 'I001', name: 'John Doe', age: 35 },
        { id: 'I002', name: 'Rogan Roe', age: 40 },
        { id: 'I003', name: 'Mei Moe', age: 50 }
      ]
    })
  })
})
