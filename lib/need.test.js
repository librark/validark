import assert from 'node:assert/strict'
import { it } from 'node:test'
import { NeedError } from './errors.js'
import { need } from './need.js'

it('need: throws a NeedError when called', () => {
  assert.throws(() => need(Number), NeedError)
  assert.throws(() => need(Number), {
    message: 'A value of type "Number" is needed.'
  })
})

it('need: returns the provided fallback as a default value', () => {
  assert.deepStrictEqual(need(String, 'Hello World'), 'Hello World')
  assert.deepStrictEqual(need(Number, 77), 77)
  assert.deepStrictEqual(need(Date, new Date('2023-08-01')), new Date('2023-08-01'))
})

it('need: throws if fallback is not an instance of type', () => {
  assert.throws(() => need(Date, 'Tuesday Afternoon'), NeedError)
  assert.throws(() => need(Date, 'Tuesday Afternoon'), {
    message: 'The fallback value must be of type "Date". Got "String".'
  })
})

it('need: returns fallback if it is a subclass of type', () => {
  class BaseClass {}
  class SubClass extends BaseClass {}

  const instance = new SubClass()

  assert.deepStrictEqual(need(BaseClass, instance), instance)
  assert.deepStrictEqual(need(SubClass, instance), instance)
})

it('need: may be used to ensure required parameters are provided', () => {
  function sum (first = need(Number), second = need(Number)) {
    return first + second
  }

  assert.deepStrictEqual(sum(1, 2), 3)
  assert.throws(() => sum(1), {
    message: 'A value of type "Number" is needed.'
  })
})
