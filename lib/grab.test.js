import assert from 'node:assert/strict'
import { it } from 'node:test'
import { grab } from './grab.js'

it('grab: grabs a key from an object', () => {
  const object = {
    element: 'content'
  }

  const result = grab(object, 'element')

  assert.strictEqual(result, 'content')
})

it('grab: throws if the key is not found in the object', () => {
  const object = {
    element: 'content'
  }

  assert.throws(() => grab(object, 'missing'), {
    message: 'Key "missing" not found'
  })
})

it('grab: throws an error if the container given is not an object', () => {
  const container = 1

  assert.throws(() => grab(container), {
    message: 'Container must be an object. Got "1"'
  })
})

it('grab: throws if called without arguments', () => {
  assert.throws(() => grab(), {
    message: 'Container must be an object. Got "undefined"'
  })
})

it('grab: provides a default value if the key is not found', () => {
  const object = {
    element: 'content'
  }

  const result = grab(object, 'missing', 777)

  assert.strictEqual(result, 777)
})

it('grab: grabs a class instance if a class is provided as a key', () => {
  class Alpha {}
  class Beta {}

  const object = {
    alpha: new Alpha(),
    Beta: new Beta()
  }

  let value = grab(object, Alpha)
  assert.ok(value instanceof Alpha)

  value = grab(object, Beta)
  assert.ok(value instanceof Beta)
})

it('grab: grabs a key and validates a class when array syntax is provided', () => {
  class Alpha {}

  const object = {
    resource: new Alpha()
  }

  const value = grab(object, ['resource', Alpha])
  assert.ok(value instanceof Alpha)
})

it('grab: errors out if the item grabbed is not an instance of the key', () => {
  class Alpha {}
  class Beta {}

  const object = {
    alpha: new Beta(),
    beta: null
  }

  assert.throws(() => grab(object, Alpha), {
    message: 'Expecting "Alpha" but got "Beta"'
  })
  assert.throws(() => grab(object, Beta), {
    message: 'Expecting "Beta" but got "undefined"'
  })
})
