
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

      let [key, value] = [undefined, undefined]
      for(key of field.split(":=").reverse()) {
        value = ((typeof record[key] !== 'undefined') ? 
          record[key] : value)
      }

      if(required && typeof value === 'undefined') {
        throw new Error(`The field "${key}" is required.`)
      }

      if(typeof value !== 'undefined') {
        const outcome = validator(value)
        if(Number.isNaN(outcome)) {
          throw new Error(
            `The field "${key}" must be a number. Got "${value}".`)
        }
        item[key] = outcome
      }

    }
    result.push(item)
  }

  return result
}
