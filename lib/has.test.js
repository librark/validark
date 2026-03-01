import assert from 'node:assert/strict'
import { it } from 'node:test'
import { has } from './has.js'

it('has: returns the given instance if it has the given properties', () => {
  const instance = {
    name: 'John Doe'
  }

  const result = has(instance, 'name')

  assert.strictEqual(result, instance)
})

it('has: throws if a property is not found in the instance', () => {
  const instance = {
    name: 'John Doe'
  }

  assert.throws(() => has(instance, 'missing'), {
    message: 'Instance does not have property "missing".'
  })
})

it('has: throws if any property from a list is not found in the instance', () => {
  const instance = {
    name: 'John Doe'
  }

  assert.throws(() => has(instance, ['name', 'age']), {
    message: 'Instance does not have property "age".'
  })
})

it('has: throws if any property from a comma separated string is missing', () => {
  const instance = {
    name: 'John Doe'
  }

  assert.throws(() => has(instance, 'name, age'), {
    message: 'Instance does not have property "age".'
  })
})

it('has: throws if the given instance is falsy', () => {
  const instance = null

  assert.throws(() => has(instance, 'name, age'), {
    message: 'Instance must be an object. Got "null".'
  })
})
