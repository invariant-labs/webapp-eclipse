import { ErrorMessage } from './types'
import Dog1 from '@static/svg/SolanaCreator/Dog1.svg'
import Dog2 from '@static/svg/SolanaCreator/Dog2.svg'
import Cat1 from '@static/svg/SolanaCreator/Cat1.svg'
import Cat2 from '@static/svg/SolanaCreator/Cat2.svg'

export const MAX_VALUE = BigInt(2) ** BigInt(64) - BigInt(1)

export const errorMessages: Record<string, ErrorMessage> = {
  required: {
    shortErrorMessage: 'This field is required',
    fullErrorMessage: 'This field is required'
  },
  decimals: {
    shortErrorMessage: 'Invalid decimals',
    fullErrorMessage: 'Decimals must be between 5 and 9'
  },
  supply: {
    shortErrorMessage: 'Supply exceeds limit',
    fullErrorMessage: '(Supply * 10^decimal) must be less than (2^64) and greater than 0'
  }
}

export const defaultImages: string[] = [Dog1, Dog2, Cat1, Cat2]
