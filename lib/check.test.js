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

    expect(() => check(value, { type })).toThrow(
      'Value "Alpha String" is not an instance of "Alpha".')
  })

  it('does not throw if the value is a subtype instance', () => {
    class Alpha {}
    class Beta extends Alpha {}
    const value = 'Alpha String'

    expect(() => check(value, { type: Alpha })).toThrow(
      'Value "Alpha String" is not an instance of "Alpha".')
    expect(() => check(new Beta(), Alpha)).not.toThrow()
  })
})
