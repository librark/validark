
/** @param {Object} schema
 * @param {Array[Object]} records
 * @return {Array[Object]}
 * */
export function validate(schema, records) {
  const result = []
  for(const record of records) {
    const item = {}
    for(let [field, validator] of Object.entries(schema)) {
      const required = field[0] === '*'

      field = required ? field.slice(1) : field
      let value = record[field]

      if(required && typeof value === 'undefined') {
        throw new Error(`The field "${field}" is required.`)
      }

      item[field] = value
    }
    result.push(item)
  }

  return records
}
