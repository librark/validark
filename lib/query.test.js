import { describe, it, expect } from '@jest/globals'
import { Query } from './query.js'

describe('Query', () => {
  it('defines a common class for all queries', () => {
    expect(() => new Query()).toThrow()
  })

  it('exposes a properties attribute to communicate its metadata', () => {
    class CustomQuery extends Query {
      properties = {
        name: 'Custom Report XYZ'
      }
    }
    const query = new CustomQuery()

    expect(query.properties).toMatchObject({ name: 'Custom Report XYZ' })
  })

  it('exposes a properties attribute with null as defaul value', () => {
    class CustomQuery extends Query {}

    const query = new CustomQuery()

    expect(query.properties).toBeNull()
  })
})
