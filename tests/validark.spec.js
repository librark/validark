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

  it('uses simple validators', () => {
    const schema = {
      "product": String,
      "quantity": parseInt,
      "price": parseFloat
    }

    const records = [
      {"product": "Manimoto", "category": "Food",
        "quantity": '5.5', "price": 4700}
    ]

    const [result] = validate(schema, records)

    expect(result).toEqual({
      "product": "Manimoto", "quantity": 5, "price": 4700.0
    })
  })

  it('throws on NaN values', () => {
    const schema = {
      "quantity": parseInt,
      "price": parseFloat
    }

    const records = [
      {"product": "Manimoto", "quantity": 'XYZ', "price": 4700}
    ]

    expect(() => validate(schema, records)).toThrow(
      'The field "quantity" must be a number. Got "XYZ".')
  })

  it('ignores unused optional schema fields', () => {
    const schema = {
      "name": String,
      "surname": String,
      "*age": parseFloat
    }

    const records = [
      {"name": "John", "age": 56.5}
    ]

    const [result] = validate(schema, records)
    expect(result).toEqual({
      "name": "John", "age": 56.5
    })
  })
})
