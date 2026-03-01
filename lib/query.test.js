import assert from 'node:assert/strict'
import { it } from 'node:test'
import { Query } from './query.js'

it('defines a common class for all queries', () => {
    assert.throws(() => new Query())
  })

it('exposes a properties attribute to communicate its metadata', () => {
    class CustomQuery extends Query {
      properties = {
        name: 'Custom Report XYZ'
      }
    }
    const query = new CustomQuery()

    assert.deepStrictEqual(query.properties, { name: 'Custom Report XYZ' })
  })

it('exposes a properties attribute with null as defaul value', () => {
    class CustomQuery extends Query {}

    const query = new CustomQuery()

    assert.strictEqual(query.properties, null)
  })
