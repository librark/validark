import { check } from './check.js'

describe('check', () => {
  it('checks the truthyness of a value', () => {
    const value = 'Truthy Value'

    const result = check(value)

    expect(result).toBe(value)
  })

  it('throws an error if the value provided is not truthy', () => {
    const value = undefined

    expect(() => check(value)).toThrow('Value "undefined" is falsy.')
  })

  it('throws if the value is not an instance of the type', () => {
    const type = class Alpha {}
    const value = 'Alpha String'

    expect(() => check(value, type)).toThrow(
      'Value "Alpha String" is not an instance of "Alpha".')
  })
})
