import assert from 'node:assert/strict'
import { it } from 'node:test'
import { validateDefault } from './default.validate.js'

it('validates simple data', () => {
    const schema = {
      company: String,
      city: String,
      year: parseInt
    }

    const records = [
      { company: 'Knowark', city: 'Popayán', year: 2015 }
    ]

    const [result] = validateDefault(schema, records)

    assert.deepStrictEqual(result, 
      { company: 'Knowark', city: 'Popayán', year: 2015 })
  })

it('validates required fields', () => {
    const schema = {
      '*name': String,
      age: parseFloat
    }

    const records = [
      { age: 15.5 }
    ]

    assert.throws(
      () => validateDefault(schema, records, { eager: true }),
      { message: 'The field "name" is required.' }
    )
  })

it('uses simple validators', () => {
    const schema = {
      product: String,
      quantity: parseInt,
      price: parseFloat
    }

    const records = [
      {
        product: 'Manimoto',
        category: 'Food',
        quantity: '5.5',
        price: 4700
      }
    ]

    const [result] = validateDefault(schema, records)

    assert.deepStrictEqual(result, {
      product: 'Manimoto', quantity: 5, price: 4700.0
    })
  })

it('throws on NaN values', () => {
    const schema = {
      quantity: parseInt,
      price: parseFloat
    }

    const records = [
      { product: 'Manimoto', quantity: 'XYZ', price: 4700 }
    ]

    assert.throws(
      () => validateDefault(schema, records, { eager: true }),
      { message: 'The field "quantity" must be a number. Got "XYZ".' }
    )
  })

it('throws on null and undefined records', () => {
    const schema = {
      quantity: parseInt,
      price: parseFloat
    }

    const message = (value) => (
      'The validate function requires an array or object satisfying the ' +
      `schema with keys [quantity,price]. Got "${value}".`)

    assert.throws(() => validateDefault(schema, null, { eager: true }), { message: message(null) })
    assert.throws(() => validateDefault(schema, 123, { eager: true }), { message: message(123) })
    assert.throws(() => validateDefault(schema, 'LaLaLa', { eager: true }), { message: message('LaLaLa') })
    assert.throws(() => validateDefault(schema, undefined, { eager: true }), { message: message(undefined) })
  })

it('aggregates invalid record collection input by default', () => {
    const schema = {
      quantity: parseInt,
      price: parseFloat
    }

    let error = null
    try {
      validateDefault(schema, null)
    } catch (exception) {
      error = exception
    }

    assert.ok(error instanceof AggregateError)
    assert.equal(error.name, 'ValidationError')
    assert.equal(error.issues.length, 1)
    assert.equal(error.issues[0].code, 'invalid_record_collection')
    assert.ok(error.message.includes('The validate function requires an array or object satisfying the schema with keys [quantity,price]. Got "null".'))
  })

it('throws if a record is not an object', () => {
    const schema = {
      quantity: parseInt,
      price: parseFloat
    }

    let records = [{ name: 'John', age: 56.5 }, null]
    assert.throws(
      () => validateDefault(schema, records, { eager: true }),
      { message: 'Record "1" is not an object. Got "null".' }
    )

    records = [{ name: 'John', age: 56.5 }, undefined]
    assert.throws(
      () => validateDefault(schema, records, { eager: true }),
      { message: 'Record "1" is not an object. Got "undefined".' }
    )

    records = [123, { name: 'John', age: 56.5 }]
    assert.throws(
      () => validateDefault(schema, records, { eager: true }),
      { message: 'Record "0" is not an object. Got "123".' }
    )

    records = [{}, {}, 'Hello']
    assert.throws(
      () => validateDefault(schema, records, { eager: true }),
      { message: 'Record "2" is not an object. Got "Hello".' }
    )
  })

it('ignores unused optional schema fields', () => {
    const schema = {
      name: String,
      surname: String,
      '*age': parseFloat
    }

    const records = [
      { name: 'John', age: 56.5 }
    ]

    const [result] = validateDefault(schema, records)
    assert.deepStrictEqual(result, {
      name: 'John', age: 56.5
    })
  })

it('restricts additional properties on strict mode', () => {
    const schema = {
      name: String,
      '*age': parseFloat
    }

    const records = [
      { name: 'John', age: 56.5, surname: 'Doe' }
    ]

    assert.throws(
      () => validateDefault(schema, records, { strict: true, eager: true }),
      { message: 'Additional properties where received.' }
    )
  })

it('might use lambda validation function', () => {
    const schema = {
      '*place': String,
      year: (v) => v > 1920 && v < 2030 ? v : 1970
    }

    const records = [
      { place: 'England', year: 2021 },
      { place: 'Japan', year: 2050 }
    ]

    const result = validateDefault(schema, records)

    assert.deepStrictEqual(result, [
      { place: 'England', year: 2021 },
      { place: 'Japan', year: 1970 }
    ])
  })

it('might use field aliases', () => {
    const schema = {
      '*first_name:=firstName': String,
      '*last_name:=lastName': String
    }

    const records = [
      { first_name: 'Donald', last_name: 'Trump' },
      { firstName: 'Joseph', lastName: 'Biden' }
    ]

    const result = validateDefault(schema, records)

    assert.deepStrictEqual(result, [
      { first_name: 'Donald', last_name: 'Trump' },
      { first_name: 'Joseph', last_name: 'Biden' }
    ])
  })

it('might use multiple field aliases', () => {
    const schema = {
      '*first_name:=name:=firstName': String,
      '*last_name:=surName:=lastName': String
    }

    const records = [
      { first_name: 'Donald', name: 'John', surName: 'Trump' },
      { firstName: 'Joseph', name: 'Robinette', lastName: 'Biden' }
    ]

    const result = validateDefault(schema, records)

    assert.deepStrictEqual(result, [
      { first_name: 'Donald', last_name: 'Trump' },
      { first_name: 'Robinette', last_name: 'Biden' }
    ])
  })

it('might use nested schema objects', () => {
    const schema = {
      '*color': String,
      width: parseInt,
      height: parseInt,
      weight: parseFloat,
      duration: (v) => v >= 0 && v <= 59 ? v : 0,
      '*contact': {
        '*phone': String,
        email: (v) => v.includes('@') ? v : ''
      }
    }

    const records = [{
      color: 'red',
      width: 100,
      height: 300,
      duration: 50,
      contact: {
        phone: 3456789,
        email: 'info@example.com'
      }
    }, {
      color: 'blue',
      duration: 99,
      contact: {
        phone: 987654,
        email: 'blablabla'
      }
    }]

    const result = validateDefault(schema, records)

    assert.deepStrictEqual(result, [{
      color: 'red',
      width: 100,
      height: 300,
      duration: 50,
      contact: {
        phone: '3456789',
        email: 'info@example.com'
      }
    }, {
      color: 'blue',
      duration: 0,
      contact: {
        phone: '987654',
        email: ''
      }
    }])
  })

it('validates individual objects', () => {
    const schema = {
      levels: [String],
      addresses: [
        { '*street': String, city: String }
      ]
    }

    const record = {
      levels: [1, 2, 3],
      addresses: [
        { street: '5th Ave 45', city: 'Popeland' }
      ]
    }

    validateDefault(schema, record)
    const result = validateDefault(schema, record)

    assert.deepStrictEqual(result, {
      levels: ['1', '2', '3'],
      addresses: [
        { street: '5th Ave 45', city: 'Popeland' }
      ]
    })
  })

it('validates arrays of objects and scalars', () => {
    const schema = {
      levels: [String],
      addresses: [
        { '*street': String, city: String }
      ]
    }

    const records = [{
      levels: [1, 2, 3],
      addresses: [
        { street: '5th Ave 45', city: 'Popeland' },
        { street: '7th Street 67', city: 'Churchland' }
      ]
    }]

    validateDefault(schema, records)
    const [result] = validateDefault(schema, records)

    assert.deepStrictEqual(result, {
      levels: ['1', '2', '3'],
      addresses: [
        { street: '5th Ave 45', city: 'Popeland' },
        { street: '7th Street 67', city: 'Churchland' }
      ]
    })
  })

it('validates arrays with a function', () => {
    const schema = {
      levels: [String],
      addresses: (array) => [array].flat().every(
        item => item.street && item.city) && array
    }

    const records = [{
      levels: [1, 2, 3],
      addresses: [
        { street: '5th Ave 45', city: 'Popeland' },
        { street: '7th Street 67', city: 'Churchland' }
      ]
    }]

    validateDefault(schema, records)
    const [result] = validateDefault(schema, records)

    assert.deepStrictEqual(result, {
      levels: ['1', '2', '3'],
      addresses: [
        { street: '5th Ave 45', city: 'Popeland' },
        { street: '7th Street 67', city: 'Churchland' }
      ]
    })
  })

it('throws error object values if received', () => {
    const schema = {
      '*duration': (v) => ((v >= 0 && v <= 59) && v) || 0,
      '*contact': {
        '*phone': String,
        email: (v) => v.includes('@')
          ? v
          : new Error(
          `Invalid field "email". Got "${v}".`)
      }
    }

    const records = [{
      duration: 50,
      contact: {
        phone: 3456789,
        email: 'blablabla'
      }
    }]

    assert.throws(
      () => validateDefault(schema, records, { eager: true }),
      { message: 'Invalid field "email". Got "blablabla".' }
    )
  })

it('strict mode accepts required keys and aliases', () => {
    const schema = {
      '*name': String,
      '*first_name:=firstName': String
    }

    const records = [{ name: 'John', firstName: 'Doe' }]
    const [result] = validateDefault(schema, records, { strict: true })

    assert.deepStrictEqual(result, { name: 'John', first_name: 'Doe' })
  })

it('strict mode validates additional properties on nested objects', () => {
    const schema = {
      '*contact': {
        '*phone': String
      }
    }

    const records = [{
      contact: {
        phone: 123456,
        email: 'a@b.com'
      }
    }]

    assert.throws(
      () => validateDefault(schema, records, { strict: true, eager: true }),
      { message: 'Additional properties where received.' }
    )
  })

it('throws NaN values from array item validators', () => {
    const schema = {
      levels: [parseInt]
    }

    const records = [{ levels: ['abc', '2'] }]

    assert.throws(
      () => validateDefault(schema, records, { eager: true }),
      { message: 'The field "levels" must be a number. Got "abc".' }
    )
  })

it('throws Error values from array item validators', () => {
    const schema = {
      levels: [(v) => v > 0 ? v : new Error(`Invalid level "${v}".`)]
    }

    const records = [{ levels: [1, -1] }]

    assert.throws(
      () => validateDefault(schema, records, { eager: true }),
      { message: 'Invalid level "-1".' }
    )
  })

it('collects all validation issues when eager is false', () => {
    const schema = {
      '*name': String,
      '*age': parseInt,
      levels: [parseInt],
      '*contact': {
        '*email': (v) => v.includes('@')
          ? v
          : new Error(`Invalid field "email". Got "${v}".`)
      }
    }

    const records = [{
      age: 'x',
      levels: ['abc', '2'],
      contact: {
        email: 'missing-at',
        unknown: true
      },
      unknown: true
    }, null]

    let error = null
    try {
      validateDefault(schema, records, { strict: true, eager: false })
    } catch (exception) {
      error = exception
    }

    assert.ok(error instanceof AggregateError)
    assert.equal(error.name, 'ValidationError')
    assert.ok(Array.isArray(error.issues))
    assert.equal(error.issues.length, 7)
    assert.ok(error.message.includes('$[0].unknown: Additional properties where received.'))
    assert.ok(error.message.includes('$[0].name: The field "name" is required.'))
    assert.ok(error.message.includes('$[0].age: The field "age" must be a number. Got "x".'))
    assert.ok(error.message.includes('$[0].levels[0]: The field "levels" must be a number. Got "abc".'))
    assert.ok(error.message.includes('$[0].contact.unknown: Additional properties where received.'))
    assert.ok(error.message.includes('$[0].contact.email: Invalid field "email". Got "missing-at".'))
    assert.ok(error.message.includes('$[1]: Record "1" is not an object. Got "null".'))
  })

it('collects validator exceptions when eager is false', () => {
    const schema = {
      levels: [value => {
        if (value < 0) {
          throw new Error(`Invalid level "${value}".`)
        }
        return value
      }]
    }

    const records = [{ levels: [1, -1, 2] }]

    let error = null
    try {
      validateDefault(schema, records, { eager: false })
    } catch (exception) {
      error = exception
    }

    assert.ok(error instanceof AggregateError)
    assert.equal(error.issues.length, 1)
    assert.equal(error.issues[0].code, 'validator_exception')
    assert.ok(error.message.includes('$[0].levels[1]: Invalid level "-1".'))
  })

it('formats issue paths for non-identifier keys', () => {
    const schema = {
      '*bad"name': String
    }

    const records = [{}]

    let error = null
    try {
      validateDefault(schema, records, { eager: false })
    } catch (exception) {
      error = exception
    }

    assert.ok(error instanceof AggregateError)
    assert.equal(error.issues.length, 1)
    assert.ok(error.message.includes('$[0]["bad\\"name"]'))
  })
