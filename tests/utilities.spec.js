import { check } from '../lib/utilities.js'

describe('check', () => {
  it('checks the truthyness of a value', () => {
    const value = 'Truthy Value'

    const result = check(value)

    expect(result).toBe(value)
  })

  it('throws an error if the value provided is not truthy', () => {
    const value = undefined
    const message = 'Invalid value!'

    expect(() => check(value, message)).toThrow(`check failed. ${message}`)
  })

  it('throws if called without arguments', () => {
    expect(() => check()).toThrow('check failed.')
  })
})
