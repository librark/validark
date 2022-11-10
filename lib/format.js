export function dedent (input) {
  return input.split('\n').map(line => line.trim()).join('\n')
}

export function outdent (input) {
  let spaces = 0
  const result = []
  for (const line of input.split('\n')) {
    spaces = spaces || line.search(/\S|$/)
    result.push(line.slice(spaces))
  }
  return result.join('\n')
}
