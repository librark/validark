import assert from 'node:assert/strict'
import { it } from 'node:test'
import { check } from './check.js'

it('check: checks the truthyness of a value', () => {
  const value = 'Truthy Value'

  const result = check(value)

  assert.strictEqual(result, value)
})

it('check: throws an error if the value provided is not truthy', () => {
  const value = undefined

  assert.throws(() => check(value), { message: 'Value "undefined" is falsy.' })
})

it('check: throws if the value is not an instance of the type', () => {
  const type = class Alpha {}
  const value = 'Alpha String'

  assert.throws(() => check(value, { type }), {
    message: 'Value "Alpha String" is not an instance of "Alpha".'
  })
})

it('check: does not throw if the value is a subtype instance', () => {
  class Alpha {}
  class Beta extends Alpha {}
  const value = 'Alpha String'

  assert.throws(() => check(value, { type: Alpha }), {
    message: 'Value "Alpha String" is not an instance of "Alpha".'
  })
  assert.doesNotThrow(() => check(new Beta(), Alpha))
})

it('check: handles String, Number, and Boolean specially', () => {
  assert.strictEqual(check('String Literal', { type: String }), 'String Literal')
  assert.strictEqual(check(123, { type: Number }), 123)
  assert.strictEqual(check(false, { type: Boolean }), false)
})
