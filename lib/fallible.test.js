import assert from 'node:assert/strict'
import { it } from 'node:test'
import { fallible } from './fallible.js'

it('fallible: returns a pair of error and result on callback failure', async () => {
  const testFunction = async (value) => {
    throw new Error(`Testing Validation Error for Value ${value}.`)
  }

  const [error, result] = await fallible(testFunction(123))

  assert.ok(error instanceof Error)
  assert.deepStrictEqual(error.message, 'Testing Validation Error for Value 123.')
  assert.strictEqual(result, null)
})

it('fallible: returns null as error value on succesful promises', async () => {
  const testFunction = async (value) => {
    return 123
  }

  const [error, result] = await fallible(testFunction(123))

  assert.strictEqual(error, null)
  assert.deepStrictEqual(result, 123)
})
