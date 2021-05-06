import { validate } from '../lib/validark.js'

describe('validate', () => {
  it('validates simple data', () => {
    const schema = {
        "company": String,
        "city": String,
        "year": parseInt
    }

    const records = [
        {"company": "Knowark", "city": "Popayán", "year": 2015}
    ]

    const [result] = validate(schema, records)

    expect(result).toEqual(
      {"company": "Knowark", "city": "Popayán", "year": 2015})
  })


  it('validates required fields', () => {
    const schema = {
        "*name": String,
        "age": parseFloat
    }

    const records = [
        {"age": 15.5}
    ]

    expect(() => validate(schema, records)).toThrow(
      'The field "name" is required.')
  })
})
