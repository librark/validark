import { fallible } from './fallible.js'

describe('fallible', () => {
  it('returns a pair of error and result on callback failure', async () => {
    const testFunction = async (value) => {
      throw new Error(`Testing Validation Error for Value ${value}.`)
    }

    const [error, result] = await fallible(testFunction(123))

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toEqual('Testing Validation Error for Value 123.')
    expect(result).toBeNull()
  })

  it('returns null as error value on succesful promises', async () => {
    const testFunction = async (value) => {
      return 123
    }

    const [error, result] = await fallible(testFunction(123))

    expect(error).toBeNull()
    expect(result).toEqual(123)
  })

  // it('throws an error if the value provided is not truthy', () => {
  //   const value = undefined

  //   expect(() => check(value)).toThrow('Value "undefined" is falsy.')
  // })

  // it('throws if the value is not an instance of the type', () => {
  //   const type = class Alpha {}
  //   const value = 'Alpha String'

  //   expect(() => check(value, { type })).toThrow(
  //     'Value "Alpha String" is not an instance of "Alpha".')
  // })

  // it('does not throw if the value is a subtype instance', () => {
  //   class Alpha {}
  //   class Beta extends Alpha {}
  //   const value = 'Alpha String'

  //   expect(() => check(value, { type: Alpha })).toThrow(
  //     'Value "Alpha String" is not an instance of "Alpha".')
  //   expect(() => check(new Beta(), Alpha)).not.toThrow()
  // })

  // it('handles String, Number, and Boolean specially', () => {
  //   expect(check('String Literal', { type: String })).toBe('String Literal')
  //   expect(check(123, { type: Number })).toBe(123)
  //   expect(check(false, { type: Boolean })).toBe(false)
  // })
})
