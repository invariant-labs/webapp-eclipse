import PoolDetails from '@components/PoolDetails/PoolDetails'
import { ALL_FEE_TIERS_DATA } from '@store/consts/static'
import { getPromotedPools, leaderboardSelectors } from '@store/selectors/leaderboard'
import {
  isLoadingLatestPoolsForTransaction,
  isLoadingTokens,
  poolsArraySortedByFees
} from '@store/selectors/pools'
import { network } from '@store/selectors/solanaConnection'
import { poolTokens, SwapToken } from '@store/selectors/solanaWallet'
import {
  getTokenPrice,
  getTokenReserve,
  initialXtoY,
  parseFeeToPathFee,
  parsePathFeeToFeeString,
  printBN,
  ROUTES,
  tickerToAddress
} from '@utils/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { actions as poolsActions, PoolWithAddress } from '@store/reducers/pools'
import { Pair } from '@invariant-labs/sdk-eclipse'
import {
  currentInterval,
  currentPoolData,
  isLoading,
  lastInterval,
  lastSnapTimestamp
} from '@store/selectors/stats'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import { actions as snackbarActions } from '@store/reducers/snackbars'
import { actions as navigationActions } from '@store/reducers/navigation'
import { address, showFavourites as showFavouritesSelector } from '@store/selectors/navigation'
import { actions } from '@store/reducers/stats'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import { VariantType } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { getCurrentSolanaConnection } from '@utils/web3/connection'
import { Connection, PublicKey } from '@solana/web3.js'
import { TokenReserve } from '@store/consts/types'
import { set } from 'remeda'
import { token } from '@coral-xyz/anchor/dist/cjs/utils'

export interface IProps {
  initialTokenFrom: string
  initialTokenTo: string
  initialFee: string
}

export const PoolDetailsWrapper: React.FC<IProps> = ({
  initialTokenFrom,
  initialTokenTo,
  initialFee
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const locationHistory = useSelector(address)

  const tokens = useSelector(poolTokens)

  const isCurrentlyLoadingTokens = useSelector(isLoadingTokens)

  const allPools = useSelector(poolsArraySortedByFees)
  const currentNetwork = useSelector(network)

  const statsPoolData = useSelector(currentPoolData)
  const lastStatsTimestamp = useSelector(lastSnapTimestamp)
  const isLoadingStats = useSelector(isLoading)
  const promotedPools = useSelector(getPromotedPools)

  const lastUsedInterval = useSelector(currentInterval)
  const lastFetchedInterval = useSelector(lastInterval)

  const showFavourites = useSelector(showFavouritesSelector)

  const isFetchingNewPool = useSelector(isLoadingLatestPoolsForTransaction)

  const [favouritePools, setFavouritePools] = useState<Set<string>>(
    new Set(
      JSON.parse(
        localStorage.getItem(`INVARIANT_FAVOURITE_POOLS_Eclipse_${currentNetwork}`) || '[]'
      )
    )
  )

  const [tokenX, settokenX] = useState<SwapToken | null>(null)
  const [tokenY, settokenY] = useState<SwapToken | null>(null)

  const [tokenXReserve, settokenXReserve] = useState<TokenReserve | null>(null)
  const [tokenYReserve, settokenYReserve] = useState<TokenReserve | null>(null)

  const [prices, setPrices] = useState<{ tokenX: number; tokenY: number }>({
    tokenX: 0,
    tokenY: 0
  })

  const [poolData, setPoolData] = useState<PoolWithAddress | null>(null)

  const fetchTokensReserves = async (
    tokenX: PublicKey,
    tokenY: PublicKey,
    connection: Connection
  ) => {
    const [tokenXReserve, tokenYReserve] = await Promise.all([
      getTokenReserve(tokenX, connection),
      getTokenReserve(tokenY, connection)
    ])

    return { tokenXReserve, tokenYReserve }
  }

  useEffect(() => {
    dispatch(actions.setLoadingStats(true))
  }, [])

  useEffect(() => {
    const connection = getCurrentSolanaConnection()
    if (poolData && connection) {
      fetchTokensReserves(poolData.tokenXReserve, poolData.tokenYReserve, connection)
        .then(({ tokenXReserve, tokenYReserve }) => {
          settokenXReserve(tokenXReserve)
          settokenYReserve(tokenYReserve)
        })
        .catch(err => {
          console.error('Error fetching reserves:', err)
        })
    }
  }, [poolData])

  useEffect(() => {
    const loadPrices = async () => {
      if (!tokenX || !tokenY) return
      const priceResults = await Promise.all([
        await getTokenPrice(tokenX?.assetAddress.toString(), currentNetwork),
        await getTokenPrice(tokenY?.assetAddress.toString(), currentNetwork)
      ])

      const tokenXPrice = priceResults[0]
      const tokenYPrice = priceResults[1]

      setPrices({
        tokenX: tokenXPrice ?? 0,
        tokenY: tokenYPrice ?? 0
      })
    }

    loadPrices()
  }, [tokenX, tokenY])

  const isPoolDataLoading = useMemo(() => {
    if (poolData !== null) {
      return false
    }

    return isFetchingNewPool
  }, [isFetchingNewPool, poolData, tokenX, tokenY])

  const getTokenIndex = (ticker: string) => {
    const address = tickerToAddress(currentNetwork, ticker)
    if (!address) return { address: null, index: -1 }

    return address
  }

  useEffect(() => {
    dispatch(leaderboardActions.getLeaderboardConfig())
  }, [])

  useEffect(() => {
    console.log('test')
    if (!lastUsedInterval || !poolData?.address) return
    console.log(lastUsedInterval)
    dispatch(
      actions.getCurrentIntervalPoolStats({
        interval: lastUsedInterval,
        poolAddress: poolData?.address.toString()
      })
    )
  }, [lastFetchedInterval, poolData?.address])

  useEffect(() => {
    if (lastUsedInterval || !poolData?.address) return

    dispatch(
      actions.getCurrentIntervalPoolStats({
        interval: IntervalsKeys.Daily,
        poolAddress: poolData?.address.toString()
      })
    )

    dispatch(actions.setCurrentInterval({ interval: IntervalsKeys.Daily }))
  }, [lastUsedInterval, poolData?.address])

  const updateInterval = (interval: IntervalsKeys) => {
    if (!poolData?.address) return
    dispatch(
      actions.getCurrentIntervalPoolStats({
        interval,
        poolAddress: poolData?.address.toString()
      })
    )
    dispatch(actions.setCurrentInterval({ interval }))
  }

  const copyAddressHandler = (message: string, variant: VariantType) => {
    dispatch(
      snackbarActions.add({
        message,
        variant,
        persist: false
      })
    )
  }

  useEffect(() => {
    const tokenXAddress = getTokenIndex(initialTokenFrom)
    const tokenYAddress = getTokenIndex(initialTokenTo)

    const tokenX = tokens.find(token => token.address.toString() === tokenXAddress?.toString())
    const tokenY = tokens.find(token => token.address.toString() === tokenYAddress?.toString())

    if (!tokenX || !tokenY) return

    const isXToY = tokenX.assetAddress.toString() < tokenY.assetAddress.toString()

    settokenX(isXToY ? tokenX : tokenY)
    settokenY(isXToY ? tokenY : tokenX)
  }, [tokens.length])

  const { fee, tickSpacing } = useMemo(() => {
    const parsedFee = parsePathFeeToFeeString(initialFee)

    const feeTierData = ALL_FEE_TIERS_DATA.find(
      feeTierData => feeTierData.tier.fee.toString() === parsedFee
    )

    return feeTierData
      ? { fee: feeTierData.tier.fee, tickSpacing: feeTierData.tier.tickSpacing }
      : { fee: undefined, tickSpacing: undefined }
  }, [initialFee])

  useEffect(() => {
    if (fee && tickSpacing && tokenX && tokenY) {
      dispatch(
        poolsActions.getPoolData(
          new Pair(tokenX.assetAddress, tokenY.assetAddress, {
            fee,
            tickSpacing
          })
        )
      )
    }
  }, [fee, tokenX, tokenY])

  useEffect(() => {
    if (!isPoolDataLoading && tokenX?.assetAddress && tokenY?.assetAddress && fee) {
      const index = allPools.findIndex(
        pool =>
          pool.fee.eq(fee) &&
          ((pool.tokenX.equals(tokenX.assetAddress) && pool.tokenY.equals(tokenY.assetAddress)) ||
            (pool.tokenX.equals(tokenY.assetAddress) && pool.tokenY.equals(tokenX.assetAddress)))
      )
      setPoolData(allPools[index])
    }
  }, [isPoolDataLoading, allPools.length])

  const handleOpenSwap = () => {
    navigate(ROUTES.getExchangeRoute(tokenX?.symbol, tokenY?.symbol), {
      state: { referer: 'stats' }
    })
  }

  const handleOpenPosition = () => {
    dispatch(navigationActions.setNavigation({ address: location.pathname }))
    navigate(
      ROUTES.getNewPositionRoute(
        tokenX?.symbol,
        tokenY?.symbol,
        parseFeeToPathFee(Math.round(fee * 10 ** (DECIMAL - 2)))
      ),
      { state: { referer: 'stats' } }
    )
  }

  const selectFeeTier = (value: number) => {
    if (!poolData) return

    const address1 = tokenX?.symbol
    const address2 = tokenY?.symbol
    const parsedFee = parseFeeToPathFee(poolData.fee)

    navigate(ROUTES.getPoolDetailsRoute(address1, address2, parsedFee))
  }

  const feeTiers = ALL_FEE_TIERS_DATA.map(tier => +printBN(tier.tier.fee, DECIMAL - 2))

  const handleBack = () => {
    const path = locationHistory === ROUTES.ROOT ? ROUTES.PORTFOLIO : locationHistory
    navigate(path)
  }

  return (
    <PoolDetails
      network={currentNetwork}
      statsPoolData={statsPoolData}
      tokenX={tokenX}
      tokenY={tokenY}
      handleOpenSwap={handleOpenSwap}
      handleOpenPosition={handleOpenPosition}
      poolData={poolData}
      isPoolDataLoading={isPoolDataLoading}
      interval={lastUsedInterval ?? IntervalsKeys.Daily}
      isLoadingStats={isLoadingStats}
      lastStatsTimestamp={lastStatsTimestamp}
      setChartType={e => dispatch(actions.setPoolDetailsChartType(e))}
      copyAddressHandler={copyAddressHandler}
      updateInterval={updateInterval}
      tokenXReserve={tokenXReserve}
      tokenYReserve={tokenYReserve}
      prices={prices}
      selectFeeTier={selectFeeTier}
      feeTiers={feeTiers}
      initialFee={initialFee}
      handleBack={handleBack}
    />
  )
}

export default PoolDetailsWrapper
