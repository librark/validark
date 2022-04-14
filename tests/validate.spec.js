import { validate } from '../lib/validate.js'

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

  it('throws on null, undefined or non array records', () => {
    const schema = {
      "quantity": parseInt,
      "price": parseFloat
    }

    expect(() => validate(schema, null)).toThrow(
      'The "records" parameter must be an array.')
    expect(() => validate(schema, undefined)).toThrow(
      'The "records" parameter must be an array.')
    expect(() => validate(schema, 'LaLaLa')).toThrow(
      'The "records" parameter must be an array.')
    expect(() => validate(schema, 123)).toThrow(
      'The "records" parameter must be an array.')
  })

  it('throws if a record is not an object', () => {
    const schema = {
      "quantity": parseInt,
      "price": parseFloat
    }

    let records = [{"name": "John", "age": 56.5}, null]
    expect(() => validate(schema, records)).toThrow(
      'Record "1" is not an object. Got "null".')

    records = [{"name": "John", "age": 56.5}, undefined]
    expect(() => validate(schema, records)).toThrow(
      'Record "1" is not an object. Got "undefined".')

    records = [123, {"name": "John", "age": 56.5}]
    expect(() => validate(schema, records)).toThrow(
      'Record "0" is not an object. Got "123".')

    records = [{}, {}, 'Hello']
    expect(() => validate(schema, records)).toThrow(
      'Record "2" is not an object. Got "Hello".')
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

  it('might use lambda validation function', () => {
    const schema = {
      "*place": String,
      "year": (v) => (v > 1920 && v < 2030) && v || 1970
    }

    const records = [
      {"place": "England", "year": 2021},
      {"place": "Japan", "year": 2050}
    ]

    const result = validate(schema, records)

    expect(result).toEqual([
      {"place": "England", "year": 2021},
      {"place": "Japan", "year": 1970}
    ])
  })

  it('might use field aliases', () => {
    const schema = {
      "*first_name:=firstName": String,
      "*last_name:=lastName": String
    }

    const records = [
      {"first_name": "Donald", "last_name": "Trump"},
      {"firstName": "Joseph", "lastName": "Biden"}
    ]

    const result = validate(schema, records)

    expect(result).toEqual([
      {"first_name": "Donald", "last_name": "Trump"},
      {"first_name": "Joseph", "last_name": "Biden"}
    ])
  })

  it('might use multiple field aliases', () => {
    const schema = {
      "*first_name:=name:=firstName": String,
      "*last_name:=surName:=lastName": String
    }

    const records = [
      {"first_name": "Donald", "name": "John", "surName": "Trump"},
      {"firstName": "Joseph", "name": "Robinette", "lastName": "Biden"}
    ]

    const result = validate(schema, records)

    expect(result).toEqual([
      {"first_name": "Donald", "last_name": "Trump"},
      {"first_name": "Robinette", "last_name": "Biden"}
    ])
  })

  it('might use nested schema objects', () => {
    const schema = {
      "*color": String,
      "width": parseInt,
      "height": parseInt,
      "weight": parseFloat,
      "duration": (v) => v >= 0 && v <= 59 && v || 0,
      "*contact": {
        "*phone": String,
        "email": (v) => v.includes('@') && v || ''
      }
    }

    const records = [{
      "color": "red",
      "width": 100,
      "height": 300,
      "duration": 50,
      "contact": {
        "phone": 3456789,
        "email": "info@example.com"
      }
    }, {
      "color": "blue",
      "duration": 99,
      "contact": {
        "phone": 987654,
        "email": "blablabla"
      }
    }]

    const result = validate(schema, records)

    expect(result).toEqual([{
      "color": "red",
      "width": 100,
      "height": 300,
      "duration": 50,
      "contact": {
        "phone": "3456789",
        "email": "info@example.com"
      }
    }, {
      "color": "blue",
      "duration": 0,
      "contact": {
        "phone": "987654",
        "email": ""
      }
    }])
  })

  it('validates arrays of objects and scalars', () => {
    const schema = {
      "levels": [String],
      "addresses": [
        {'*street': String, 'city': String}
      ]
    }

    const records = [{
      "levels": [1, 2, 3],
      "addresses": [
        {"street": '5th Ave 45', "city": "Popeland"},
        {"street": '7th Street 67', "city": "Churchland"}
      ]
    }]

    const [result] = validate(schema, records)

    expect(result).toEqual({
      "levels": ["1", "2", "3"],
      "addresses": [
        {"street": '5th Ave 45', "city": "Popeland"},
        {"street": '7th Street 67', "city": "Churchland"}
      ]
    })
  })

  it('throws error object values if received', () => {
    const schema = {
      "*duration": (v) => v >= 0 && v <= 59 && v || 0,
      "*contact": {
        "*phone": String,
        "email": (v) => v.includes('@') && v || new Error(
      `Invalid field "email". Got "${v}".`)
      }
    }

    const records = [{
      "duration": 50,
      "contact": {
        "phone": 3456789,
        "email": "blablabla"
      }
    }]

    expect(() => validate(schema, records)).toThrow(
      'Invalid field "email". Got "blablabla".')
  })

})
