/** @param {Object} structure
 * @param {string} format
 * @return {Object} options
 * */
export function stringify (structure, format = 'json', options = null) {
  if (format === 'json') {
    return JSON.stringify(structure)
  }
  return stringifyGraphql(structure)
}

function stringifyGraphql (structure, level=0) {
  let statement = ''
  for (const [key, value] of Object.entries(structure)) {
    if (value?.constructor === Object) {
      const { __name, ...structure } = value
      const name = __name ? ` ${__name} `: ' '
      statement += (
        ' '.repeat(level * 2) +
        `${key}${name}{\n${stringifyGraphql(structure, level + 1)}\n` +
        ' '.repeat(level * 2) + '}\n')
    } else if (value) {
      statement += (' '.repeat(level * 2) + `${key}\n`)
    }
  }
  return statement.split('\n').filter(Boolean).join('\n')
}