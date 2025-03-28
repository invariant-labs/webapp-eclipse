import { ensureError } from './utils'

export const trimZeros = (amount: string) => {
  try {
    return parseFloat(amount).toString()
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    return amount
  }
}
