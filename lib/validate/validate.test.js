import assert from 'node:assert/strict'
import { it } from 'node:test'
import { validate } from './validate.js'

it('validate: defines a validate entry function', () => {
  assert.ok(validate)
})

it('validate: uses function schemas by default', () => {
  const schema = {
    age: (value) => !isNaN(Number(value)) ? Number(value) : Error('NaN')
  }
  let instance = { age: 'young' }

  assert.throws(() => validate(schema, instance), { message: 'NaN' })

  instance = { age: 33 }
  assert.deepStrictEqual(validate(schema, instance), instance)
})

it('validate: uses json schemas upon jsonschema dialect option', () => {
  const dialect = 'jsonschema'
  const schema = {
    type: 'object',
    properties: {
      age: { type: 'number' }
    }
  }

  let instance = { age: 'young' }
  assert.throws(() => validate(schema, instance, { dialect }), {
    message: 'JsonSchemaError\n\nThe type must be number: Got string.'
  })

  instance = { age: 33 }
  assert.deepStrictEqual(validate(schema, instance, { dialect }), instance)
})
