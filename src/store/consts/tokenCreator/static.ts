import { cat1Icon, cat2Icon, dog1Icon, dog2Icon } from '@static/icons'
import { ErrorMessage } from './types'

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

export const defaultImages: string[] = [dog1Icon, dog2Icon, cat1Icon, cat2Icon]
