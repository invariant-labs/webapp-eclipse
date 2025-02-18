import { ErrorMessage, SocialPlatform } from '@store/consts/tokenCreator/types'
import { errorMessages, MAX_VALUE } from '@store/consts/tokenCreator/static'

export const validateSocialLink = (value: string, platform: SocialPlatform): true | string => {
  if (!value) return true
  const patterns: Record<SocialPlatform, RegExp> = {
    website:
      /* trunk-ignore(eslint/no-useless-escape) */
      /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i,
    x: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i,
    telegram: /^https?:\/\/(t\.me|telegram\.me)\/.+/i,
    discord: /^https?:\/\/(www\.)?discord\.gg\/.+/i
  }

  if (value.length > 200) {
    return 'Link exceeds maximum length'
  }
  return patterns[platform].test(value) || `Invalid ${platform} link`
}

export const validateDecimals = (decimals: string): string | null => {
  if (!decimals) return null
  const decimalsValue = parseInt(decimals, 10)
  if (isNaN(decimalsValue) || decimalsValue < 5 || decimalsValue > 9) {
    return 'Decimals must be between 5 and 9'
  }
  return null
}

export const validateSupply = (supply: string, decimals: string): string | null => {
  const supplyValue = BigInt(supply)

  if (supplyValue === 0n) {
    return 'Supply must be greater than 0'
  }

  if (!supply || !decimals) return null

  const decimalsValue = parseInt(decimals, 10)

  const totalDigits = supply.length + decimalsValue
  if (totalDigits > 20) {
    return 'Supply exceeds maximum limit'
  }

  if (totalDigits === 20) {
    const result = supplyValue * BigInt(10) ** BigInt(decimalsValue)
    return result <= MAX_VALUE ? null : 'Supply exceeds maximum limit'
  }

  return null
}

const getErrorMessages = (error: any): ErrorMessage => {
  if (!error) {
    return { shortErrorMessage: '', fullErrorMessage: '' }
  }

  if (error.type === 'required') {
    return errorMessages.required
  }

  if (error.type === 'validate') {
    switch (error.ref.name) {
      case 'decimals':
        return {
          shortErrorMessage: 'Invalid range for decimals (5-9)',
          fullErrorMessage: error.message || errorMessages.decimals.fullErrorMessage
        }
      case 'supply':
        return {
          shortErrorMessage: error.message || 'Supply exceeds limit',
          fullErrorMessage: errorMessages.supply.fullErrorMessage
        }
    }
  }

  return {
    shortErrorMessage: error.message || 'An error occurred',
    fullErrorMessage: error.message || 'An unexpected error occurred'
  }
}

export default getErrorMessages
