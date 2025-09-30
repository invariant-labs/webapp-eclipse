import {
  calculatePriceSqrt,
  FetcherRecords,
  getTokenProgramAddress,
  MAX_TICK,
  MIN_TICK,
  Pair,
  PRICE_DENOMINATOR,
  routingEssentials
} from '@invariant-labs/sdk-eclipse'
import { PoolStructure, Tick } from '@invariant-labs/sdk-eclipse/src/market'
import { DECIMAL, simulateSwap, SimulationStatus } from '@invariant-labs/sdk-eclipse/src/utils'
import { BN } from '@coral-xyz/anchor'
import {
  getMint,
  TOKEN_2022_PROGRAM_ID,
  getTokenMetadata as fetchMetaData,
  unpackMint
} from '@solana/spl-token'
import { Connection, ParsedInstruction, ParsedTransactionMeta, PublicKey } from '@solana/web3.js'
import {
  Market,
  Tickmap,
  TICK_CROSSES_PER_IX,
  TICK_VIRTUAL_CROSSES_PER_IX,
  parsePool,
  RawPoolStructure,
  parsePosition,
  parseTick,
  RawTick
} from '@invariant-labs/sdk-eclipse/lib/market'
import axios from 'axios'
import {
  CONCENTRATION_FACTOR,
  getMaxTick,
  getMinTick,
  PRICE_SCALE,
  POOLS_WITH_LUTS,
  Range,
  toDecimal,
  simulateSwapAndCreatePosition,
  simulateSwapAndCreatePositionOnTheSamePool
} from '@invariant-labs/sdk-eclipse/lib/utils'
import { PlotTickData, PositionWithAddress, PositionWithoutTicks } from '@store/reducers/positions'
import {
  ADDRESSES_TO_REVERT_TOKEN_PAIRS,
  BTC_DEV,
  BTC_TEST,
  PRICE_QUERY_COOLDOWN,
  DARKMOON_MAIN,
  DOGWIFHAT_MAIN,
  FormatConfig,
  getAddressTickerMap,
  getReversedAddressTickerMap,
  GSVM_MAIN,
  LAIKA_MAIN,
  MAX_U64,
  MOON_MAIN,
  MOON_TEST,
  NetworkType,
  PRICE_DECIMAL,
  STTIA_MAIN,
  S22_TEST,
  SOL_MAIN,
  subNumbers,
  TETH_MAIN,
  TIA_MAIN,
  tokensPrices,
  USDC_DEV,
  USDC_MAIN,
  USDC_TEST,
  WETH_DEV,
  WETH_TEST,
  WRAPPED_ETH_ADDRESS,
  MAX_CROSSES_IN_SINGLE_TX,
  USDT_MAIN,
  ORCA_MAIN,
  SOLAR_MAIN,
  WETH_MAIN,
  KYSOL_MAIN,
  EZSOL_MAIN,
  POSITIONS_PER_PAGE,
  MAX_CROSSES_IN_SINGLE_TX_WITH_LUTS,
  ES_MAIN,
  BITZ_MAIN,
  PRICE_API_URL,
  Intervals,
  SALE_TEST,
  ERROR_CODE_TO_MESSAGE,
  COMMON_ERROR_MESSAGE,
  ErrorCodeExtractionKeys,
  TUSD_MAIN,
  AlternativeFormatConfig,
  defaultThresholds,
  JITOSOL_MAIN,
  WBTC_MAIN,
  NPT_MAIN,
  USDN_MAIN,
  WEETHS_MAIN,
  sBITZ_MAIN,
  MAX_PLOT_VISIBLE_TICK_RANGE,
  CHECKER_API_URL,
  NoConfig,
  muES_MAIN,
  INVT_MAIN,
  xINVT_MAIN,
  INVT_TEST,
  xINVT_TEST,
  TOTAL_INVT_REWARDS,
  INVT_DEPOSIT_LIMIT
} from '@store/consts/static'
import { PoolWithAddress } from '@store/reducers/pools'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import {
  FormatNumberThreshold,
  FullSnap,
  IncentiveRewardData,
  InvtConvertedData,
  IPriceData,
  PoolSnapshot,
  Token,
  TokenPriceData,
  TokenReserve
} from '@store/consts/types'
import { sqrt } from '@invariant-labs/sdk-eclipse/lib/math'
import { apyToApr } from './uiUtils'
import { alignTickToSpacing } from '@invariant-labs/sdk-eclipse/src/tick'
import { fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata'
import { publicKey } from '@metaplex-foundation/umi-public-keys'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { Umi } from '@metaplex-foundation/umi'
import { StakingStatsResponse } from '@store/reducers/sbitz-stats'
import { DEFAULT_FEE_TIER, STRATEGIES } from '@store/consts/userStrategies'
import { HoldersResponse } from '@store/reducers/sBitz'
import { PoolSnap } from '@store/reducers/stats'
import { UTCTimestamp } from 'lightweight-charts'
import { SwapToken } from '@store/selectors/solanaWallet'

export const transformBN = (amount: BN): string => {
  return (amount.div(new BN(1e2)).toNumber() / 1e4).toString()
}
export const printBNandTrimZeros = (amount: BN, decimals: number, decimalPlaces?: number) => {
  return trimZeros(Number(printBN(amount, decimals)).toFixed(decimalPlaces ?? decimals))
}

export const printBN = (amount: BN, decimals: number): string => {
  if (!amount) {
    return '0'
  }
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

export const parseLiquidityInRange = (currentTickIndex: number, ticks: Tick[]) => {
  let currentLiquidity = new BN(0)

  return ticks.map(tick => {
    currentLiquidity = currentLiquidity.add(tick.liquidityChange.muln(tick.sign ? 1 : -1))
    return {
      liquidity:
        Math.abs(tick.index - currentTickIndex) > MAX_PLOT_VISIBLE_TICK_RANGE
          ? 0
          : currentLiquidity,
      index: tick.index
    }
  })
}

export const createLiquidityPlot = (
  rawTicks: Tick[],
  pool: PoolStructure,
  isXtoY: boolean,
  tokenXDecimal: number,
  tokenYDecimal: number
) => {
  const sortedTicks = rawTicks.sort((a, b) => a.index - b.index)
  const parsedTicks = rawTicks.length
    ? parseLiquidityInRange(pool.currentTickIndex, sortedTicks)
    : []

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

interface FormatNumberWithSuffixConfig {
  noDecimals?: boolean
  decimalsAfterDot?: number
  alternativeConfig?: boolean
  noSubNumbers?: boolean
  noConfig?: boolean
}

export const getThresholdsDecimals = (
  number: number | bigint | string,
  thresholds: FormatNumberThreshold[] = defaultThresholds
): number => {
  const numberAsNumber = Number(number)
  const found = thresholds.find(threshold => numberAsNumber < threshold.value)

  return found?.decimals ?? 2
}
export const formatNumberWithSuffix = (
  number: number | bigint | string,
  config?: FormatNumberWithSuffixConfig
): string => {
  const {
    noDecimals,
    decimalsAfterDot,
    alternativeConfig,
    noSubNumbers,
    noConfig
  }: Required<FormatNumberWithSuffixConfig> = {
    noDecimals: false,
    decimalsAfterDot: 3,
    alternativeConfig: false,
    noSubNumbers: false,
    noConfig: false,
    ...config
  }

  const formatConfig = noConfig
    ? NoConfig
    : alternativeConfig
      ? AlternativeFormatConfig
      : FormatConfig

  const numberAsNumber = Number(number)
  const isNegative = numberAsNumber < 0
  const absNumberAsNumber = Math.abs(numberAsNumber)

  const absNumberAsString = numberToString(absNumberAsNumber)

  if (containsOnlyZeroes(absNumberAsString)) {
    return '0'
  }

  const [beforeDot, afterDot] = absNumberAsString.split('.')

  let formattedNumber

  if (Math.abs(numberAsNumber) >= formatConfig.B) {
    const formattedDecimals = noDecimals
      ? ''
      : '.' +
        (beforeDot.slice(-formatConfig.BDecimals) + (afterDot ? afterDot : '')).slice(
          0,
          formatConfig.DecimalsAfterDot
        )

    formattedNumber =
      beforeDot.slice(0, -formatConfig.BDecimals) + (noDecimals ? '' : formattedDecimals) + 'B'
  } else if (Math.abs(numberAsNumber) >= formatConfig.M) {
    const formattedDecimals = noDecimals
      ? ''
      : '.' +
        (beforeDot.slice(-formatConfig.MDecimals) + (afterDot ? afterDot : '')).slice(
          0,
          formatConfig.DecimalsAfterDot
        )
    formattedNumber =
      beforeDot.slice(0, -formatConfig.MDecimals) + (noDecimals ? '' : formattedDecimals) + 'M'
  } else if (Math.abs(numberAsNumber) >= formatConfig.K) {
    const formattedDecimals = noDecimals
      ? ''
      : '.' +
        (beforeDot.slice(-formatConfig.KDecimals) + (afterDot ? afterDot : '')).slice(
          0,
          formatConfig.DecimalsAfterDot
        )
    formattedNumber =
      beforeDot.slice(0, -formatConfig.KDecimals) + (noDecimals ? '' : formattedDecimals) + 'K'
  } else if (afterDot && noSubNumbers) {
    const roundedNumber = absNumberAsNumber.toFixed(decimalsAfterDot + 1).slice(0, -1)

    formattedNumber = trimZeros(roundedNumber)
  } else if (afterDot && countLeadingZeros(afterDot) <= decimalsAfterDot) {
    const roundedNumber = absNumberAsNumber
      .toFixed(countLeadingZeros(afterDot) + decimalsAfterDot + 1)
      .slice(0, -1)

    formattedNumber = trimZeros(roundedNumber)
  } else {
    const leadingZeros = afterDot ? countLeadingZeros(afterDot) : 0

    const parsedAfterDot =
      String(parseInt(afterDot)).length > decimalsAfterDot
        ? String(parseInt(afterDot)).slice(0, decimalsAfterDot)
        : afterDot

    if (noSubNumbers && afterDot) {
      formattedNumber = beforeDot + '.' + afterDot
    } else if (parsedAfterDot && afterDot) {
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

function trimEndingZeros(num) {
  return num.toString().replace(/0+$/, '')
}

export const formatNumberWithoutSuffix = (
  number: number | bigint | string,
  options?: { twoDecimals?: boolean }
): string => {
  const numberAsNumber = Number(number)
  const isNegative = numberAsNumber < 0
  const absNumberAsNumber = Math.abs(numberAsNumber)

  if (options?.twoDecimals) {
    if (absNumberAsNumber === 0) {
      return '0'
    }
    if (absNumberAsNumber > 0 && absNumberAsNumber < 0.01) {
      return isNegative ? '-<0.01' : '<0.01'
    }
    return isNegative
      ? '-' + absNumberAsNumber.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : absNumberAsNumber.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const absNumberAsString = numberToString(absNumberAsNumber)
  const [beforeDot, afterDot] = absNumberAsString.split('.')

  const leadingZeros = afterDot ? countLeadingZeros(afterDot) : 0

  const parsedBeforeDot = beforeDot.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const parsedAfterDot =
    leadingZeros >= 4 && absNumberAsNumber < 1
      ? '0' + printSubNumber(leadingZeros) + trimEndingZeros(String(parseInt(afterDot)).slice(0, 3))
      : trimEndingZeros(String(afterDot).slice(0, absNumberAsNumber >= 1 ? 2 : leadingZeros + 3))

  const formattedNumber = parsedBeforeDot + (afterDot && parsedAfterDot ? '.' + parsedAfterDot : '')

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
  switch (networkType) {
    case NetworkType.Mainnet:
      return {
        [WETH_MAIN.address.toString()]: WETH_MAIN,
        [TETH_MAIN.address.toString()]: TETH_MAIN,
        [USDC_MAIN.address.toString()]: USDC_MAIN,
        [USDT_MAIN.address.toString()]: USDT_MAIN,
        [SOL_MAIN.address.toString()]: SOL_MAIN,
        [BITZ_MAIN.address.toString()]: BITZ_MAIN,
        [sBITZ_MAIN.address.toString()]: sBITZ_MAIN,
        [DOGWIFHAT_MAIN.address.toString()]: DOGWIFHAT_MAIN,
        [LAIKA_MAIN.address.toString()]: LAIKA_MAIN,
        [MOON_MAIN.address.toString()]: MOON_MAIN,
        [GSVM_MAIN.address.toString()]: GSVM_MAIN,
        [DARKMOON_MAIN.address.toString()]: DARKMOON_MAIN,
        [TIA_MAIN.address.toString()]: TIA_MAIN,
        [STTIA_MAIN.address.toString()]: STTIA_MAIN,
        [ORCA_MAIN.address.toString()]: ORCA_MAIN,
        [SOLAR_MAIN.address.toString()]: SOLAR_MAIN,
        [KYSOL_MAIN.address.toString()]: KYSOL_MAIN,
        [EZSOL_MAIN.address.toString()]: EZSOL_MAIN,
        [ES_MAIN.address.toString()]: ES_MAIN,
        [TUSD_MAIN.address.toString()]: TUSD_MAIN,
        [JITOSOL_MAIN.address.toString()]: JITOSOL_MAIN,
        [WBTC_MAIN.address.toString()]: WBTC_MAIN,
        [NPT_MAIN.address.toString()]: NPT_MAIN,
        [USDN_MAIN.address.toString()]: USDN_MAIN,
        [WEETHS_MAIN.address.toString()]: WEETHS_MAIN,
        [muES_MAIN.address.toString()]: muES_MAIN,
        [INVT_MAIN.address.toString()]: INVT_MAIN,
        [xINVT_MAIN.address.toString()]: xINVT_MAIN
      }
    case NetworkType.Devnet:
      return {
        [USDC_DEV.address.toString()]: USDC_DEV,
        [BTC_DEV.address.toString()]: BTC_DEV,
        [WETH_DEV.address.toString()]: WETH_DEV
      }
    case NetworkType.Testnet:
      return {
        [SALE_TEST.address.toString()]: SALE_TEST,
        [USDC_TEST.address.toString()]: USDC_TEST,
        [BTC_TEST.address.toString()]: BTC_TEST,
        [WETH_TEST.address.toString()]: WETH_TEST,
        [MOON_TEST.address.toString()]: MOON_TEST,
        [S22_TEST.address.toString()]: S22_TEST,
        [INVT_TEST.address.toString()]: INVT_TEST,
        [xINVT_TEST.address.toString()]: xINVT_TEST
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
export const nearestTicksBySpacing = (midPriceTick: number, spacing: number, isXtoY: boolean) => {
  const base =
    midPriceTick % spacing === 0
      ? midPriceTick
      : isXtoY
        ? midPriceTick - (midPriceTick % spacing)
        : midPriceTick + (spacing - (midPriceTick % spacing))

  return { lowerTick: isXtoY ? base : base + spacing, upperTick: isXtoY ? base + spacing : base }
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

export const hasLuts = (pool: PublicKey) => POOLS_WITH_LUTS.some(p => p.equals(pool))

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
      continue
    }

    const maxCrosses = hasLuts(pool.address)
      ? MAX_CROSSES_IN_SINGLE_TX_WITH_LUTS
      : pool.tokenX.toString() === WRAPPED_ETH_ADDRESS ||
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
    } catch (e: unknown) {
      const error = ensureError(e)
      console.log(error)

      errorMessage.push(error.message.toString())
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

export const simulateAutoSwapOnTheSamePool = async (
  amountX: BN,
  amountY: BN,
  pool: PoolWithAddress,
  poolTicks: Tick[],
  tickmap: Tickmap,
  swapSlippage: BN,
  lowerTick: number,
  upperTick: number,
  minUtilization: BN
) => {
  const ticks: Map<number, Tick> = new Map<number, Tick>()
  for (const tick of poolTicks) {
    ticks.set(tick.index, tick)
  }

  const maxCrosses =
    pool.tokenX.toString() === WRAPPED_ETH_ADDRESS || pool.tokenY.toString() === WRAPPED_ETH_ADDRESS
      ? MAX_CROSSES_IN_SINGLE_TX
      : TICK_CROSSES_PER_IX

  try {
    const simulateResult = simulateSwapAndCreatePositionOnTheSamePool(
      amountX,
      amountY,
      swapSlippage,
      {
        ticks,
        tickmap,
        pool,
        maxVirtualCrosses: TICK_VIRTUAL_CROSSES_PER_IX,
        maxCrosses
      },
      { lowerTick, upperTick },
      minUtilization
    )
    return simulateResult
  } catch (e) {
    console.log(e)
    return null
  }
}

export const simulateAutoSwap = async (
  amountX: BN,
  amountY: BN,
  pool: PoolWithAddress,
  poolTicks: Tick[],
  tickmap: Tickmap,
  swapSlippage: BN,
  positionSlippage: BN,
  lowerTick: number,
  upperTick: number,
  knownPrice: BN,
  minUtilization: BN
) => {
  const ticks: Map<number, Tick> = new Map<number, Tick>()
  for (const tick of poolTicks) {
    ticks.set(tick.index, tick)
  }

  const maxCrosses =
    pool.tokenX.toString() === WRAPPED_ETH_ADDRESS || pool.tokenY.toString() === WRAPPED_ETH_ADDRESS
      ? MAX_CROSSES_IN_SINGLE_TX
      : TICK_CROSSES_PER_IX
  const precision = toDecimal(1, 3)
  try {
    const simulateResult = simulateSwapAndCreatePosition(
      amountX,
      amountY,
      {
        ticks,
        tickmap,
        pool,
        maxVirtualCrosses: TICK_VIRTUAL_CROSSES_PER_IX,
        maxCrosses,
        slippage: swapSlippage
      },
      { lowerTick, knownPrice, slippage: positionSlippage, upperTick },
      precision,
      minUtilization
    )
    return simulateResult
  } catch (e) {
    console.log(e)
    return null
  }
}
export const handleSimulateWithHop = async (
  market: Market,
  tokenIn: PublicKey,
  tokenOut: PublicKey,
  amount: BN,
  byAmountIn: boolean,
  accounts: FetcherRecords
) => {
  const { routeCandidates } = routingEssentials(
    tokenIn,
    tokenOut,
    market.program.programId,
    market.network
  )

  for (let i = routeCandidates.length - 1; i >= 0; i--) {
    const [pairIn, pairOut] = routeCandidates[i]

    if (
      !accounts.pools[pairIn.getAddress(market.program.programId).toBase58()] ||
      !accounts.pools[pairOut.getAddress(market.program.programId).toBase58()]
    ) {
      const lastCandidate = routeCandidates.pop()!
      if (i !== routeCandidates.length) {
        routeCandidates[i] = lastCandidate
      }
    }
  }

  if (routeCandidates.length === 0) {
    return { simulation: null, route: null, error: true }
  }

  const simulations = await market.routeTwoHop(
    tokenIn,
    tokenOut,
    amount,
    byAmountIn,
    routeCandidates,
    accounts
  )

  if (simulations.length === 0) {
    return { simulation: null, route: null, error: true }
  }

  let best = 0
  let bestFailed = 0
  for (let n = 0; n < simulations.length; ++n) {
    const [, simulation] = simulations[n]
    const [, simulationBest] = simulations[best]
    const [, simulationBestFailed] = simulations[bestFailed]
    const isSwapSuccess =
      simulation.swapHopOne.status === SimulationStatus.Ok &&
      simulation.swapHopTwo.status === SimulationStatus.Ok

    const isBestSwapFailed =
      simulationBest.swapHopOne.status !== SimulationStatus.Ok ||
      simulationBest.swapHopTwo.status !== SimulationStatus.Ok

    if (byAmountIn) {
      if (
        (simulation.totalAmountOut.gt(simulationBest.totalAmountOut) && isSwapSuccess) ||
        (isSwapSuccess && isBestSwapFailed)
      ) {
        best = n
      }

      if (
        !simulation.totalAmountOut.eq(new BN(0)) &&
        simulation.totalAmountOut.gt(simulationBestFailed.totalAmountOut)
      ) {
        bestFailed = n
      }
    } else {
      if (
        (simulation.totalAmountOut.eq(amount) &&
          simulation.totalAmountIn
            .add(simulation.swapHopOne.accumulatedFee)
            .lt(simulationBest.totalAmountIn.add(simulationBest.swapHopOne.accumulatedFee)) &&
          isSwapSuccess) ||
        (isSwapSuccess && isBestSwapFailed)
      ) {
        best = n
      }

      if (
        !simulation.totalAmountOut.eq(new BN(0)) &&
        simulation.totalAmountIn
          .add(simulation.swapHopOne.accumulatedFee)
          .lt(
            simulationBestFailed.totalAmountIn.add(simulationBestFailed.swapHopOne.accumulatedFee)
          )
      ) {
        bestFailed = n
      }
    }
  }

  if (
    simulations[best][1].swapHopOne.status === SimulationStatus.Ok &&
    simulations[best][1].swapHopTwo.status === SimulationStatus.Ok
  ) {
    return {
      simulation: simulations[best][1],
      route: routeCandidates[simulations[best][0]],
      error: false
    }
  } else {
    return {
      simulation: simulations[bestFailed][1],
      route: routeCandidates[simulations[bestFailed][0]],
      error: true
    }
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

export const fetchProofOfInclusion = async (address: string): Promise<any> => {
  const { data } = await axios.get(CHECKER_API_URL + `/${address}`)
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

    const parsedPools: Array<PoolWithAddress> = []

    pools.map((pool, index) => {
      if (pool) {
        parsedPools.push({
          ...parsePool(pool),
          address: addresses[index]
        })
      }
    })

    return parsedPools
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    return []
  }
}

export const getTickmapsFromPools = async (
  pools: PoolWithAddress[],
  marketProgram: Market
): Promise<Record<string, Tickmap>> => {
  {
    try {
      const addresses = pools.map(pool => pool.tickmap)
      const tickmaps = (await marketProgram.program.account.tickmap.fetchMultiple(
        addresses
      )) as Array<Tickmap | null>

      return tickmaps.reduce((acc, cur, idx) => {
        if (cur) {
          acc[addresses[idx].toBase58()] = cur
        }
        return acc
      }, {})
    } catch (e: unknown) {
      const error = ensureError(e)
      console.log(error)

      return {}
    }
  }
}

export const getTicksFromAddresses = async (market: Market, addresses: PublicKey[]) => {
  try {
    return (await market.program.account.tick.fetchMultiple(addresses)) as Array<RawTick | null>
  } catch (e: unknown) {
    const error = ensureError(e)
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
      pairs.map(pair => pair.getAddress(marketProgram.program.programId))
    )

    return await getPoolsFromAddresses(addresses, marketProgram)
  } catch (e: unknown) {
    const error = ensureError(e)
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

export const calculateTickDelta = (
  tickSpacing: number,
  minimumRange: number,
  concentration: number
) => {
  const targetValue = 1 / (concentration * CONCENTRATION_FACTOR)

  const base = 1.0001
  const inner = 1 - targetValue
  const powered = Math.pow(inner, 4)
  const tickDiff = -Math.log(powered) / Math.log(base)

  const parsedTickDelta = tickDiff / tickSpacing - minimumRange / 2

  const tickDelta = Math.round(parsedTickDelta + 1)

  return tickDelta
}

export const calculateConcentrationRange = (
  tickSpacing: number,
  concentration: number,
  minimumRange: number,
  currentTick: number,
  isXToY: boolean
) => {
  const tickDelta = calculateTickDelta(tickSpacing, minimumRange, concentration)

  const lowerTick =
    tickDelta === 1
      ? currentTick - alignTickToSpacing((tickDelta * tickSpacing) / 2, tickSpacing)
      : currentTick - alignTickToSpacing((tickDelta * tickSpacing) / 2, tickSpacing) + tickSpacing
  const upperTick =
    currentTick + alignTickToSpacing((tickDelta * tickSpacing) / 2, tickSpacing) + tickSpacing

  return {
    leftRange: isXToY ? lowerTick : upperTick,
    rightRange: isXToY ? upperTick : lowerTick
  }
}

export const calculateConcentration = (lowerTick: number, upperTick: number) => {
  const deltaPrice = Math.pow(1.0001, -Math.abs(lowerTick - upperTick))

  const denominator = 1 - Math.pow(deltaPrice, 1 / 4)
  const result = 1 / denominator

  return Math.abs(result / CONCENTRATION_FACTOR)
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
  connection: Connection,
  concurrencyLimit: number = 20
): Promise<Record<string, Token>> => {
  const umi = createUmi(connection.rpcEndpoint)
  const tokens: Record<string, Token> = {}
  const promiseChains: Promise<void>[] = new Array(concurrencyLimit).fill(
    Promise.resolve<void>(undefined)
  )
  let nextIndex = 0
  const enqueue = (task: () => Promise<void>): Promise<void> => {
    const slot = nextIndex
    nextIndex = (nextIndex + 1) % concurrencyLimit
    const resultPromise = promiseChains[slot].then(task)
    promiseChains[slot] = resultPromise.catch(() => {})
    return resultPromise
  }

  await Promise.all(
    addresses.map(address =>
      enqueue(async () => {
        const programId = await getTokenProgramId(connection, address)
        const mint = await getMint(connection, address, undefined, programId)

        const token = await getTokenMetadata(
          connection,
          address.toString(),
          mint.decimals,
          programId,
          umi
        )

        tokens[address.toString()] = token
      })
    )
  )

  await Promise.all(promiseChains)

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
  tokenProgram?: PublicKey,
  umiInstance?: Umi
): Promise<Token> {
  const mintAddress = new PublicKey(address)
  let metadata

  try {
    if (tokenProgram?.toString() === TOKEN_2022_PROGRAM_ID.toString()) {
      metadata = await fetchMetaData(connection, mintAddress, undefined, tokenProgram)
    } else {
      const umi = umiInstance ?? createUmi(connection.rpcEndpoint)
      const metaplexMetadata = await fetchDigitalAsset(umi, publicKey(address))
      metadata = metaplexMetadata.metadata
    }
    const irisTokenData = await axios.get<any>(metadata.uri).then(res => res.data)

    return {
      tokenProgram,
      address: mintAddress,
      decimals,
      symbol:
        metadata?.symbol ||
        irisTokenData?.symbol ||
        `${address.slice(0, 2)}...${address.slice(-4)}`,
      name: metadata?.name || irisTokenData?.name || address,
      logoURI: irisTokenData?.image || '/unknownToken.svg',
      isUnknown: true
    }
  } catch {
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
    return getAddressTickerMap(network)[ticker] || ticker
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

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

  if (tokenXIndex !== -1 && tokenYIndex !== -1) {
    if (tokenXIndex < tokenYIndex) {
      return false
    } else {
      return true
    }
  } else if (tokenXIndex > tokenYIndex) {
    return false
  } else {
    return true
  }
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

type PriceMap = Record<string, { price: number }>
type TokenPriceReturn<T extends string | undefined> = T extends string
  ? number | undefined
  : PriceMap | undefined

export async function getTokenPrice<T extends string | undefined = undefined>(
  network: NetworkType,
  addr?: T
): Promise<TokenPriceReturn<T>> {
  const isMainnet = network === NetworkType.Mainnet
  const DATA_KEY = isMainnet ? 'TOKEN_PRICE_DATA' : 'TOKEN_PRICE_DATA_TESTNET'
  const TS_KEY = isMainnet
    ? 'TOKEN_PRICE_LAST_QUERY_TIMESTAMP'
    : 'TOKEN_PRICE_LAST_QUERY_TIMESTAMP_TESTNET'

  const cachedLastQueryTimestamp = localStorage.getItem(TS_KEY)
  const lastQueryTimestamp = cachedLastQueryTimestamp ? Number(cachedLastQueryTimestamp) : 0

  const cachedPriceData = localStorage.getItem(DATA_KEY)

  let priceData: PriceMap | null = null

  if (!cachedPriceData || lastQueryTimestamp + PRICE_QUERY_COOLDOWN <= Date.now()) {
    try {
      const { data } = await axios.get<IPriceData>(
        `${PRICE_API_URL}/${isMainnet ? 'eclipse-mainnet' : 'eclipse-testnet'}`
      )
      priceData = data.data
      localStorage.setItem(DATA_KEY, JSON.stringify(priceData))
      localStorage.setItem(TS_KEY, String(Date.now()))
    } catch (e: unknown) {
      const error = ensureError(e)
      console.log(error)
      localStorage.removeItem(TS_KEY)
      localStorage.removeItem(DATA_KEY)
      priceData = null
    }
  } else {
    priceData = JSON.parse(cachedPriceData) as PriceMap
  }

  if (addr) {
    return (priceData && priceData[addr] ? priceData[addr].price : undefined) as TokenPriceReturn<T>
  }

  return (priceData ?? undefined) as TokenPriceReturn<T>
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
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
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
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
    return {}
  }
}

export const getPoolsVolumeRanges = async (name: string): Promise<Record<string, Range[]>> => {
  try {
    const { data } = await axios.get<Record<string, Range[]>>(
      `https://stats.invariant.app/pool_volume_range/eclipse-${name}`
    )

    return data
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
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

export const getIntervalsFullSnap = async (
  name: string,
  interval: Intervals
): Promise<FullSnap> => {
  const parsedInterval =
    interval === Intervals.Daily ? 'daily' : interval === Intervals.Weekly ? 'weekly' : 'monthly'
  const { data } = await axios.get<FullSnap>(
    `https://stats.invariant.app/eclipse/intervals/eclipse-${name}?interval=${parsedInterval}`
  )
  return data
}
export const fetchStackedBitzStats = async (): Promise<StakingStatsResponse> => {
  const { data } = await axios.get<StakingStatsResponse>(
    `https://stats.invariant.app/eclipse/sbitz/eclipse-mainnet`
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
  } catch {
    return false
  }
}

export const getIntervalsPoolSnap = async (
  network: string,
  interval: Intervals,
  poolAddress: string
): Promise<PoolSnap> => {
  const parsedInterval =
    interval === Intervals.Daily ? 'daily' : interval === Intervals.Weekly ? 'weekly' : 'monthly'
  const { data } = await axios.get<PoolSnap>(
    `https://stats.invariant.app/eclipse/pools/eclipse-${network}?interval=${parsedInterval}&address=${poolAddress}`
  )

  return data
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

const poolsToRecalculateAPY: string[] = [
  // 'HRgVv1pyBLXdsAddq4ubSqo8xdQWRrYbvmXqEDtectce', // USDC_ETH 0.09%
  // '86vPh8ctgeQnnn8qPADy5BkzrqoH5XjMCWvkd4tYhhmM', //SOL_ETH 0.09%
  // 'E2B7KUFwjxrsy9cC17hmadPsxWHD1NufZXTyrtuz8YxC', // USDC_SOL 0.09%
  // 'HG7iQMk29cgs74ZhSwrnye3C6SLQwKnfsbXqJVRi1x8H' // ETH-BITZ 1%
]

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

export const getConcentrationIndex = (concentrationArray: number[], neededValue: number = 34) => {
  if (neededValue > concentrationArray[concentrationArray.length - 1]) {
    return concentrationArray.length - 1
  }

  let concentrationIndex = 0

  for (let index = 0; index < concentrationArray.length; index++) {
    const value = +concentrationArray[index].toFixed(0)

    if (value === neededValue) {
      break
    } else if (value > neededValue) {
      concentrationIndex = index - 1
      break
    } else {
      concentrationIndex = index + 1
    }
  }

  return concentrationIndex
}
export const formatDate = timestamp => {
  const date = new Date(timestamp * 1000)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

export const formatNumberWithSpaces = (number: string) => {
  const trimmedNumber = number.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '')

  return trimmedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const generatePositionTableLoadingData = () => {
  const getRandomNumber = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  return Array(POSITIONS_PER_PAGE)
    .fill(null)
    .map((_, index) => {
      const currentPrice = Math.random() * 10000

      return {
        id: `loading-${index}`,
        poolAddress: `pool-${index}`,
        tokenXName: 'ETH',
        tokenYName: 'USDC',
        tokenXIcon: undefined,
        tokenYIcon: undefined,
        currentPrice,
        fee: getRandomNumber(1, 10) / 10,
        min: currentPrice * 0.8,
        max: currentPrice * 1.2,
        position: getRandomNumber(1000, 10000),
        valueX: getRandomNumber(1000, 10000),
        valueY: getRandomNumber(1000, 10000),
        poolData: {},
        isActive: Math.random() > 0.5,
        tokenXLiq: getRandomNumber(100, 1000),
        tokenYLiq: getRandomNumber(10000, 100000),
        network: NetworkType.Mainnet,
        unclaimedFeesInUSD: { value: 0, loading: true }
      }
    })
}
export const sciToString = (sciStr: string | number) => {
  const number = Number(sciStr)
  if (!Number.isFinite(number)) throw new Error('Invalid number')

  const fullStr = number.toLocaleString('fullwide', { useGrouping: false })
  return BigInt(fullStr).toString()
}

export const ensureError = (value: unknown): Error => {
  if (value instanceof Error) return value

  let stringified = '[Unable to stringify the thrown value]'

  stringified = JSON.stringify(value)

  const error = new Error(stringified)
  return error
}

export const getPositionByIdAndPoolAddress = async (
  marketProgram: Market,
  id: string,
  poolAddress: string
): Promise<PositionWithoutTicks | null> => {
  const positions = await marketProgram.program.account.position.all([
    {
      memcmp: {
        bytes: bs58.encode(new PublicKey(poolAddress).toBuffer()),
        offset: 40
      }
    },
    {
      memcmp: {
        bytes: bs58.encode(new BN(id).toBuffer('le', 16)),
        offset: 72
      }
    }
  ])

  return positions[0]
    ? {
        ...positions[0].account,
        feeGrowthInsideX: positions[0].account.feeGrowthInsideX.v,
        feeGrowthInsideY: positions[0].account.feeGrowthInsideY.v,
        liquidity: positions[0].account.liquidity.v,
        secondsPerLiquidityInside: positions[0].account.secondsPerLiquidityInside.v,
        tokensOwedX: positions[0].account.tokensOwedX.v,
        tokensOwedY: positions[0].account.tokensOwedY.v,
        address: positions[0].publicKey
      }
    : null
}

export const ROUTES = {
  ROOT: '/',
  EXCHANGE: '/exchange',
  EXCHANGE_WITH_PARAMS: '/exchange/:item1?/:item2?',
  LIQUIDITY: '/liquidity',
  STATISTICS: '/statistics',
  SALE: '/presale',
  NEW_POSITION: '/newPosition',
  NEW_POSITION_WITH_PARAMS: '/newPosition/:item1?/:item2?/:item3?',
  POSITION: '/position',
  POSITION_WITH_ID: '/position/:id',
  PORTFOLIO: '/portfolio',
  CREATOR: '/creator',
  sBITZ: '/sBITZ',
  XINVT: '/xINVT',
  POOL_DETAILS: '/poolDetails',
  POOL_DETAILS_WITH_PARAMS: '/poolDetails/:item1?/:item2?/:item3?',

  getExchangeRoute: (item1?: string, item2?: string): string => {
    const parts = [item1, item2].filter(Boolean)
    return `${ROUTES.EXCHANGE}${parts.length ? '/' + parts.join('/') : ''}`
  },

  getNewPositionRoute: (item1?: string, item2?: string, item3?: string): string => {
    const parts = [item1, item2, item3].filter(Boolean)
    return `${ROUTES.NEW_POSITION}${parts.length ? '/' + parts.join('/') : ''}`
  },

  getPoolDetailsRoute: (item1?: string, item2?: string, item3?: string): string => {
    const parts = [item1, item2, item3].filter(Boolean)
    return `${ROUTES.POOL_DETAILS}${parts.length ? '/' + parts.join('/') : ''}`
  },

  getPositionRoute: (id: string): string => `${ROUTES.POSITION}/${id}`
}

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength + 1) {
    return str
  }

  return str.slice(0, maxLength) + '...'
}
export const calculatePercentageRatio = (
  tokenXLiq: number,
  tokenYLiq: number,
  currentPrice: number,
  xToY: boolean
) => {
  const firstTokenPercentage =
    ((tokenXLiq * currentPrice) / (tokenYLiq + tokenXLiq * currentPrice)) * 100
  const tokenXPercentageFloat = xToY ? firstTokenPercentage : 100 - firstTokenPercentage
  const tokenXPercentage =
    tokenXPercentageFloat > 50
      ? Math.floor(tokenXPercentageFloat)
      : Math.ceil(tokenXPercentageFloat)

  return {
    tokenXPercentage,
    tokenYPercentage: 100 - tokenXPercentage
  }
}

export const extractErrorCode = (error: Error): number => {
  const errorCode = error.message
    .split(ErrorCodeExtractionKeys.ErrorNumber)[1]
    .split(ErrorCodeExtractionKeys.Dot)[0]
    .trim()
  return Number(errorCode)
}

export const extractRuntimeErrorCode = (error: Omit<Error, 'name'>): number => {
  const errorCode = error.message
    .split(ErrorCodeExtractionKeys.Custom)[1]
    .split(ErrorCodeExtractionKeys.RightBracket)[0]
    .trim()
  return Number(errorCode)
}

// may better to use regex
export const ensureApprovalDenied = (error: Error): boolean => {
  return (
    error.message.includes(ErrorCodeExtractionKeys.ApprovalDenied) ||
    error.message.includes(ErrorCodeExtractionKeys.UndefinedOnSplit)
  )
}

export const mapErrorCodeToMessage = (errorNumber: number): string => {
  return ERROR_CODE_TO_MESSAGE[errorNumber] || COMMON_ERROR_MESSAGE
}

export const getMarketNewTokensData = async (
  addresses: PublicKey[],
  connection: Connection,
  concurrencyLimit: number = 20
): Promise<Record<string, Token>> => {
  const umi = createUmi(connection.rpcEndpoint)
  const tokens: Record<string, Token> = {}
  const promiseChains: Promise<void>[] = new Array(concurrencyLimit).fill(
    Promise.resolve<void>(undefined)
  )
  const data = await getTokenDecimalsAndProgramID(connection, addresses)
  let nextIndex = 0
  const enqueue = (task: () => Promise<void>): Promise<void> => {
    const slot = nextIndex
    nextIndex = (nextIndex + 1) % concurrencyLimit
    const resultPromise = promiseChains[slot].then(task)
    promiseChains[slot] = resultPromise.catch(() => {})
    return resultPromise
  }

  await Promise.all(
    data.map(data =>
      enqueue(async () => {
        const token = await getTokenMetadata(
          connection,
          data.address.toString(),
          data.decimals,
          data.programId,
          umi
        )

        tokens[data.address.toString()] = token
      })
    )
  )

  await Promise.all(promiseChains)

  return tokens
}

export const getTokenDecimalsAndProgramID = async (
  connection: Connection,
  tokens: PublicKey[],
  BATCH_SIZE: number = 80
): Promise<ITokenDecimalAndProgramID[]> => {
  const data: ITokenDecimalAndProgramID[] = []

  const pubkeys = tokens.map(t => new PublicKey(t))

  for (let i = 0; i < pubkeys.length; i += BATCH_SIZE) {
    const batch = pubkeys.slice(i, i + BATCH_SIZE)
    const accounts = await connection.getMultipleAccountsInfo(batch)

    for (let j = 0; j < batch.length; j++) {
      const info = accounts[j]
      if (!info) continue

      const unpacked = unpackMint(batch[j], info, info.owner)

      data.push({
        address: batch[j],
        decimals: unpacked.decimals,
        programId: info.owner
      })
    }
  }

  return data
}
export interface ITokenDecimalAndProgramID {
  address: PublicKey
  decimals: number
  programId: PublicKey
}
export const findStrategy = (
  tokenAddress: string,
  currentNetwork: NetworkType = NetworkType.Mainnet
) => {
  const poolTicker = addressToTicker(currentNetwork, tokenAddress)
  let strategy = STRATEGIES.find(s => {
    const tickerA = addressToTicker(currentNetwork, s.tokenAddressA)
    const tickerB = s.tokenAddressB ? addressToTicker(currentNetwork, s.tokenAddressB) : undefined
    return tickerA === poolTicker || tickerB === poolTicker
  })
  if (!strategy) {
    strategy = {
      tokenAddressA: tokenAddress,
      feeTier: DEFAULT_FEE_TIER
    }
  }

  return {
    ...strategy,
    tokenSymbolA: addressToTicker(currentNetwork, strategy.tokenAddressA),
    tokenSymbolB: strategy.tokenAddressB
      ? addressToTicker(currentNetwork, strategy.tokenAddressB)
      : '-'
  }
}

export enum SwapTokenType {
  TokenIn,
  TokenBetween,
  TokenOut
}

export const getAmountFromSwapInstruction = (
  meta: ParsedTransactionMeta,
  marketProgramAuthority: string,
  token: string,
  type: SwapTokenType
): number => {
  if (!meta.innerInstructions) {
    return 0
  }

  const innerInstruction =
    meta.innerInstructions.find(
      innerInstruction =>
        !!innerInstruction.instructions.find(
          instruction =>
            (instruction as ParsedInstruction)?.parsed.type === 'transfer' ||
            (instruction as ParsedInstruction)?.parsed.type === 'transferChecked'
        )
    ) ?? meta.innerInstructions[2]

  let instruction: ParsedInstruction | undefined

  if (innerInstruction.instructions.length === 2) {
    instruction = innerInstruction.instructions.find(ix =>
      type === SwapTokenType.TokenIn
        ? (ix as ParsedInstruction).parsed.info.authority !== marketProgramAuthority
        : (ix as ParsedInstruction).parsed.info.authority === marketProgramAuthority
    ) as ParsedInstruction | undefined
  } else {
    instruction = innerInstruction.instructions.find(
      ix => (ix as ParsedInstruction).parsed.info.mint === token
    ) as ParsedInstruction | undefined

    if (!instruction) {
      let position = 0

      switch (type) {
        case SwapTokenType.TokenIn:
          position = 0
          break
        case SwapTokenType.TokenBetween:
          position = 1
          break
        case SwapTokenType.TokenOut:
          position = 2
          break
      }

      instruction = innerInstruction.instructions.filter(
        instruction =>
          (instruction as ParsedInstruction)?.parsed.type === 'transfer' ||
          (instruction as ParsedInstruction)?.parsed.type === 'transferChecked'
      )[position] as ParsedInstruction | undefined
    }
  }

  return instruction?.parsed.info.amount || instruction?.parsed.info.tokenAmount.amount
}

export enum TokenType {
  TokenX,
  TokenY
}

export const getAmountFromInitPositionInstruction = (
  meta: ParsedTransactionMeta,
  type: TokenType
): number => {
  if (!meta.innerInstructions) {
    return 0
  }

  const innerInstruction =
    meta.innerInstructions.find(
      innerInstruction =>
        !!innerInstruction.instructions.find(
          instruction =>
            (instruction as ParsedInstruction)?.parsed?.type === 'transfer' ||
            (instruction as ParsedInstruction)?.parsed?.type === 'transferChecked'
        )
    ) ?? meta.innerInstructions[2]

  const instruction = innerInstruction.instructions.filter(
    instruction =>
      (instruction as ParsedInstruction)?.parsed?.type === 'transfer' ||
      (instruction as ParsedInstruction)?.parsed?.type === 'transferChecked'
  )[type === TokenType.TokenX ? 0 : 1] as ParsedInstruction | undefined

  return instruction?.parsed.info.amount || instruction?.parsed.info.tokenAmount.amount
}

export const getSwapAmountFromSwapAndAddLiquidity = (
  meta: ParsedTransactionMeta,
  marketProgramAuthority: string,
  token: string,
  type: SwapTokenType
): number => {
  if (!meta.innerInstructions) {
    return 0
  }

  const innerInstruction =
    meta.innerInstructions.find(
      innerInstruction =>
        !!innerInstruction.instructions.find(
          instruction =>
            (instruction as ParsedInstruction)?.parsed?.type === 'transfer' ||
            (instruction as ParsedInstruction)?.parsed?.type === 'transferChecked'
        )
    ) ?? meta.innerInstructions[0]

  let instruction = innerInstruction.instructions.find(
    ix => (ix as ParsedInstruction).parsed?.info.mint === token
  ) as ParsedInstruction | undefined

  if (!instruction) {
    instruction = innerInstruction.instructions.find(ix =>
      type === SwapTokenType.TokenIn
        ? (ix as ParsedInstruction).parsed?.info.authority &&
          (ix as ParsedInstruction).parsed?.info.authority !== marketProgramAuthority
        : (ix as ParsedInstruction).parsed?.info.authority === marketProgramAuthority
    ) as ParsedInstruction | undefined
  }

  return instruction?.parsed?.info.amount || instruction?.parsed?.info.tokenAmount.amount
}

export const getAddAmountFromSwapAndAddLiquidity = (
  meta: ParsedTransactionMeta,
  type: TokenType
): number => {
  if (!meta.innerInstructions) {
    return 0
  }

  const innerInstruction =
    meta.innerInstructions.find(
      innerInstruction =>
        !!innerInstruction.instructions.find(
          instruction =>
            (instruction as ParsedInstruction)?.parsed?.type === 'transfer' ||
            (instruction as ParsedInstruction)?.parsed?.type === 'transferChecked'
        )
    ) ?? meta.innerInstructions[0]

  const instruction = innerInstruction.instructions.filter(
    instruction =>
      (instruction as ParsedInstruction)?.parsed?.type === 'transfer' ||
      (instruction as ParsedInstruction)?.parsed?.type === 'transferChecked'
  )[type === TokenType.TokenX ? 2 : 3] as ParsedInstruction | undefined

  return instruction?.parsed.info.amount || instruction?.parsed.info.tokenAmount.amount
}

export const getAmountFromClaimFeeInstruction = (
  meta: ParsedTransactionMeta,
  type: TokenType
): number => {
  const transfers =
    meta.innerInstructions
      ?.flatMap(inner => inner.instructions)
      .filter((ix): ix is ParsedInstruction =>
        ['transfer', 'transferChecked'].includes((ix as ParsedInstruction)?.parsed?.type)
      ) ?? []

  if (transfers.length < 2) return 0

  for (let i = transfers.length - 2; i >= 0; i--) {
    const [a, b] = [transfers[i], transfers[i + 1]]
    if (
      (a as any).stackHeight === (b as any).stackHeight &&
      a.parsed.info.authority === b.parsed.info.authority
    ) {
      const chosen = type === TokenType.TokenX ? a : b
      return chosen.parsed.info.amount ?? chosen.parsed.info.tokenAmount?.amount ?? 0
    }
  }

  const chosen = transfers[type === TokenType.TokenX ? 0 : 1]
  return chosen?.parsed.info.amount ?? chosen?.parsed.info.tokenAmount?.amount ?? 0
}

export const getAmountFromClosePositionInstruction = (
  meta: ParsedTransactionMeta,
  type: TokenType
): number => {
  if (!meta.innerInstructions) {
    return 0
  }

  const innerInstruction =
    meta.innerInstructions.find(
      innerInstruction =>
        !!innerInstruction.instructions.find(
          instruction =>
            (instruction as ParsedInstruction)?.parsed.type === 'transfer' ||
            (instruction as ParsedInstruction)?.parsed.type === 'transferChecked'
        )
    ) ?? meta.innerInstructions[0]

  const instruction = innerInstruction.instructions.filter(
    instruction =>
      (instruction as ParsedInstruction)?.parsed.type === 'transfer' ||
      (instruction as ParsedInstruction)?.parsed.type === 'transferChecked'
  )[type === TokenType.TokenX ? 0 : 1] as ParsedInstruction | undefined

  return instruction?.parsed.info.amount || instruction?.parsed.info.tokenAmount.amount
}

export const fetchMarketBitzStats = async () => {
  const sBITZ = sBITZ_MAIN.address.toString()

  const { data } = await axios.get<HoldersResponse>(
    `https://api.invariant.app/explorer/get-holders?address=${sBITZ}`
  )
  return data
}

export interface YieldIncome {
  currentYield: number
  currentReward: number
  projectedYield: number
  projectedReward: number
}

export function calculateYield(currentlyStaked: number, userStakeAmount: number): YieldIncome {
  const totalAfterStaking = currentlyStaked + userStakeAmount

  let currentYield = 0
  let currentReward = 0

  if (currentlyStaked > 0) {
    const rewardPerToken = TOTAL_INVT_REWARDS / currentlyStaked
    currentReward = rewardPerToken
    currentYield = (rewardPerToken / 1) * 100
  }

  let projectedYield = 0
  let projectedReward = 0

  if (totalAfterStaking > 0 && userStakeAmount > 0) {
    const userShare = userStakeAmount / totalAfterStaking
    projectedReward = userShare * TOTAL_INVT_REWARDS
    projectedYield = (projectedReward / userStakeAmount) * 100
  }

  return {
    currentYield: Math.round(currentYield * 100) / 100,
    currentReward: Math.round(currentReward * 100) / 100,
    projectedYield: Math.round(projectedYield * 100) / 100,
    projectedReward: Math.round(projectedReward * 100) / 100
  }
}

export const displayYieldComparison = (
  currentlyStaked: number,
  userStakeAmount: number
): InvtConvertedData => {
  const totalAfterStaking = currentlyStaked + userStakeAmount

  const statsYeldPerToken =
    currentlyStaked > 0
      ? (1 / currentlyStaked) * TOTAL_INVT_REWARDS * 100
      : TOTAL_INVT_REWARDS * 100

  const statsRewardPerToken =
    currentlyStaked > 0 ? (1 / currentlyStaked) * TOTAL_INVT_REWARDS : TOTAL_INVT_REWARDS

  const newYieldPerToken =
    totalAfterStaking > 0
      ? (1 / totalAfterStaking) * TOTAL_INVT_REWARDS * 100
      : TOTAL_INVT_REWARDS * 100

  const newRewardPerToken =
    totalAfterStaking > 0 ? (1 / totalAfterStaking) * TOTAL_INVT_REWARDS : TOTAL_INVT_REWARDS

  return {
    currentStakeInfo: {
      totalInvtStaked: currentlyStaked,
      statsYieldPercentage: statsYeldPerToken,
      rewardPerToken: statsRewardPerToken,
      invtDepositFilledPercentage: (100 * currentlyStaked) / INVT_DEPOSIT_LIMIT
    },
    userProjection: {
      userStakeAmount: userStakeAmount,
      expectedYieldPercentage: newYieldPerToken,
      expectedReward: userStakeAmount * newRewardPerToken
    },
    impact: {
      newYieldPercentage: newYieldPerToken,
      newStakeSize: totalAfterStaking
    }
  }
}

export const getTokenReserve = async (
  address: PublicKey,
  connection: Connection
): Promise<TokenReserve | null> => {
  try {
    const result = await connection.getTokenAccountBalance(address)

    if (!result?.value) return null

    return {
      amount: result.value.amount,
      decimals: result.value.decimals,
      uiAmount: result.value.uiAmount ?? 0,
      uiAmountString: result.value.uiAmountString || ''
    }
  } catch (error) {
    console.error('Failed to fetch token reserve:', error)
    return null
  }
}

export interface Candle {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TradingViewChartProps {
  currentNetwork: NetworkType
  tokenFromIndex: number | null
  tokenToIndex: number | null
  tokens: SwapToken[]
}

export interface PoolsMultiItem {
  id: string
  attributes: {
    address: string
    volume_usd?: Record<string, string | number>
  }
}

export const parseNum = (v: unknown) => {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : 0
}

export const fetchBestPoolAddress = async (addresses: string[]): Promise<string | null> => {
  if (!addresses.length) return null
  const url = `https://api.geckoterminal.com/api/v2/networks/eclipse/pools/multi/${addresses.join(',')}`
  const res = await fetch(url)
  if (!res.ok) return null
  const json = await res.json()
  const items: PoolsMultiItem[] = json?.data ?? []

  let best: { addr: string; score: number } | null = null
  for (const it of items) {
    const vol = it.attributes.volume_usd ?? {}
    const h24 = parseNum((vol as any).h24)
    const fallbackSum: number =
      h24 > 0
        ? h24
        : Number(Object.values(vol).reduce((acc, val) => Number(acc) + parseNum(val), 0))

    const addr = it.attributes.address
    if (!best || fallbackSum > best.score) best = { addr, score: fallbackSum }
  }

  return best?.addr ?? null
}

export enum CandleIntervals {
  OneMinute = '1m',
  FiveMinutes = '5m',
  FifteenMinutes = '15m',
  OneHour = '1h',
  FourHours = '4h',
  TwelveHours = '12h',
  Daily = '1D',
  Weekly = '1W',
  Monthly = '1M'
}

export const intervalToParams: Record<
  CandleIntervals,
  { base: 'minute' | 'hour' | 'day'; aggregate: string }
> = {
  [CandleIntervals.OneMinute]: { base: 'minute', aggregate: '1' },
  [CandleIntervals.FiveMinutes]: { base: 'minute', aggregate: '5' },
  [CandleIntervals.FifteenMinutes]: { base: 'minute', aggregate: '15' },
  [CandleIntervals.OneHour]: { base: 'hour', aggregate: '1' },
  [CandleIntervals.FourHours]: { base: 'hour', aggregate: '4' },
  [CandleIntervals.TwelveHours]: { base: 'hour', aggregate: '12' },
  [CandleIntervals.Daily]: { base: 'day', aggregate: '1' },
  [CandleIntervals.Weekly]: { base: 'day', aggregate: '1' },
  [CandleIntervals.Monthly]: { base: 'day', aggregate: '1' }
}
export const fetchData = async (
  poolAddress: string,
  interval: CandleIntervals
): Promise<Candle[]> => {
  const { base, aggregate } = intervalToParams[interval]

  const params = new URLSearchParams({
    aggregate,
    limit: '1000',
    currency: 'token',
    include_empty_intervals: 'false',
    token: 'quote'
  })

  const url =
    `https://api.geckoterminal.com/api/v2/networks/eclipse` +
    `/pools/${poolAddress}/ohlcv/${base}?${params.toString()}`

  const res = await fetch(url)
  const json = await res.json()

  if (!json?.data?.attributes?.ohlcv_list) {
    console.warn('No OHLCV data returned:', json)
    return []
  }

  const list: any[][] = json.data.attributes.ohlcv_list

  return list.map(([time, open, high, low, close, volume]) => ({
    time: time as UTCTimestamp,
    open,
    high,
    low,
    close,
    volume
  }))
}
