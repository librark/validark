import { validate } from './validate.js'

describe('validate', () => {
  it('defines a validate entry function', async () => {
    expect(validate).toBeTruthy()
  })

  it('uses function schemas by default', () => {
    expect.assertions(2)
    const schema = {
      age: (value) => !isNaN(Number(value)) ? Number(value) : Error('NaN')
    }
    let instance = { age: 'young' }
    try {
      validate(schema, instance)
    } catch (error) {
      expect(error.message).toEqual('NaN')
    }

    instance = { age: 33 }
    expect(validate(schema, instance)).toEqual(instance)
  })

  it('uses json schemas upon jsonschema dialect option', () => {
    expect.assertions(2)
    const dialect = 'jsonschema'
    const schema = {
      type: 'object',
      properties: {
        age: { type: 'number' }
      }
    }

    let instance = { age: 'young' }
    try {
      validate(schema, instance, { dialect })
    } catch (error) {
      expect(error.message).toEqual('JsonSchemaError')
    }

    instance = { age: 33 }
    expect(validate(schema, instance, { dialect })).toEqual(instance)
  })
})
