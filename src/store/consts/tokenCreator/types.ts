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

export type SocialPlatform = 'x' | 'telegram' | 'discord' | 'website'

export interface ErrorMessage {
  shortErrorMessage: string
  fullErrorMessage: string
}
