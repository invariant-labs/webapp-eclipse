export interface FormData {
  name: string
  symbol: string
  decimals: string
  supply: string
  description: string
  website: string
  twitter: string
  telegram: string
  discord: string
  image: string
}

type SocialPlatform = 'x' | 'telegram' | 'discord'

export const validateSocialLink = (value: string, platform: SocialPlatform): true | string => {
  if (!value) return true
  const patterns: Record<SocialPlatform, RegExp> = {
    x: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i,
    telegram: /^https?:\/\/(t\.me|telegram\.me)\/.+/i,
    discord: /^https?:\/\/(www\.)?discord\.gg\/.+/i
  }
  return patterns[platform].test(value) || `Invalid ${platform} link`
}

const MAX_VALUE = BigInt(2) ** BigInt(64) - BigInt(1)

export const validateDecimals = (decimals: string): string | null => {
  if (!decimals) return null
  const decimalsValue = parseInt(decimals, 10)
  if (isNaN(decimalsValue) || decimalsValue < 5 || decimalsValue > 9) {
    return 'Decimals must be between 5 and 9'
  }
  return null
}

export const validateSupply = (supply: string, decimals: string): string | null => {
  if (!supply || !decimals) return null

  const supplyValue = BigInt(supply)
  const decimalsValue = parseInt(decimals, 10)

  if (supplyValue === 0n) {
    return null
  }

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

interface ErrorMessage {
  shortErrorMessage: string
  fullErrorMessage: string
}

const errorMessages: Record<string, ErrorMessage> = {
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
    fullErrorMessage: '(Supply * 10^decimal) must be less than or equal to (2^64) - 1'
  }
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
        return errorMessages.supply
    }
  }

  return {
    shortErrorMessage: error.message || 'An error occurred',
    fullErrorMessage: error.message || 'An unexpected error occurred'
  }
}

export default getErrorMessages
