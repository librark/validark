
/**
 * @template Type
 * @param {Promise<Type>} promise
 * @return {[Error?, Type?]}
 */
export async function fallible (promise) {
  let result = null
  try {
    result = await promise
    return [null, result]
  } catch (error) {
    return [error, null]
  }
}
