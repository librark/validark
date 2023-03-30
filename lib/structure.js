/**
 * @param {object} object
 * @return {object}
 * */
export function structure (object) {
  return JSON.parse(JSON.stringify(object))
}
