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

type SocialPlatform = 'twitter' | 'telegram' | 'discord'

export const validateSocialLink = (value: string, platform: SocialPlatform): true | string => {
  if (!value) return true
  const patterns: Record<SocialPlatform, RegExp> = {
    twitter: /^https?:\/\/(www\.)?twitter\.com\/.+/i,
    telegram: /^https?:\/\/(t\.me|telegram\.me)\/.+/i,
    discord: /^https?:\/\/(www\.)?discord\.gg\/.+/i
  }
  return patterns[platform].test(value) || `Invalid ${platform} link`
}

const MAX_VALUE = BigInt(2) ** BigInt(64) - BigInt(1)

export const validateSupplyAndDecimals = (supply: string, decimals: string): string | null => {
  if (!supply || !decimals) return null

  const supplyValue = BigInt(supply)
  const decimalsValue = parseInt(decimals, 10)

  if (decimalsValue < 5 || decimalsValue > 9) {
    return 'Decimals must be between 5 and 9'
  }

  if (supplyValue === 0n) {
    return null
  }

  const totalDigits = supply.length + decimalsValue
  if (totalDigits > 20) {
    return '(Supply * 10^decimal) must be less than or equal to (2^64) - 1'
  }

  if (totalDigits === 20) {
    const result = supplyValue * BigInt(10) ** BigInt(decimalsValue)
    return result <= MAX_VALUE
      ? null
      : '(Supply * 10^decimal) must be less than or equal to (2^64) - 1'
  }

  return null
}

export const onSubmit = (data: FormData) => {
  try {
    console.log(data)
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}
