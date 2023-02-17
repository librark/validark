import { validateJsonSchema } from './jsonschema.validate.js'

describe('validate', () => {
  it('defines a validateJsonSchema function', async () => {
    expect(validateJsonSchema).toBeTruthy()
  })
})
