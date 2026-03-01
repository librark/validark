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

    assert.throws(() => validateDefault(schema, records), { message: 'The field "name" is required.' })
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

    assert.throws(() => validateDefault(schema, records), { message: 'The field "quantity" must be a number. Got "XYZ".' })
  })

it('throws on null and undefined records', () => {
    const schema = {
      quantity: parseInt,
      price: parseFloat
    }

    const message = (value) => (
      'The validate function requires an array or object satisfying the ' +
      `schema with keys [quantity,price]. Got "${value}".`)

    assert.throws(() => validateDefault(schema, null), { message: message(null) })
    assert.throws(() => validateDefault(schema, 123), { message: message(123) })
    assert.throws(() => validateDefault(schema, 'LaLaLa'), { message: message('LaLaLa') })
    assert.throws(() => validateDefault(schema, undefined), { message: message(undefined) })
  })

it('throws if a record is not an object', () => {
    const schema = {
      quantity: parseInt,
      price: parseFloat
    }

    let records = [{ name: 'John', age: 56.5 }, null]
    assert.throws(() => validateDefault(schema, records), { message: 'Record "1" is not an object. Got "null".' })

    records = [{ name: 'John', age: 56.5 }, undefined]
    assert.throws(() => validateDefault(schema, records), { message: 'Record "1" is not an object. Got "undefined".' })

    records = [123, { name: 'John', age: 56.5 }]
    assert.throws(() => validateDefault(schema, records), { message: 'Record "0" is not an object. Got "123".' })

    records = [{}, {}, 'Hello']
    assert.throws(() => validateDefault(schema, records), { message: 'Record "2" is not an object. Got "Hello".' })
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

    assert.throws(() => validateDefault(schema, records, { strict: true }), { message: 'Additional properties where received.' })
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

    assert.throws(() => validateDefault(schema, records), { message: 'Invalid field "email". Got "blablabla".' })
  })
