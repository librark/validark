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

  xit('throws error object values if received', () => {
    const schema = {
      "*duration": (v) => v >= 0 && v <= 59 && v || 0,
      "*contact": {
        "*phone": String,
        "email": (v) => v.includes('@') && v || new Error(
      `Invalid email: "${v}"`)
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
      'Invalid field "email". Got "blablabla"')
  })

})
