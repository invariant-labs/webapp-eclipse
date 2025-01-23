import {
  calculatePriceSqrt,
  DENOMINATOR,
  getTokenProgramAddress,
  MAX_TICK,
  MIN_TICK,
  Pair,
  PRICE_DENOMINATOR,
  sleep
} from '@invariant-labs/sdk-eclipse'
import { PoolStructure, Tick } from '@invariant-labs/sdk-eclipse/src/market'
import {
  calculateTickDelta,
  DECIMAL,
  parseLiquidityOnTicks,
  simulateSwap,
  SimulationStatus
} from '@invariant-labs/sdk-eclipse/src/utils'
import { BN } from '@coral-xyz/anchor'
import { getMint, Mint } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import {
  Market,
  Tickmap,
  TICK_CROSSES_PER_IX,
  TICK_VIRTUAL_CROSSES_PER_IX,
  parsePool,
  RawPoolStructure,
  parsePosition,
  parseTick
} from '@invariant-labs/sdk-eclipse/lib/market'
import axios from 'axios'
import { getMaxTick, getMinTick, PRICE_SCALE, Range } from '@invariant-labs/sdk-eclipse/lib/utils'
import { PlotTickData, PositionWithAddress } from '@store/reducers/positions'
import {
  ADDRESSES_TO_REVERT_TOKEN_PAIRS,
  AI16Z_MAIN,
  BRICK_MAIN,
  BTC_DEV,
  BTC_TEST,
  COINGECKO_QUERY_COOLDOWN,
  DARKMOON_MAIN,
  DEFAULT_TOKENS,
  DOGO_MAIN,
  DOGW_MAIN,
  DOGWIFHAT_MAIN,
  EBULL_MAIN,
  ECAT_MAIN,
  EGOAT_MAIN,
  FormatConfig,
  getAddressTickerMap,
  getReversedAddressTickerMap,
  GSVM_MAIN,
  LAIKA_MAIN,
  MAX_U64,
  MOCKED_TOKEN_MAIN,
  MOO_MAIN,
  MOON_MAIN,
  MOON_TEST,
  NetworkType,
  PANTY_MAIN,
  PODAVINI_MAIN,
  PRICE_DECIMAL,
  PUNKSTAR_MAIN,
  STTIA_MAIN,
  S22_TEST,
  SOL_MAIN,
  subNumbers,
  TETH_MAIN,
  TIA_MAIN,
  tokensPrices,
  TURBO_MAIN,
  USDC_DEV,
  USDC_MAIN,
  USDC_TEST,
  VLR_MAIN,
  WETH_DEV,
  WETH_TEST,
  WRAPPED_ETH_ADDRESS,
  MAX_CROSSES_IN_SINGLE_TX,
  USDT_MAIN,
  TURBO_AI_MAIN,
  ORCA_MAIN,
  SOLAR_MAIN,
  TOKENS_PRICES_FROM_JUP
} from '@store/consts/static'
import { PoolWithAddress } from '@store/reducers/pools'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import {
  CoinGeckoAPIData,
  FormatNumberThreshold,
  FullSnap,
  IncentiveRewardData,
  PoolSnapshot,
  PrefixConfig,
  Token,
  TokenPriceData
} from '@store/consts/types'
import { sqrt } from '@invariant-labs/sdk-eclipse/lib/math'
import { Metaplex } from '@metaplex-foundation/js'
import { apyToApr } from './uiUtils'
import { LEADERBOARD_DECIMAL } from '@pages/LeaderboardPage/config'

export const transformBN = (amount: BN): string => {
  return (amount.div(new BN(1e2)).toNumber() / 1e4).toString()
}
export const printBN = (amount: BN, decimals: number): string => {
  const amountString = amount.toString()
  const isNegative = amountString.length > 0 && amountString[0] === '-'

  const balanceString = isNegative ? amountString.slice(1) : amountString

  if (balanceString.length <= decimals) {
    return (
      (isNegative ? '-' : '') + '0.' + '0'.repeat(decimals - balanceString.length) + balanceString
    )
  } else {
    return (
      (isNegative ? '-' : '') +
      trimZeros(
        balanceString.substring(0, balanceString.length - decimals) +
          '.' +
          balanceString.substring(balanceString.length - decimals)
      )
    )
  }
}

export const formatNumberWithCommas = (number: string) => {
  const trimmedNumber = number.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '')

  return trimmedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const removeAdditionalDecimals = (value: string, desiredDecimals: number): string => {
  const dotIndex = value.indexOf('.')
  if (dotIndex === -1) {
    return value
  }
  const decimals = value.length - dotIndex - 1
  if (decimals > desiredDecimals) {
    const sliced = value.slice(0, dotIndex + desiredDecimals + 1)
    const lastCommaIndex = sliced.lastIndexOf(',')

    if (lastCommaIndex === -1 || lastCommaIndex < dotIndex) {
      return sliced
    }

    return value.slice(0, lastCommaIndex) + value.slice(lastCommaIndex + 1, lastCommaIndex + 2)
  } else {
    return value
  }
}

export const trimZeros = (numStr: string): string => {
  if (!numStr) {
    return ''
  }
  return numStr
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/^0+(\d)|(\d)0+$/gm, '$1$2')
    .replace(/\.$/, '')
}
export const convertBalanceToBN = (amount: string, decimals: number): BN => {
  const balanceString = amount.split('.')
  if (balanceString.length !== 2) {
    return new BN(balanceString[0] + '0'.repeat(decimals))
  }
  if (balanceString[1].length <= decimals) {
    return new BN(
      balanceString[0] + balanceString[1] + '0'.repeat(decimals - balanceString[1].length)
    )
  }
  return new BN(0)
}
export interface ParsedBN {
  BN: BN
  decimal: number
}
export const stringToMinDecimalBN = (value: string): ParsedBN => {
  if (value.includes('.')) {
    const [before, after] = value.split('.')
    return {
      BN: new BN(`${before}${after}`),
      decimal: after.length || 0
    }
  }
  return {
    BN: new BN(value),
    decimal: 0
  }
}
export const capitalizeString = (str: string) => {
  if (!str) {
    return str
  }
  return str[0].toUpperCase() + str.substr(1).toLowerCase()
}

export const divUp = (a: BN, b: BN): BN => {
  return a.add(b.subn(1)).div(b)
}
export const divUpNumber = (a: number, b: number): number => {
  return Math.ceil(a / b)
}
export const removeTickerPrefix = (ticker: string, prefix: string[] = ['x', '$']): string => {
  const index = prefix.findIndex(p => ticker.startsWith(p))
  if (index && prefix[index]) {
    return ticker.substring(prefix[index].length)
  }
  return ticker
}

const defaultPrefixConfig: PrefixConfig = {
  B: 1000000000,
  M: 1000000,
  K: 10000
}

export const showPrefix = (nr: number, config: PrefixConfig = defaultPrefixConfig): string => {
  const abs = Math.abs(nr)

  if (typeof config.B !== 'undefined' && abs >= config.B) {
    return 'B'
  }

  if (typeof config.M !== 'undefined' && abs >= config.M) {
    return 'M'
  }

  if (typeof config.K !== 'undefined' && abs >= config.K) {
    return 'K'
  }

  return ''
}

export const defaultThresholds: FormatNumberThreshold[] = [
  {
    value: 10,
    decimals: 4
  },
  {
    value: 1000,
    decimals: 2
  },
  {
    value: 10000,
    decimals: 1
  },
  {
    value: 1000000,
    decimals: 2,
    divider: 1000
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

export const formatNumbers =
  (thresholds: FormatNumberThreshold[] = defaultThresholds) =>
  (value: string) => {
    const num = Number(value)
    const abs = Math.abs(num)
    const threshold = thresholds.sort((a, b) => a.value - b.value).find(thr => abs < thr.value)

    const formatted = threshold
      ? (abs / (threshold.divider ?? 1)).toFixed(threshold.decimals)
      : value

    return num < 0 && threshold ? '-' + formatted : formatted
  }

export const sqrtPriceToPrice = (sqrtPrice: BN) => {
  const price = sqrtPrice.mul(sqrtPrice)

  return price.div(PRICE_DENOMINATOR)
}

export const priceToSqrtPrice = (price: BN) => {
  return sqrt(price.mul(PRICE_DENOMINATOR))
}

export const calculateSqrtPriceFromBalance = (
  price: number,
  spacing: number,
  isXtoY: boolean,
  xDecimal: number,
  yDecimal: number
) => {
  const minTick = getMinTick(spacing)
  const maxTick = getMaxTick(spacing)

  const basePrice = Math.min(
    Math.max(
      price,
      Number(calcPriceByTickIndex(isXtoY ? minTick : maxTick, isXtoY, xDecimal, yDecimal))
    ),
    Number(calcPriceByTickIndex(isXtoY ? maxTick : minTick, isXtoY, xDecimal, yDecimal))
  )

  const primaryUnitsPrice = getPrimaryUnitsPrice(
    basePrice,
    isXtoY,
    Number(xDecimal),
    Number(yDecimal)
  )

  const parsedPrimaryUnits =
    primaryUnitsPrice > 1 && Number.isInteger(primaryUnitsPrice)
      ? primaryUnitsPrice.toString()
      : primaryUnitsPrice.toFixed(24)

  const priceBN = convertBalanceToBN(parsedPrimaryUnits, PRICE_SCALE)
  const sqrtPrice = priceToSqrtPrice(priceBN)

  const minSqrtPrice = calculatePriceSqrt(minTick)
  const maxSqrtPrice = calculatePriceSqrt(maxTick)

  let validatedSqrtPrice = sqrtPrice

  if (sqrtPrice.lt(minSqrtPrice)) {
    validatedSqrtPrice = minSqrtPrice
  } else if (sqrtPrice.gt(maxSqrtPrice)) {
    validatedSqrtPrice = maxSqrtPrice
  }

  return validatedSqrtPrice
}

export const findClosestIndexByValue = (arr: number[], value: number): number => {
  const high = arr.length - 1

  if (value < arr[0]) {
    return 0
  }

  if (value > arr[high]) {
    return high
  }

  for (let i = arr.length - 1; i >= 0; i--) {
    if (Number(arr[i].toFixed(0)) <= Number(value.toFixed(0))) {
      return i
    }
  }
  return high
}

export const calculateTickFromBalance = (
  price: number,
  spacing: number,
  isXtoY: boolean,
  xDecimal: number,
  yDecimal: number
) => {
  const minTick = getMinTick(spacing)
  const maxTick = getMaxTick(spacing)

  const basePrice = Math.max(
    price,
    calcPriceByTickIndex(isXtoY ? minTick : maxTick, isXtoY, xDecimal, yDecimal)
  )
  const primaryUnitsPrice = getPrimaryUnitsPrice(basePrice, isXtoY, xDecimal, yDecimal)
  const tick = Math.round(logBase(primaryUnitsPrice, 1.0001))

  return Math.max(Math.min(tick, getMaxTick(spacing)), getMinTick(spacing))
}

export const validConcentrationMidPriceTick = (
  midPriceTick: number,
  isXtoY: boolean,
  tickSpacing: number
) => {
  const minTick = getMinTick(tickSpacing)
  const maxTick = getMaxTick(tickSpacing)

  const parsedTickSpacing = Number(tickSpacing)
  const tickDelta = calculateTickDelta(parsedTickSpacing, 2, 2)

  const minTickLimit = minTick + (2 + tickDelta) * tickSpacing
  const maxTickLimit = maxTick - (2 + tickDelta) * tickSpacing

  if (isXtoY) {
    if (midPriceTick < minTickLimit) {
      return minTickLimit
    } else if (midPriceTick > maxTickLimit) {
      return maxTickLimit
    }
  } else {
    if (midPriceTick > maxTickLimit) {
      return maxTickLimit
    } else if (midPriceTick < minTickLimit) {
      return minTickLimit
    }
  }

  return midPriceTick
}

export const nearestPriceIndex = (price: number, data: Array<{ x: number; y: number }>) => {
  let nearest = 0

  for (let i = 1; i < data.length; i++) {
    if (Math.abs(data[i].x - price) < Math.abs(data[nearest].x - price)) {
      nearest = i
    }
  }

  return nearest
}

export const getScaleFromString = (value: string): number => {
  const parts = value.split('.')

  if ((parts?.length ?? 0) < 2) {
    return 0
  }

  return parts[1]?.length ?? 0
}

export const logBase = (x: number, b: number): number => Math.log(x) / Math.log(b)

export const calcYPerXPriceBySqrtPrice = (
  sqrtPrice: BN,
  xDecimal: number,
  yDecimal: number
): number => {
  const sqrt = +printBN(sqrtPrice, PRICE_DECIMAL)
  const proportion = sqrt * sqrt

  return proportion / 10 ** (yDecimal - xDecimal)
}

export const calcPriceBySqrtPrice = (
  sqrtPrice: BN,
  isXtoY: boolean,
  xDecimal: number,
  yDecimal: number
): number => {
  const price = calcYPerXPriceBySqrtPrice(sqrtPrice, xDecimal, yDecimal) ** (isXtoY ? 1 : -1)

  return price
}

export const calcYPerXPriceByTickIndex = (
  tickIndex: number,
  xDecimal: number,
  yDecimal: number
): number => {
  return calcYPerXPriceBySqrtPrice(calculatePriceSqrt(tickIndex), xDecimal, yDecimal)
}

export const spacingMultiplicityLte = (arg: number, spacing: number): number => {
  if (Math.abs(arg % spacing) === 0) {
    return arg
  }

  if (arg >= 0) {
    return arg - (arg % spacing)
  }

  return arg - (spacing - (Math.abs(arg) % spacing))
}

export const spacingMultiplicityGte = (arg: number, spacing: number): number => {
  if (Math.abs(arg % spacing) === 0) {
    return arg
  }

  if (arg >= 0) {
    return arg + (spacing - (arg % spacing))
  }

  return arg + (Math.abs(arg) % spacing)
}

export const createLiquidityPlot = (
  rawTicks: Tick[],
  pool: PoolStructure,
  isXtoY: boolean,
  tokenXDecimal: number,
  tokenYDecimal: number
) => {
  const sortedTicks = rawTicks.sort((a, b) => a.index - b.index)
  const parsedTicks = rawTicks.length ? parseLiquidityOnTicks(sortedTicks) : []

  const ticks = rawTicks.map((raw, index) => ({
    ...raw,
    liqudity: parsedTicks[index].liquidity
  }))

  const ticksData: PlotTickData[] = []

  const min = getMinTick(pool.tickSpacing)
  const max = getMaxTick(pool.tickSpacing)

  if (!ticks.length || ticks[0].index > min) {
    const minPrice = calcPriceByTickIndex(min, isXtoY, tokenXDecimal, tokenYDecimal)

    ticksData.push({
      x: minPrice,
      y: 0,
      index: min
    })
  }

  ticks.forEach((tick, i) => {
    if (i === 0 && tick.index - pool.tickSpacing > min) {
      const price = calcPriceByTickIndex(
        tick.index - pool.tickSpacing,
        isXtoY,
        tokenXDecimal,
        tokenYDecimal
      )
      ticksData.push({
        x: price,
        y: 0,
        index: tick.index - pool.tickSpacing
      })
    } else if (i > 0 && tick.index - pool.tickSpacing > ticks[i - 1].index) {
      const price = calcPriceByTickIndex(
        tick.index - pool.tickSpacing,
        isXtoY,
        tokenXDecimal,
        tokenYDecimal
      )
      ticksData.push({
        x: price,
        y: +printBN(ticks[i - 1].liqudity, DECIMAL),
        index: tick.index - pool.tickSpacing
      })
    }

    const price = calcPriceByTickIndex(tick.index, isXtoY, tokenXDecimal, tokenYDecimal)
    ticksData.push({
      x: price,
      y: +printBN(ticks[i].liqudity, DECIMAL),
      index: tick.index
    })
  })

  if (!ticks.length) {
    const maxPrice = calcPriceByTickIndex(max, isXtoY, tokenXDecimal, tokenYDecimal)

    ticksData.push({
      x: maxPrice,
      y: 0,
      index: max
    })
  } else if (ticks[ticks.length - 1].index < max) {
    if (max - ticks[ticks.length - 1].index > pool.tickSpacing) {
      const price = calcPriceByTickIndex(
        ticks[ticks.length - 1].index + pool.tickSpacing,
        isXtoY,
        tokenXDecimal,
        tokenYDecimal
      )
      ticksData.push({
        x: price,
        y: 0,
        index: ticks[ticks.length - 1].index + pool.tickSpacing
      })
    }

    const maxPrice = calcPriceByTickIndex(max, isXtoY, tokenXDecimal, tokenYDecimal)

    ticksData.push({
      x: maxPrice,
      y: 0,
      index: max
    })
  }

  return isXtoY ? ticksData : ticksData.reverse()
}
export const parseLiquidityOnUserTicks = (
  ticks: { index: number; liquidityChange: BN; sign: boolean }[]
) => {
  let currentLiquidity = new BN(0)

  return ticks.map(tick => {
    currentLiquidity = currentLiquidity.add(tick.liquidityChange.muln(tick.sign ? 1 : -1))
    return {
      liquidity: currentLiquidity,
      index: tick.index
    }
  })
}

export const getLiquidityTicksByPositionsList = (
  pool: PoolWithAddress,
  positions: PositionWithAddress[],
  isXtoY: boolean,
  tokenXDecimal: number,
  tokenYDecimal: number
): PlotTickData[] => {
  const minTick = getMinTick(pool.tickSpacing)
  const maxTick = getMaxTick(pool.tickSpacing)

  const userTickIndexes: { index: number; liquidity: BN }[] = []

  positions.forEach(position => {
    if (position.pool.equals(pool.address)) {
      const lowerTickIndex = position.lowerTickIndex
      const upperTickIndex = position.upperTickIndex
      userTickIndexes.push({ index: lowerTickIndex, liquidity: position.liquidity })
      userTickIndexes.push({ index: upperTickIndex, liquidity: position.liquidity })
    }
  })

  const newTicks: { index: number; liquidityChange: BN; sign: boolean }[] = []

  userTickIndexes.forEach(userTick => {
    const [liquidityChange, sign] = userTick.liquidity.gt(new BN(0))
      ? [userTick.liquidity, true]
      : [userTick.liquidity.neg(), false]

    if (!liquidityChange.eq(new BN(0))) {
      newTicks.push({ index: userTick.index, liquidityChange, sign })
    }
  })
  const parsedTicks = parseLiquidityOnUserTicks(newTicks)

  const ticksData: PlotTickData[] = []

  parsedTicks.forEach((tick, i) => {
    if (i === 0 && tick.index - pool.tickSpacing > minTick) {
      const price = calcPriceByTickIndex(
        tick.index - pool.tickSpacing,
        isXtoY,
        tokenXDecimal,
        tokenYDecimal
      )
      ticksData.push({
        x: price,
        y: 0,
        index: tick.index - pool.tickSpacing
      })
    } else if (i > 0 && tick.index - pool.tickSpacing > parsedTicks[i - 1].index) {
      const price = calcPriceByTickIndex(
        tick.index - pool.tickSpacing,
        isXtoY,
        tokenXDecimal,
        tokenYDecimal
      )

      ticksData.push({
        x: price,
        y: +printBN(parsedTicks[i - 1].liquidity, DECIMAL),
        index: tick.index - pool.tickSpacing
      })
    }

    const price = calcPriceByTickIndex(tick.index, isXtoY, tokenXDecimal, tokenYDecimal)

    ticksData.push({
      x: price,
      y: +printBN(parsedTicks[i].liquidity, DECIMAL),
      index: tick.index
    })
  })

  const sortedTicks = ticksData.sort((a, b) => a.index - b.index)

  if (sortedTicks.length !== 0 && sortedTicks[0].index > minTick) {
    const minPrice = calcPriceByTickIndex(minTick, isXtoY, tokenXDecimal, tokenYDecimal)

    sortedTicks.unshift({
      x: minPrice,
      y: 0,
      index: minTick
    })
  }
  if (sortedTicks.length !== 0 && sortedTicks[sortedTicks.length - 1].index < maxTick) {
    const maxPrice = calcPriceByTickIndex(maxTick, isXtoY, tokenXDecimal, tokenYDecimal)

    sortedTicks.push({
      x: maxPrice,
      y: 0,
      index: maxTick
    })
  }

  return sortedTicks
}

export const numberToString = (number: number | bigint | string): string => {
  if (typeof number === 'bigint') {
    return number.toString()
  }

  const numStr = String(number)

  if (numStr.includes('e')) {
    const [base, exp] = numStr.split('e')
    const exponent = parseInt(exp, 10)

    if (exponent < 0) {
      const decimalPlaces = Math.abs(exponent) + base.replace('.', '').length - 1
      return Number(number).toFixed(decimalPlaces)
    }

    return Number(number).toString()
  }

  return numStr
}

export const containsOnlyZeroes = (string: string): boolean => {
  return /^(?!.*[1-9]).*$/.test(string)
}

export const printSubNumber = (amount: number): string => {
  return Array.from(String(amount))
    .map(char => subNumbers[+char])
    .join('')
}

export const formatNumber = (
  number: number | bigint | string,
  noDecimals?: boolean,
  decimalsAfterDot: number = 3
): string => {
  const numberAsNumber = Number(number)
  const isNegative = numberAsNumber < 0
  const absNumberAsNumber = Math.abs(numberAsNumber)

  const absNumberAsString = numberToString(absNumberAsNumber)

  if (containsOnlyZeroes(absNumberAsString)) {
    return '0'
  }

  const [beforeDot, afterDot] = absNumberAsString.split('.')

  let formattedNumber

  if (Math.abs(numberAsNumber) >= FormatConfig.Q) {
    const formattedDecimals = noDecimals
      ? ''
      : (FormatConfig.DecimalsAfterDot ? '.' : '') +
        (beforeDot.slice(-FormatConfig.QDecimals) + (afterDot ? afterDot : '')).slice(
          0,
          FormatConfig.DecimalsAfterDot
        )

    formattedNumber =
      beforeDot.slice(0, -FormatConfig.QDecimals) + (noDecimals ? '' : formattedDecimals) + 'Q'
  } else if (Math.abs(numberAsNumber) >= FormatConfig.T) {
    const formattedDecimals = noDecimals
      ? ''
      : (FormatConfig.DecimalsAfterDot ? '.' : '') +
        (beforeDot.slice(-FormatConfig.TDecimals) + (afterDot ? afterDot : '')).slice(
          0,
          FormatConfig.DecimalsAfterDot
        )

    formattedNumber =
      beforeDot.slice(0, -FormatConfig.TDecimals) + (noDecimals ? '' : formattedDecimals) + 'T'
  } else if (Math.abs(numberAsNumber) >= FormatConfig.H) {
    const formattedDecimals = noDecimals
      ? ''
      : (FormatConfig.DecimalsAfterDot ? '.' : '') +
        (beforeDot.slice(-FormatConfig.HDecimals) + (afterDot ? afterDot : '')).slice(
          0,
          FormatConfig.DecimalsAfterDot
        )

    formattedNumber =
      beforeDot.slice(0, -FormatConfig.HDecimals) + (noDecimals ? '' : formattedDecimals) + 'H'
  } else if (Math.abs(numberAsNumber) >= FormatConfig.Tr) {
    const formattedDecimals = noDecimals
      ? ''
      : (FormatConfig.DecimalsAfterDot ? '.' : '') +
        (beforeDot.slice(-FormatConfig.TrDecimals) + (afterDot ? afterDot : '')).slice(
          0,
          FormatConfig.DecimalsAfterDot
        )

    formattedNumber =
      beforeDot.slice(0, -FormatConfig.TrDecimals) + (noDecimals ? '' : formattedDecimals) + 'Tr'
  } else if (Math.abs(numberAsNumber) >= FormatConfig.HTr) {
    const formattedDecimals = noDecimals
      ? ''
      : (FormatConfig.DecimalsAfterDot ? '.' : '') +
        (beforeDot.slice(-FormatConfig.HTrDecimals) + (afterDot ? afterDot : '')).slice(
          0,
          FormatConfig.DecimalsAfterDot
        )

    formattedNumber =
      beforeDot.slice(0, -FormatConfig.HTrDecimals) + (noDecimals ? '' : formattedDecimals) + 'HTr'
  } else if (Math.abs(numberAsNumber) >= FormatConfig.B) {
    const formattedDecimals = noDecimals
      ? ''
      : (FormatConfig.DecimalsAfterDot ? '.' : '') +
        (beforeDot.slice(-FormatConfig.BDecimals) + (afterDot ? afterDot : '')).slice(
          0,
          FormatConfig.DecimalsAfterDot
        )

    formattedNumber =
      beforeDot.slice(0, -FormatConfig.BDecimals) + (noDecimals ? '' : formattedDecimals) + 'B'
  } else if (Math.abs(numberAsNumber) >= FormatConfig.M) {
    const formattedDecimals = noDecimals
      ? ''
      : (FormatConfig.DecimalsAfterDot ? '.' : '') +
        (beforeDot.slice(-FormatConfig.MDecimals) + (afterDot ? afterDot : '')).slice(
          0,
          FormatConfig.DecimalsAfterDot
        )
    formattedNumber =
      beforeDot.slice(0, -FormatConfig.MDecimals) + (noDecimals ? '' : formattedDecimals) + 'M'
  } else if (Math.abs(numberAsNumber) >= FormatConfig.K) {
    const formattedDecimals = noDecimals
      ? ''
      : (FormatConfig.DecimalsAfterDot ? '.' : '') +
        (beforeDot.slice(-FormatConfig.KDecimals) + (afterDot ? afterDot : '')).slice(
          0,
          FormatConfig.DecimalsAfterDot
        )
    formattedNumber =
      beforeDot.slice(0, -FormatConfig.KDecimals) + (noDecimals ? '' : formattedDecimals) + 'K'
  } else if (afterDot && countLeadingZeros(afterDot) <= decimalsAfterDot) {
    const roundedNumber = numberAsNumber
      .toFixed(countLeadingZeros(afterDot) + decimalsAfterDot + 1)
      .slice(0, -1)

    formattedNumber = trimZeros(roundedNumber)
  } else {
    const leadingZeros = afterDot ? countLeadingZeros(afterDot) : 0

    const parsedAfterDot =
      String(parseInt(afterDot)).length > decimalsAfterDot
        ? String(parseInt(afterDot)).slice(0, decimalsAfterDot)
        : afterDot

    if (parsedAfterDot) {
      formattedNumber =
        beforeDot +
        '.' +
        (parsedAfterDot
          ? leadingZeros > decimalsAfterDot
            ? '0' + printSubNumber(leadingZeros) + trimZeros(parsedAfterDot)
            : trimZeros(parsedAfterDot)
          : '')
    } else {
      formattedNumber = beforeDot
    }
  }

  return isNegative ? '-' + formattedNumber : formattedNumber
}
export const formatBalance = (number: number | bigint | string): string => {
  const numberAsString = numberToString(number)

  const [beforeDot, afterDot] = numberAsString.split('.')

  return beforeDot.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (afterDot ? '.' + afterDot : '')
}

export const countLeadingZeros = (str: string): number => {
  return (str.match(/^0+/) || [''])[0].length
}

export const createPlaceholderLiquidityPlot = (
  isXtoY: boolean,
  yValueToFill: number,
  tickSpacing: number,
  tokenXDecimal: number,
  tokenYDecimal: number
) => {
  const ticksData: PlotTickData[] = []

  const min = getMinTick(tickSpacing)
  const max = getMaxTick(tickSpacing)

  const minPrice = calcPriceByTickIndex(min, isXtoY, tokenXDecimal, tokenYDecimal)

  ticksData.push({
    x: minPrice,
    y: yValueToFill,
    index: min
  })

  const maxPrice = calcPriceByTickIndex(max, isXtoY, tokenXDecimal, tokenYDecimal)

  ticksData.push({
    x: maxPrice,
    y: yValueToFill,
    index: max
  })

  return isXtoY ? ticksData : ticksData.reverse()
}

export const getNetworkTokensList = (networkType: NetworkType): Record<string, Token> => {
  // const obj: Record<string, Token> = {}
  switch (networkType) {
    case NetworkType.Mainnet:
      // ;(mainnetList as any[]).forEach(token => {
      //   obj[token.address] = {
      //     ...token,
      //     address: new PublicKey(token.address),
      //     coingeckoId: token?.extensions?.coingeckoId
      //   }
      // })
      // return obj
      return {
        [WETH_TEST.address.toString()]: WETH_TEST,
        [MOCKED_TOKEN_MAIN.address.toString()]: MOCKED_TOKEN_MAIN,
        [TETH_MAIN.address.toString()]: TETH_MAIN,
        [USDC_MAIN.address.toString()]: USDC_MAIN,
        [USDT_MAIN.address.toString()]: USDT_MAIN,
        [SOL_MAIN.address.toString()]: SOL_MAIN,
        [DOGWIFHAT_MAIN.address.toString()]: DOGWIFHAT_MAIN,
        [LAIKA_MAIN.address.toString()]: LAIKA_MAIN,
        [MOON_MAIN.address.toString()]: MOON_MAIN,
        [GSVM_MAIN.address.toString()]: GSVM_MAIN,
        [DARKMOON_MAIN.address.toString()]: DARKMOON_MAIN,
        [ECAT_MAIN.address.toString()]: ECAT_MAIN,
        [TURBO_MAIN.address.toString()]: TURBO_MAIN,
        [MOO_MAIN.address.toString()]: MOO_MAIN,
        [EBULL_MAIN.address.toString()]: EBULL_MAIN,
        [EGOAT_MAIN.address.toString()]: EGOAT_MAIN,
        [DOGO_MAIN.address.toString()]: DOGO_MAIN,
        [PUNKSTAR_MAIN.address.toString()]: PUNKSTAR_MAIN,
        [AI16Z_MAIN.address.toString()]: AI16Z_MAIN,
        [VLR_MAIN.address.toString()]: VLR_MAIN,
        [TIA_MAIN.address.toString()]: TIA_MAIN,
        [STTIA_MAIN.address.toString()]: STTIA_MAIN,
        [BRICK_MAIN.address.toString()]: BRICK_MAIN,
        [PANTY_MAIN.address.toString()]: PANTY_MAIN,
        [PODAVINI_MAIN.address.toString()]: PODAVINI_MAIN,
        [DOGW_MAIN.address.toString()]: DOGW_MAIN,
        [TURBO_AI_MAIN.address.toString()]: TURBO_AI_MAIN,
        [ORCA_MAIN.address.toString()]: ORCA_MAIN,
        [SOLAR_MAIN.address.toString()]: SOLAR_MAIN
      }
    case NetworkType.Devnet:
      return {
        [USDC_DEV.address.toString()]: USDC_DEV,
        [BTC_DEV.address.toString()]: BTC_DEV,
        [WETH_DEV.address.toString()]: WETH_DEV
      }
    case NetworkType.Testnet:
      return {
        [USDC_TEST.address.toString()]: USDC_TEST,
        [BTC_TEST.address.toString()]: BTC_TEST,
        [WETH_TEST.address.toString()]: WETH_TEST,
        [MOON_TEST.address.toString()]: MOON_TEST,
        [S22_TEST.address.toString()]: S22_TEST
      }
    default:
      return {}
  }
}

export const getPrimaryUnitsPrice = (
  price: number,
  isXtoY: boolean,
  xDecimal: number,
  yDecimal: number
) => {
  const xToYPrice = isXtoY ? price : 1 / price

  return xToYPrice * 10 ** (yDecimal - xDecimal)
}

export const nearestSpacingMultiplicity = (arg: number, spacing: number) => {
  const greater = spacingMultiplicityGte(arg, spacing)
  const lower = spacingMultiplicityLte(arg, spacing)

  const nearest = Math.abs(greater - arg) < Math.abs(lower - arg) ? greater : lower

  return Math.max(Math.min(nearest, getMaxTick(spacing)), getMinTick(spacing))
}

export const nearestTickIndex = (
  price: number,
  spacing: number,
  isXtoY: boolean,
  xDecimal: number,
  yDecimal: number
) => {
  const base = Math.max(
    price,
    calcPriceByTickIndex(isXtoY ? MIN_TICK : MAX_TICK, isXtoY, xDecimal, yDecimal)
  )
  const primaryUnitsPrice = getPrimaryUnitsPrice(base, isXtoY, xDecimal, yDecimal)
  const log = Math.round(logBase(primaryUnitsPrice, 1.0001))
  return nearestSpacingMultiplicity(log, spacing)
}

export const calcTicksAmountInRange = (
  min: number,
  max: number,
  tickSpacing: number,
  isXtoY: boolean,
  xDecimal: number,
  yDecimal: number
): number => {
  const primaryUnitsMin = getPrimaryUnitsPrice(min, isXtoY, xDecimal, yDecimal)
  const primaryUnitsMax = getPrimaryUnitsPrice(max, isXtoY, xDecimal, yDecimal)
  const minIndex = logBase(primaryUnitsMin, 1.0001)
  const maxIndex = logBase(primaryUnitsMax, 1.0001)

  return Math.ceil(Math.abs(maxIndex - minIndex) / tickSpacing)
}

export const calcPriceByTickIndex = (
  index: number,
  isXtoY: boolean,
  xDecimal: number,
  yDecimal: number
) => {
  const price = calcYPerXPriceBySqrtPrice(calculatePriceSqrt(index), xDecimal, yDecimal)

  return isXtoY ? price : price !== 0 ? 1 / price : Number.MAX_SAFE_INTEGER
}

export const findPoolIndex = (address: PublicKey, pools: PoolWithAddress[]) => {
  return pools.findIndex(pool => pool.address.equals(address))
}

export const findPairIndex = (
  fromToken: PublicKey,
  toToken: PublicKey,
  pools: PoolWithAddress[]
) => {
  return pools.findIndex(
    pool =>
      (fromToken.equals(pool.tokenX) && toToken.equals(pool.tokenY)) ||
      (fromToken.equals(pool.tokenY) && toToken.equals(pool.tokenX))
  )
}

export const findPairs = (tokenFrom: PublicKey, tokenTo: PublicKey, pairs: PoolWithAddress[]) => {
  return pairs.filter(
    pool =>
      (tokenFrom.equals(pool.tokenX) && tokenTo.equals(pool.tokenY)) ||
      (tokenFrom.equals(pool.tokenY) && tokenTo.equals(pool.tokenX))
  )
}

export const calcCurrentPriceOfPool = (
  pool: PoolWithAddress,
  xDecimal: number,
  yDecimal: number
) => {
  const decimalDiff = PRICE_DECIMAL + (xDecimal - yDecimal)
  const sqrtPricePow: number =
    +printBN(pool.sqrtPrice, PRICE_DECIMAL) * +printBN(pool.sqrtPrice, PRICE_DECIMAL)

  const knownPrice: BN = new BN(sqrtPricePow * 10 ** decimalDiff)

  return convertBalanceToBN(knownPrice.toString(), 0)
}

export const handleSimulate = async (
  pools: PoolWithAddress[],
  poolTicks: { [key in string]: Tick[] },
  tickmaps: { [key in string]: Tickmap },
  slippage: BN,
  fromToken: PublicKey,
  toToken: PublicKey,
  amount: BN,
  byAmountIn: boolean
): Promise<{
  amountOut: BN
  poolIndex: number
  AmountOutWithFee: BN
  estimatedPriceAfterSwap: BN
  minimumReceived: BN
  priceImpact: BN
  error: string[]
}> => {
  const filteredPools = findPairs(fromToken, toToken, pools)
  const errorMessage: string[] = []
  let isXtoY = false
  let result
  let okChanges = 0
  let failChanges = 0
  const initAmountOut = byAmountIn ? new BN(-1) : MAX_U64

  let successData = {
    amountOut: initAmountOut,
    poolIndex: 0,
    AmountOutWithFee: new BN(0),
    estimatedPriceAfterSwap: new BN(0),
    minimumReceived: new BN(0),
    priceImpact: new BN(0)
  }

  let allFailedData = {
    amountOut: initAmountOut,
    poolIndex: 0,
    AmountOutWithFee: new BN(0),
    estimatedPriceAfterSwap: new BN(0),
    minimumReceived: new BN(0),
    priceImpact: new BN(0)
  }

  if (amount.eq(new BN(0))) {
    return {
      amountOut: new BN(0),
      poolIndex: 0,
      AmountOutWithFee: new BN(0),
      estimatedPriceAfterSwap: new BN(0),
      minimumReceived: new BN(0),
      priceImpact: new BN(0),
      error: errorMessage
    }
  }

  for (const pool of filteredPools) {
    isXtoY = fromToken.equals(pool.tokenX)

    const ticks: Map<number, Tick> = new Map<number, Tick>()
    const poolTicksForAddress = poolTicks[pool.address.toString()]
    if (Array.isArray(poolTicksForAddress)) {
      for (const tick of poolTicksForAddress) {
        ticks.set(tick.index, tick)
      }
    } else {
      errorMessage.push(`Ticks not available for pool ${pool.address.toString()}`)
      continue // Move to the next pool
    }
    const maxCrosses =
      pool.tokenX.toString() === WRAPPED_ETH_ADDRESS ||
      pool.tokenY.toString() === WRAPPED_ETH_ADDRESS
        ? MAX_CROSSES_IN_SINGLE_TX
        : TICK_CROSSES_PER_IX

    try {
      const swapSimulateResult = simulateSwap({
        xToY: isXtoY,
        byAmountIn: byAmountIn,
        swapAmount: amount,
        slippage: slippage,
        pool: pool,
        ticks: ticks,
        tickmap: tickmaps[pool.tickmap.toString()],
        maxCrosses,
        maxVirtualCrosses: TICK_VIRTUAL_CROSSES_PER_IX
      })

      if (!byAmountIn) {
        result = swapSimulateResult.accumulatedAmountIn.add(swapSimulateResult.accumulatedFee)
      } else {
        result = swapSimulateResult.accumulatedAmountOut
      }
      if (
        (byAmountIn ? successData.amountOut.lt(result) : successData.amountOut.gt(result)) &&
        swapSimulateResult.status === SimulationStatus.Ok &&
        swapSimulateResult.amountPerTick.length <= TICK_CROSSES_PER_IX
      ) {
        successData = {
          amountOut: result,
          poolIndex: findPoolIndex(pool.address, pools),
          AmountOutWithFee: result.add(swapSimulateResult.accumulatedFee),
          estimatedPriceAfterSwap: swapSimulateResult.priceAfterSwap,
          minimumReceived: swapSimulateResult.minReceived,
          priceImpact: swapSimulateResult.priceImpact
        }

        okChanges += 1
      } else if (
        byAmountIn
          ? allFailedData.amountOut.lt(result)
          : allFailedData.amountOut.eq(MAX_U64)
            ? result
            : allFailedData.amountOut.lt(result)
      ) {
        allFailedData = {
          amountOut: result,
          poolIndex: findPoolIndex(pool.address, pools),
          AmountOutWithFee: result.add(swapSimulateResult.accumulatedFee),
          estimatedPriceAfterSwap: swapSimulateResult.priceAfterSwap,
          minimumReceived: swapSimulateResult.minReceived,
          priceImpact: swapSimulateResult.priceImpact
        }

        failChanges += 1
      }

      if (swapSimulateResult.status !== SimulationStatus.Ok) {
        errorMessage.push(swapSimulateResult.status)
      }
    } catch (err: any) {
      errorMessage.push(err.toString())
    }
  }
  if (okChanges === 0 && failChanges === 0) {
    return {
      amountOut: new BN(0),
      poolIndex: 0,
      AmountOutWithFee: new BN(0),
      estimatedPriceAfterSwap: new BN(0),
      minimumReceived: new BN(0),
      priceImpact: new BN(0),
      error: errorMessage
    }
  }

  if (okChanges === 0) {
    return {
      ...allFailedData,
      error: errorMessage
    }
  }

  return {
    ...successData,
    error: []
  }
}

export const toMaxNumericPlaces = (num: number, places: number): string => {
  const log = Math.floor(Math.log10(num))

  if (log >= places) {
    return num.toFixed(0)
  }

  if (log >= 0) {
    return num.toFixed(places - log - 1)
  }

  return num.toFixed(places + Math.abs(log) - 1)
}

export const getNetworkStats = async (name: string): Promise<Record<string, PoolSnapshot[]>> => {
  const { data } = await axios.get<Record<string, PoolSnapshot[]>>(
    `https://stats.invariant.app/full/eclipse-${name}`
  )

  return data
}

export const getPoolsFromAddresses = async (
  addresses: PublicKey[],
  marketProgram: Market
): Promise<PoolWithAddress[]> => {
  try {
    const pools = (await marketProgram.program.account.pool.fetchMultiple(
      addresses
    )) as Array<RawPoolStructure | null>

    return pools
      .filter(pool => !!pool)
      .map((pool, index) => {
        return {
          ...parsePool(pool),
          address: addresses[index]
        }
      }) as PoolWithAddress[]
  } catch (error) {
    console.log(error)
    return []
  }
}

export const getPools = async (
  pairs: Pair[],
  marketProgram: Market
): Promise<PoolWithAddress[]> => {
  try {
    const addresses: PublicKey[] = await Promise.all(
      pairs.map(async pair => await pair.getAddress(marketProgram.program.programId))
    )

    return await getPoolsFromAddresses(addresses, marketProgram)
  } catch (error) {
    console.log(error)
    return []
  }
}

// export const getCoingeckoPricesData = async (
//   ids: string[]
// ): Promise<Record<string, CoingeckoPriceData>> => {
//   const requests: Array<Promise<AxiosResponse<CoingeckoApiPriceData[]>>> = []
//   for (let i = 0; i < ids.length; i += 250) {
//     const idsSlice = ids.slice(i, i + 250)
//     let idsList = ''
//     idsSlice.forEach((id, index) => {
//       idsList += id + (index < 249 ? ',' : '')
//     })
//     requests.push(
//       axios.get<CoingeckoApiPriceData[]>(
//         `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsList}&per_page=250`
//       )
//     )
//   }

//   return await Promise.all(requests).then(responses => {
//     let concatRes: CoingeckoApiPriceData[] = []
//     responses
//       .map(res => res.data)
//       .forEach(data => {
//         concatRes = [...concatRes, ...data]
//       })

//     const data: Record<string, CoingeckoPriceData> = {}

//     concatRes.forEach(({ id, current_price, price_change_percentage_24h }) => {
//       data[id] = {
//         price: current_price ?? 0,
//         priceChange: price_change_percentage_24h ?? 0
//       }
//     })

//     return data
//   })
// }

export const trimLeadingZeros = (amount: string): string => {
  const amountParts = amount.split('.')

  if (!amountParts.length) {
    return '0'
  }

  if (amountParts.length === 1) {
    return amountParts[0]
  }

  const reversedDec = Array.from(amountParts[1]).reverse()
  const firstNonZero = reversedDec.findIndex(char => char !== '0')

  if (firstNonZero === -1) {
    return amountParts[0]
  }

  const trimmed = reversedDec.slice(firstNonZero, reversedDec.length).reverse().join('')

  return `${amountParts[0]}.${trimmed}`
}

export const calculateConcentrationRange = (
  tickSpacing: number,
  concentration: number,
  minimumRange: number,
  currentTick: number,
  isXToY: boolean
) => {
  const tickDelta = calculateTickDelta(tickSpacing, minimumRange, concentration)
  const lowerTick = currentTick - (minimumRange / 2 + tickDelta) * tickSpacing
  const upperTick = currentTick + (minimumRange / 2 + tickDelta) * tickSpacing

  return {
    leftRange: isXToY ? lowerTick : upperTick,
    rightRange: isXToY ? upperTick : lowerTick
  }
}

export enum PositionTokenBlock {
  None,
  A,
  B
}

export const determinePositionTokenBlock = (
  currentSqrtPrice: BN,
  lowerTick: number,
  upperTick: number,
  isXtoY: boolean
) => {
  const lowerPrice = calculatePriceSqrt(lowerTick)
  const upperPrice = calculatePriceSqrt(upperTick)

  if (lowerPrice.gte(currentSqrtPrice)) {
    return isXtoY ? PositionTokenBlock.B : PositionTokenBlock.A
  }

  if (upperPrice.lte(currentSqrtPrice)) {
    return isXtoY ? PositionTokenBlock.A : PositionTokenBlock.B
  }

  return PositionTokenBlock.None
}

export const generateUnknownTokenDataObject = (
  address: PublicKey,
  decimals: number,
  tokenProgram?: PublicKey
): Token => ({
  tokenProgram,
  address,
  decimals,
  symbol: `${address.toString().slice(0, 2)}...${address.toString().slice(-4)}`,
  name: address.toString(),
  logoURI: '/unknownToken.svg',
  isUnknown: true
})

export const getTokenProgramId = async (
  connection: Connection,
  address: PublicKey
): Promise<PublicKey> => {
  return await getTokenProgramAddress(connection, address)
}

export const getFullNewTokensData = async (
  addresses: PublicKey[],
  connection: Connection
): Promise<Record<string, Token>> => {
  const promises: Promise<[PublicKey, Mint]>[] = addresses.map(async address => {
    const programId = await getTokenProgramId(connection, address)

    return [programId, await getMint(connection, address, undefined, programId)] as [
      PublicKey,
      Mint
    ]
  })

  const tokens: Record<string, Token> = {}

  const results = await Promise.allSettled(promises)

  for (const [index, result] of results.entries()) {
    const [programId, decimals] =
      result.status === 'fulfilled' ? [result.value[0], result.value[1].decimals] : [undefined, 6]

    tokens[addresses[index].toString()] = await getTokenMetadata(
      connection,
      addresses[index].toString(),
      decimals,
      programId
    )
  }

  return tokens
}

export const addNewTokenToLocalStorage = (address: string, network: NetworkType) => {
  const currentListStr = localStorage.getItem(`CUSTOM_TOKENS_${network}`)

  const currentList = currentListStr !== null ? JSON.parse(currentListStr) : []

  currentList.push(address)

  localStorage.setItem(`CUSTOM_TOKENS_${network}`, JSON.stringify([...new Set(currentList)]))
}

export async function getTokenMetadata(
  connection: Connection,
  address: string,
  decimals: number,
  tokenProgram?: PublicKey
): Promise<Token> {
  const mintAddress = new PublicKey(address)

  try {
    const metaplex = new Metaplex(connection)

    const nft = await metaplex.nfts().findByMint({ mintAddress })

    const irisTokenData = await axios.get<any>(nft.uri).then(res => res.data)

    return {
      tokenProgram,
      address: mintAddress,
      decimals,
      symbol:
        nft?.symbol || irisTokenData?.symbol || `${address.slice(0, 2)}...${address.slice(-4)}`,
      name: nft?.name || irisTokenData?.name || address,
      logoURI: nft?.json?.image || irisTokenData?.image || '/unknownToken.svg',
      isUnknown: true
    }
  } catch (error) {
    return {
      tokenProgram,
      address: mintAddress,
      decimals,
      symbol: `${address.slice(0, 2)}...${address.slice(-4)}`,
      name: address,
      logoURI: '/unknownToken.svg',
      isUnknown: true
    }
  }
}

export const getNewTokenOrThrow = async (
  address: string,
  connection: Connection
): Promise<Record<string, Token>> => {
  const key = new PublicKey(address)
  const programId = await getTokenProgramId(connection, key)

  const info = await getMint(connection, key, undefined, programId)

  console.log(info)

  const tokenData = await getTokenMetadata(connection, address, info.decimals, programId)

  return {
    [address.toString()]: tokenData
  }
}

export const stringToFixed = (
  string: string,
  numbersAfterDot: number,
  trimZeros?: boolean
): string => {
  const toFixedString = string.includes('.')
    ? string.slice(0, string.indexOf('.') + 1 + numbersAfterDot)
    : string

  if (trimZeros) {
    return trimDecimalZeros(toFixedString)
  } else {
    return toFixedString
  }
}

export const tickerToAddress = (network: NetworkType, ticker: string): string | null => {
  try {
    return getAddressTickerMap(network)[ticker].toString()
  } catch (error) {
    return ticker
  }
}

export const addressToTicker = (network: NetworkType, address: string): string => {
  return getReversedAddressTickerMap(network)[address] || address
}

export const initialXtoY = (tokenXAddress?: string | null, tokenYAddress?: string | null) => {
  if (!tokenXAddress || !tokenYAddress) {
    return true
  }

  const tokenXIndex = ADDRESSES_TO_REVERT_TOKEN_PAIRS.findIndex(token => token === tokenXAddress)
  const tokenYIndex = ADDRESSES_TO_REVERT_TOKEN_PAIRS.findIndex(token => token === tokenYAddress)

  return tokenXIndex < tokenYIndex
}

export const parseFeeToPathFee = (fee: BN): string => {
  const parsedFee = (fee / Math.pow(10, 8)).toString().padStart(3, '0')
  return parsedFee.slice(0, parsedFee.length - 2) + '_' + parsedFee.slice(parsedFee.length - 2)
}

export const parsePathFeeToFeeString = (pathFee: string): string => {
  return (+pathFee.replace('_', '') * Math.pow(10, 8)).toString()
}

export const randomNumberFromRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// TODO: commented until eclipse staker sdk will be available
// export const getUserStakesForFarm = async (
//   stakerProgram: Staker,
//   incentive: PublicKey,
//   pool: PublicKey,
//   ids: BN[],
//   positionsAdresses: PublicKey[]
// ) => {
//   const promises = ids.map(async id => {
//     const [userStakeAddress] = await stakerProgram.getUserStakeAddressAndBump(incentive, pool, id)

//     return userStakeAddress
//   })

//   const addresses = await Promise.all(promises)

//   const stakes = await stakerProgram.program.account.userStake.fetchMultiple(addresses)

//   const fullStakes: ExtendedStake[] = []

//   stakes.forEach((stake, index) => {
//     if (stake !== null) {
//       fullStakes.push({
//         ...(stake as Stake),
//         address: addresses[index],
//         position: positionsAdresses[index]
//       })
//     }
//   })

//   return fullStakes
// }

export const getPositionsForPool = async (marketProgram: Market, pool: PublicKey) => {
  return (
    await marketProgram.program.account.position.all([
      {
        memcmp: { bytes: bs58.encode(pool.toBuffer()), offset: 40 }
      }
    ])
  ).map(({ account, publicKey }) => ({
    ...parsePosition(account),
    address: publicKey
  })) as PositionWithAddress[]
}

export const getPositionsAddressesFromRange = async (
  marketProgram: Market,
  owner: PublicKey,
  lowerIndex: number,
  upperIndex: number
) => {
  const promises: Array<{
    positionAddress: PublicKey
    positionBump: number
  }> = []

  for (let i = lowerIndex; i <= upperIndex; i++) {
    promises.push(marketProgram.getPositionAddress(owner, i))
  }

  return await Promise.all(promises).then(data =>
    data.map(({ positionAddress }) => positionAddress)
  )
}

// TODO: commented until eclipse bonds sdk will be available
// export const calculateEstBondPriceForQuoteAmount = (bondSale: BondSaleStruct, amount: BN) => {
//   let lowerBondAmount = new BN(0)
//   let upperBondAmount = MAX_U64
//   let price = calculateSellPrice(bondSale, upperBondAmount)

//   while (upperBondAmount.sub(lowerBondAmount).abs().gt(new BN(1))) {
//     const middleBondAmount = upperBondAmount.add(lowerBondAmount).div(new BN(2))
//     price = calculateSellPrice(bondSale, middleBondAmount)
//     const middleQuoteAmount = middleBondAmount.mul(price).div(new BN(10 ** DECIMAL))

//     if (middleQuoteAmount.sub(amount).abs().lte(new BN(1))) {
//       break
//     }

//     if (middleQuoteAmount.lt(amount)) {
//       lowerBondAmount = middleBondAmount
//     } else {
//       upperBondAmount = middleBondAmount
//     }
//   }

//   return price
// }

// export const calculateBondPrice = (bondSale: BondSaleStruct, amount: BN, byAmountBond: boolean) =>
//   byAmountBond
//     ? calculateSellPrice(bondSale, amount)
//     : calculateEstBondPriceForQuoteAmount(bondSale, amount)

export const thresholdsWithTokenDecimal = (decimals: number): FormatNumberThreshold[] => [
  {
    value: 10,
    decimals
  },
  {
    value: 100,
    decimals: 4
  },
  {
    value: 1000,
    decimals: 2
  },
  {
    value: 10000,
    decimals: 1
  },
  {
    value: 1000000,
    decimals: 2,
    divider: 1000
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

export const getMockedTokenPrice = (symbol: string, network: NetworkType): TokenPriceData => {
  const sufix = network === NetworkType.Devnet ? '_DEV' : '_TEST'
  const prices = tokensPrices[network]
  switch (symbol) {
    case 'BTC':
      return prices[symbol + sufix]
    case 'ETH':
      return prices['W' + symbol + sufix]
    case 'USDC':
      return prices[symbol + sufix]
    default:
      return { price: 0 }
  }
}

let isCoinGeckoQueryRunning = false

export const getCoinGeckoTokenPrice = async (id: string): Promise<number | undefined> => {
  const defaultTokensHash = generateHash(JSON.stringify(DEFAULT_TOKENS))
  const cachedHash = localStorage.getItem('COINGECKO_DEFAULT_TOKEN_LIST_CHANGED')

  while (isCoinGeckoQueryRunning) {
    await sleep(100)
  }
  isCoinGeckoQueryRunning = true

  const cachedLastQueryTimestamp = localStorage.getItem('COINGECKO_LAST_QUERY_TIMESTAMP')
  let lastQueryTimestamp = 0
  if (cachedLastQueryTimestamp) {
    lastQueryTimestamp = Number(cachedLastQueryTimestamp)
  }

  const isHashOutdated = cachedHash !== defaultTokensHash

  const cachedPriceData = localStorage.getItem('COINGECKO_PRICE_DATA')
  let priceData: CoinGeckoAPIData = []

  if (
    isHashOutdated ||
    !cachedPriceData ||
    Number(lastQueryTimestamp) + COINGECKO_QUERY_COOLDOWN <= Date.now()
  ) {
    try {
      const { data } = await axios.get<CoinGeckoAPIData>(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${DEFAULT_TOKENS}`
      )
      priceData = data

      localStorage.setItem('COINGECKO_PRICE_DATA', JSON.stringify(priceData))
      localStorage.setItem('COINGECKO_LAST_QUERY_TIMESTAMP', String(Date.now()))
      localStorage.setItem('COINGECKO_DEFAULT_TOKEN_LIST_CHANGED', defaultTokensHash)
    } catch (e) {
      localStorage.removeItem('COINGECKO_LAST_QUERY_TIMESTAMP')
      localStorage.removeItem('COINGECKO_PRICE_DATA')
      console.log(e)
    }
  } else {
    priceData = JSON.parse(cachedPriceData)
  }

  isCoinGeckoQueryRunning = false
  return priceData.find(entry => entry.id === id)?.current_price
}

interface RawJupApiResponse {
  data: Record<
    string,
    {
      id: string
      price: string
    }
  >
  timeTaken: number
}

export const getJupTokenPrice = async (solanaAddress: string): Promise<number | undefined> => {
  try {
    const response = await axios.get<RawJupApiResponse>(
      `https://api.jup.ag/price/v2?ids=${solanaAddress}`
    )

    return Number(response.data.data[solanaAddress].price)
  } catch (error) {
    return 0
  }
}

export const getTokenPrice = async (id: string): Promise<number | undefined> => {
  const token = TOKENS_PRICES_FROM_JUP.find(token => token.coingeckoId === id)
  if (token && token.solanaAddress) {
    return await getJupTokenPrice(token.solanaAddress)
  } else {
    return await getCoinGeckoTokenPrice(id)
  }
}

export const getTicksList = async (
  marketProgram: Market,
  data: Array<{ pair: Pair; index: number }>
): Promise<Array<Tick | null>> => {
  const ticksAddresses = await Promise.all(
    data.map(async ({ pair, index }) => {
      const { tickAddress } = await marketProgram.getTickAddress(pair, index)

      return tickAddress
    })
  )

  const ticks = await marketProgram.program.account.tick.fetchMultiple(ticksAddresses)

  return ticks.map(tick => (tick === null ? null : parseTick(tick)))
}

export const getPoolsAPY = async (name: string): Promise<Record<string, number>> => {
  try {
    const { data } = await axios.get<Record<string, number>>(
      `https://stats.invariant.app/pool_apy/eclipse-${name}`
    )

    return data
  } catch (_err) {
    return {}
  }
}

export const getIncentivesRewardData = async (
  name: string
): Promise<Record<string, IncentiveRewardData>> => {
  try {
    const { data } = await axios.get<Record<string, IncentiveRewardData>>(
      `https://stats.invariant.app/incentive_rewards/eclipse-${name}`
    )

    return data
  } catch (_err) {
    return {}
  }
}

export const getPoolsVolumeRanges = async (name: string): Promise<Record<string, Range[]>> => {
  try {
    const { data } = await axios.get<Record<string, Range[]>>(
      `https://stats.invariant.app/pool_volume_range/eclipse-${name}`
    )

    return data
  } catch (_err) {
    return {}
  }
}

export const createLoaderKey = () => (new Date().getMilliseconds() + Math.random()).toString()

export const getFullSnap = async (name: string): Promise<FullSnap> => {
  const { data } = await axios.get<FullSnap>(
    `https://stats.invariant.app/svm/full_snap/eclipse-${name}`
  )

  return data
}
export const isValidPublicKey = (keyString?: string | null) => {
  try {
    if (!keyString) {
      return false
    }
    new PublicKey(keyString)
    return true
  } catch (error) {
    return false
  }
}

export const trimDecimalZeros = (numStr: string): string => {
  if (/^[0.]+$/.test(numStr)) {
    return '0'
  }

  const withoutTrailingDot = numStr.replace(/\.$/, '')

  if (!withoutTrailingDot.includes('.')) {
    return withoutTrailingDot.replace(/^0+/, '') || '0'
  }

  const [integerPart, decimalPart] = withoutTrailingDot.split('.')

  const trimmedDecimal = decimalPart.replace(/0+$/, '')

  const trimmedInteger = integerPart.replace(/^0+/, '')

  return trimmedDecimal ? `${trimmedInteger || '0'}.${trimmedDecimal}` : trimmedInteger || '0'
}

const poolsToRecalculateAPY = ['HRgVv1pyBLXdsAddq4ubSqo8xdQWRrYbvmXqEDtectce']

//HOTFIX
export const calculateAPYAndAPR = (
  apy: number,
  poolAddress?: string,
  volume?: number,
  fee?: number,
  tvl?: number
) => {
  if (volume === undefined || fee === undefined || tvl === undefined) {
    return { convertedApy: Math.abs(apy), convertedApr: Math.abs(apyToApr(apy)) }
  }

  if (poolsToRecalculateAPY.includes(poolAddress ?? '')) {
    const parsedApr = ((volume * fee) / tvl) * 365

    const parsedApy = (Math.pow((volume * fee * 0.01) / tvl + 1, 365) - 1) * 100

    return { convertedApy: Math.abs(parsedApy), convertedApr: Math.abs(parsedApr) }
  } else {
    return { convertedApy: Math.abs(apy), convertedApr: Math.abs(apyToApr(apy)) }
  }
}

export const hexToDate = (hexTimestamp: string) => {
  const timestamp = parseInt(hexTimestamp, 16)

  const date = new Date(timestamp * 1000)

  return date
}

export const checkDataDelay = (date: string | Date, timeInMinutes: number): boolean => {
  const inputDate = new Date(date)

  if (isNaN(inputDate.getTime())) {
    throw new Error('Invalid date provided')
  }

  const currentDate = new Date()

  const differenceInMinutes = (currentDate.getTime() - inputDate.getTime()) / (1000 * 60)

  return differenceInMinutes > timeInMinutes
}

export const generateHash = (str: string): string => {
  let hash = 0

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  return Math.abs(hash).toString(16).padStart(8, '0')
}

export const calculatePoints = (
  amount: BN,
  decimals: number,
  feePercentage: BN,
  priceFeed: string,
  priceDecimals: number,
  pointsPerUSD: BN
) => {
  const nominator = amount
    .mul(feePercentage)
    .mul(new BN(priceFeed))
    .mul(pointsPerUSD)
    .mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
  const denominator = new BN(10).pow(new BN(priceDecimals + decimals))

  return nominator.div(denominator).div(new BN(DENOMINATOR))
}
