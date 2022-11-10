/** @param {Object} structure
 * @param {string} format
 * @return {Object} options
 * */
export function stringify (structure, format = '', options = null) {
  if (format === 'json') {
    return JSON.stringify(structure)
  } else if (['graphql', 'gql'].includes(format)) {
    return stringifyGraphql(structure)
  }
  return String(structure)
}

function stringifyGraphql (structure, level=0) {
  let statement = ''
  for (const [key, value] of Object.entries(structure)) {
    if (value?.constructor === Object) {
      const { __name, __arguments, ...structure } = value
      const name = __name ? ` ${__name}`: ''
      let arguments_ = ''
      if (__arguments) {
        const pairs = Object.entries(__arguments).map(
          ([key, value]) => `${key}: ${value}`).join(', ')
        arguments_ = `(${pairs})`
      }
  
      statement += (
        ' '.repeat(level * 2) +
        `${key}${name}${arguments_} {` +
        `\n${stringifyGraphql(structure, level + 1)}\n` +
        ' '.repeat(level * 2) + '}\n')
    } else if (value) {
      statement += (' '.repeat(level * 2) + `${key}\n`)
    }
  }
  return statement.split('\n').filter(Boolean).join('\n')
}
