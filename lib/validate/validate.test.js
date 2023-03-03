import { validate } from './validate.js'

describe('validate', () => {
  it('defines a validate entry function', async () => {
    expect(validate).toBeTruthy()
  })

  it('uses function schemas by default', () => {
    expect.assertions(1)
    const schema = {
      age: (value) => !isNaN(Number(value)) ? Number(value) : Error('NaN')
    }
    const instance = {
      age: 'young'
    }
    try {
      validate(schema, instance)
    } catch (error) {
      expect(error.message).toEqual('NaN')
    }
  })
})
