/**
 * @param {object} first
 * @param {object} second
 * @return {object}
 * */
export function merge (first, second) {
  const merged = { ...first, ...second }
  for (const key of Object.keys(merged)) {
    if (first && second && merged[key]?.constructor === Object) {
      merged[key] = merge(first[key], second[key])
    }
  }
  return merged
}
