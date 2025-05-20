import { BN } from '@coral-xyz/anchor'
import { formatDate, printBN, trimDecimalZeros, trimZeros } from './utils'
import { PublicKey } from '@solana/web3.js'
import { FormatNumberThreshold } from '@store/consts/types'
import { Intervals } from '@store/consts/static'

export const toBlur = 'global-blur'
export const addressTickerMap: { [key: string]: string } = {
  WETH: 'So11111111111111111111111111111111111111112',
  BTC: '3JXmQAzBPU66dkVQufSE1ChBMRAdCHp6T7ZMBKAwhmWw',
  USDC: '5W3bmyYDww6p5XRZnCR6m2c75st6XyCxW1TgGS3wTq7S',
  EBGR: 'EBGR1Nb8k3ihiwFuRvXXuxotSKbX7FQWwuzfJEVE9wx9',
  ETH: 'So11111111111111111111111111111111111111112',
  MOON: 'JChWwuoqpXZZn6WjSCssjaozj4u65qNgvGFsV6eJ2g8S',
  ECEGG: 'ECEGG4YDbBevPsq5KfL8Vyk6kptY1jhsoeaiG8RMXZ7C'
}

export const reversedAddressTickerMap = Object.fromEntries(
  Object.entries(addressTickerMap).map(([key, value]) => [value, key])
)

// could use rewriting to backdrop-filter when browser support is better
export const blurContent = () => {
  const el = document.getElementById(toBlur)
  if (!el) return
  el.style.filter = 'blur(4px) brightness(0.4)'
}
export const unblurContent = () => {
  const el = document.getElementById(toBlur)
  if (!el) return
  el.style.filter = 'none'
}

const addPxToValue = ['fontSize'] // add more css properties when needed

export const importantStyles = (styleObject: { [key: string]: string | number }) =>
  Object.entries(styleObject).reduce(
    (obj, [key, value]) => ({
      ...obj,
      [key]: `${value}${addPxToValue.some(prop => prop === key) ? 'px' : ''} !important`
    }),
    styleObject
  )

export const shortenAddress = (address: string, chars = 4) =>
  address.length > 8 ? `${address.slice(0, chars)}...${address.slice(-chars)}` : address

export const apyToApr = (apy: number) => {
  const dailyRate = Math.pow(1 + Math.abs(apy) / 100, 1 / 365) - 1
  return dailyRate * 365 * 100
}

interface Token {
  assetAddress: PublicKey
  balance: BN
  decimals: number
}

interface MaxButtonConfig {
  tokens: Token[]
  wrappedTokenAddress: string
  minAmount: BN
  onAmountSet: (value: string) => void
  onSelectInput?: () => void
}

export const createButtonActions = (config: MaxButtonConfig) => {
  const calculateAmount = (tokenIndex: number) => {
    const token = config.tokens[tokenIndex]
    const isWrappedToken = token.assetAddress.equals(new PublicKey(config.wrappedTokenAddress))

    return isWrappedToken
      ? token.balance.gt(config.minAmount)
        ? token.balance.sub(config.minAmount)
        : new BN(0)
      : token.balance
  }

  return {
    max: (tokenIndex: number | null) => {
      if (tokenIndex === null) {
        return
      }

      config.onSelectInput?.()
      const amount = calculateAmount(tokenIndex)
      config.onAmountSet(trimDecimalZeros(printBN(amount, config.tokens[tokenIndex].decimals)))
    },

    half: (tokenIndex: number | null) => {
      if (tokenIndex === null) {
        return
      }

      config.onSelectInput?.()
      const fullAmount = calculateAmount(tokenIndex)
      const halfAmount = fullAmount.div(new BN(2))
      config.onAmountSet(trimDecimalZeros(printBN(halfAmount, config.tokens[tokenIndex].decimals)))
    }
  }
}
type ButtonVariant = {
  label: string
  className: string
}

type GetButtonClassNameParams = {
  label: string
  variants: ButtonVariant[]
  default: string
}

export const getButtonClassName = ({
  label,
  variants,
  default: defaultClass
}: GetButtonClassNameParams): string => {
  const variant = variants.find(v => v.label.toLowerCase() === label.toLowerCase())
  return `${defaultClass}  ${variant?.className}`
}

export const formatLargeNumber = (number: number) => {
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q']

  if (number < 1000) {
    return number.toFixed(1)
  }

  const suffixIndex = Math.floor(Math.log10(number) / 3)
  const scaledNumber = number / Math.pow(1000, suffixIndex)

  return `${trimZeros(scaledNumber.toFixed(1))}${suffixes[suffixIndex]}`
}

export const thresholdsWithTokenDecimal = (decimals: number): FormatNumberThreshold[] => [
  {
    value: 10,
    decimals
  },
  {
    value: 10000,
    decimals: 6
  },
  {
    value: 100000,
    decimals: 4
  },
  {
    value: 1000000,
    decimals: 3
  },
  {
    value: 1000000000,
    decimals: 2,
    divider: 1000000
  },
  {
    value: Infinity,
    decimals: 2,
    divider: 1000000000
  }
]
export const shortenDate = (timestamp: number | string): string => {
  if (typeof timestamp === 'string') {
    return timestamp.slice(0, 6) + timestamp.slice(-2)
  } else {
    const formatedDate = formatDate(timestamp)
    const [day, month, year] = formatedDate.split('.')
    return `${day}.${month}.${year.slice(-2)}`
  }
}

export const mapIntervalToPrecision = (interval: Intervals): string => {
  switch (interval) {
    case Intervals.Daily:
      return 'every 1 day'
    case Intervals.Weekly:
      return 'every 1 week'
    case Intervals.Monthly:
      return 'every 1 month'
    case Intervals.Yearly:
      return 'every 1 year'
  }
}

export const mapIntervalToString = (interval: Intervals): string => {
  switch (interval) {
    case Intervals.Daily:
      return '1D'
    case Intervals.Weekly:
      return '1W'
    case Intervals.Monthly:
      return '1M'
    case Intervals.Yearly:
      return '1Y'
  }
}

export const formatPlotDataLabels = (
  time: number,
  entries: number,
  interval: Intervals
): string => {
  const date = new Date(time)
  const day = date.getDate()
  const month = date.getMonth() + 1

  switch (interval) {
    case Intervals.Monthly: {
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ]
      const monthName = monthNames[month - 1]
      return monthName
    }
    case Intervals.Yearly: {
      const year = date.getFullYear()
      return `${year}`
    }
    case Intervals.Daily: {
      const dayMod = Math.floor(time / (1000 * 60 * 60 * 24)) % (entries >= 8 ? 2 : 1)

      return dayMod === 0 ? `${day < 10 ? '0' : ''}${day}/${month < 10 ? '0' : ''}${month}` : ''
    }
    case Intervals.Weekly: {
      const dayMod = Math.floor(time / (1000 * 60 * 60 * 24)) % (entries >= 8 ? 2 : 1)

      return dayMod === 0 ? `${day < 10 ? '0' : ''}${day}/${month < 10 ? '0' : ''}${month}` : ''
    }
  }
}
