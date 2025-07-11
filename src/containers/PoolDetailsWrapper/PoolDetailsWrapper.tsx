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
  parseFeeToPathFee,
  parsePathFeeToFeeString,
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
import { showFavourites as showFavouritesSelector } from '@store/selectors/navigation'
import { actions } from '@store/reducers/stats'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import { VariantType } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { getCurrentSolanaConnection } from '@utils/web3/connection'
import { Connection, PublicKey } from '@solana/web3.js'
import { TokenReserve } from '@store/consts/types'

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

  const [tokenA, setTokenA] = useState<SwapToken | null>(null)
  const [tokenB, setTokenB] = useState<SwapToken | null>(null)

  const [tokenAReserve, setTokenAReserve] = useState<TokenReserve | null>(null)
  const [tokenBReserve, setTokenBReserve] = useState<TokenReserve | null>(null)

  const [prices, setPrices] = useState<{ tokenA: number; tokenB: number }>({
    tokenA: 0,
    tokenB: 0
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
          setTokenAReserve(tokenXReserve)
          setTokenBReserve(tokenYReserve)
        })
        .catch(err => {
          console.error('Error fetching reserves:', err)
        })
    }
  }, [poolData])

  useEffect(() => {
    const loadPrices = async () => {
      if (!tokenA || !tokenB) return
      const priceResults = await Promise.all([
        await getTokenPrice(tokenA?.assetAddress.toString(), currentNetwork),
        await getTokenPrice(tokenB?.assetAddress.toString(), currentNetwork)
      ])

      const tokenAPrice = priceResults[0]
      const tokenBPrice = priceResults[1]

      setPrices({
        tokenA: tokenAPrice ?? 0,
        tokenB: tokenBPrice ?? 0
      })
    }

    loadPrices()
  }, [tokenA, tokenB])

  const isPoolDataLoading = useMemo(() => {
    if (poolData !== null) {
      return false
    }

    return isFetchingNewPool
  }, [isFetchingNewPool, poolData, tokenA, tokenB])

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
    const tokenAAddress = getTokenIndex(initialTokenFrom)
    const tokenBAddress = getTokenIndex(initialTokenTo)

    const tokenA = tokens.find(token => token.address.toString() === tokenAAddress?.toString())
    const tokenB = tokens.find(token => token.address.toString() === tokenBAddress?.toString())
    if (tokenA) {
      setTokenA(tokenA)
    }

    if (tokenB) {
      setTokenB(tokenB)
    }
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
    if (fee && tickSpacing && tokenA && tokenB) {
      dispatch(
        poolsActions.getPoolData(
          new Pair(tokenA.assetAddress, tokenB.assetAddress, {
            fee,
            tickSpacing
          })
        )
      )
    }
  }, [fee, tokenA, tokenB])

  useEffect(() => {
    if (!isPoolDataLoading && tokenA?.assetAddress && tokenB?.assetAddress && fee) {
      const index = allPools.findIndex(
        pool =>
          pool.fee.eq(fee) &&
          ((pool.tokenX.equals(tokenA.assetAddress) && pool.tokenY.equals(tokenB.assetAddress)) ||
            (pool.tokenX.equals(tokenB.assetAddress) && pool.tokenY.equals(tokenA.assetAddress)))
      )
      setPoolData(allPools[index])
    }
  }, [isPoolDataLoading, allPools.length])

  const handleOpenSwap = () => {
    navigate(ROUTES.getExchangeRoute(tokenA?.symbol, tokenB?.symbol), {
      state: { referer: 'stats' }
    })
  }

  const handleOpenPosition = () => {
    dispatch(navigationActions.setNavigation({ address: location.pathname }))
    navigate(
      ROUTES.getNewPositionRoute(
        tokenA?.symbol,
        tokenB?.symbol,
        parseFeeToPathFee(Math.round(fee * 10 ** (DECIMAL - 2)))
      ),
      { state: { referer: 'stats' } }
    )
  }

  console.log(lastUsedInterval)
  console.log(statsPoolData?.volume)
  return (
    <PoolDetails
      network={currentNetwork}
      statsPoolData={statsPoolData}
      tokenA={tokenA}
      tokenB={tokenB}
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
    />
  )
}

export default PoolDetailsWrapper
