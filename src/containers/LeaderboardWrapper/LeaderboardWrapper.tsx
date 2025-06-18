import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/leaderboard'
import {
  contentPoints,
  getContentProgramDates,
  getPromotedPools,
  lastTimestamp,
  leaderboardSelectors,
  topRankedLpUsers,
  topRankedSwapUsers,
  topRankedTotalUsers
} from '@store/selectors/leaderboard'
import { actions as snackbarActions } from '@store/reducers/snackbars'
import { actions as positionListActions } from '@store/reducers/positions'
import { network } from '@store/selectors/solanaConnection'
import { VariantType } from 'notistack'
import { poolsStatsWithTokensDetails } from '@store/selectors/stats'
import { actions as statsActions } from '@store/reducers/stats'
import { positionsWithPoolsData } from '@store/selectors/positions'
import {
  estimatePointsForUserPositions,
  NUCLEUS_WHITELISTED_POOLS
} from '@invariant-labs/points-sdk'
import { BN } from '@coral-xyz/anchor'
import { PoolStructure, Position } from '@invariant-labs/sdk-eclipse/src/market'
import { isLoadingPositionsList } from '@store/selectors/positions'
import { checkDataDelay, ensureError, hexToDate } from '@utils/utils'
import {
  BANNER_HIDE_DURATION,
  BANNER_STORAGE_KEY,
  Intervals,
  LEADERBOARD_DECIMAL,
  LeaderBoardType,
  SNAP_TIME_DELAY,
  TETH_MAIN
} from '@store/consts/static'
import { Leaderboard } from '@components/Leaderboard/Leaderboard'
import { address, status } from '@store/selectors/solanaWallet'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { isActive } from '@invariant-labs/sdk-eclipse/lib/utils'

interface LeaderboardWrapperProps {}

export const LeaderboardWrapper: React.FC<LeaderboardWrapperProps> = () => {
  const dispatch = useDispatch()

  const currentNetwork = useSelector(network)
  const lastSnapTimestamp = useSelector(lastTimestamp)
  const userStats = useSelector(leaderboardSelectors.currentUser)
  const top3Scorers = useSelector(leaderboardSelectors.top3Scorers)
  const list = useSelector(positionsWithPoolsData)
  const itemsPerPage = useSelector(leaderboardSelectors.itemsPerPage)
  const leaderboardType = useSelector(leaderboardSelectors.type)
  const promotedPools = useSelector(getPromotedPools)
  const poolsList = useSelector(poolsStatsWithTokensDetails)
  const isLoadingList = useSelector(isLoadingPositionsList)
  const contentProgramDates = useSelector(getContentProgramDates)
  const walletStatus = useSelector(status)
  const userAddress = useSelector(address)
  const lpData = useSelector(topRankedLpUsers)
  const userContentPoints = useSelector(contentPoints)
  const swapData = useSelector(topRankedSwapUsers)
  const totalData = useSelector(topRankedTotalUsers)
  const isLoadingLeaderboardList = useSelector(leaderboardSelectors.loading)
  const currentPage = useSelector(leaderboardSelectors.currentPage)
  const totalItemsObject = useSelector(leaderboardSelectors.totalItems)
  const [showWarningBanner, setShowWarningBanner] = React.useState(true)
  const [selectedOption, setSelectedOption] = useState<LeaderBoardType>('Total')

  const [isLoadingDebounced, setIsLoadingDebounced] = useState(true)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isLoadingList || isLoadingLeaderboardList) {
      setIsLoadingDebounced(true)
    } else {
      timeout = setTimeout(() => {
        setIsLoadingDebounced(false)
      }, 400)
    }

    return () => clearTimeout(timeout)
  }, [isLoadingList, isLoadingLeaderboardList])

  useEffect(() => {
    if (selectedOption === 'Liquidity') {
      handlePageChange(Math.min(currentPage, Math.ceil(totalItemsObject.lp / itemsPerPage)))
    } else if (selectedOption === 'Swap') {
      handlePageChange(Math.min(currentPage, Math.ceil(totalItemsObject.swap / itemsPerPage)))
    } else {
      handlePageChange(currentPage)
    }
  }, [selectedOption])

  const isDelayWarning = useMemo(() => {
    if (!lastSnapTimestamp) return false
    const snapTime = hexToDate(lastSnapTimestamp)

    return checkDataDelay(snapTime, SNAP_TIME_DELAY)
  }, [lastSnapTimestamp])

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(actions.getLeaderboardData({ page, itemsPerPage }))
    },
    [dispatch, itemsPerPage, isConnected]
  )

  const hasTETHPosition = useMemo(
    () =>
      list.some(
        ({ tokenX, tokenY, lowerTickIndex, upperTickIndex, poolData }) =>
          [tokenX.assetAddress, tokenY.assetAddress].includes(TETH_MAIN.address) &&
          isActive(lowerTickIndex, upperTickIndex, poolData.currentTickIndex) &&
          NUCLEUS_WHITELISTED_POOLS.some(pool => pool.toString() === poolData.address.toString())
      ),
    [list]
  )
  const onConnectWallet = () => {
    dispatch(walletActions.connect(false))
  }
  const promotedPoolsData = useMemo(() => {
    return promotedPools
      .map(promotedPool =>
        poolsList.find(poolWithData => poolWithData.poolAddress.toString() === promotedPool.address)
      )
      .filter(poolData => !!poolData)
      .map(poolWithData => {
        return {
          ...poolWithData,
          pointsPerSecond: promotedPools.find(
            promotedPool => poolWithData.poolAddress.toString() === promotedPool.address
          )!.pointsPerSecond
        }
      })
  }, [promotedPools.length, poolsList.length])

  const estimated24hPoints = useMemo(() => {
    const eligiblePositions = {}
    list.forEach(position => {
      if (promotedPools.some(pool => pool.address === position.pool.toString())) {
        const v = eligiblePositions[position.pool.toString()]
        if (!v) {
          eligiblePositions[position.pool.toString()] = [position]
        } else {
          eligiblePositions[position.pool.toString()].push(position)
        }
      }
    })

    const estimation: BN = Object.values(eligiblePositions).reduce((acc: BN, positions: any) => {
      const estimation = estimatePointsForUserPositions(
        positions as Position[],
        positions[0].poolData as PoolStructure,
        new BN(
          promotedPools.find(
            pool => pool.address === positions[0].pool.toString()
          )!.pointsPerSecond,
          'hex'
        ).mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
      )

      return acc.add(estimation)
    }, new BN(0))

    return estimation
  }, [userStats, list])

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
    if (isConnected) {
      dispatch(actions.getContentPointsRequest())
    }
  }, [dispatch, isConnected, userAddress])
  useEffect(() => {
    dispatch(actions.getLeaderboardConfig())
    dispatch(statsActions.getCurrentIntervalStats({ interval: Intervals.Daily }))

    dispatch(positionListActions.getPositionsList())
  }, [dispatch, itemsPerPage])

  useLayoutEffect(() => {
    const checkBannerState = () => {
      const storedData = localStorage.getItem(BANNER_STORAGE_KEY)
      if (storedData) {
        try {
          const { hiddenAt } = JSON.parse(storedData)
          const currentTime = new Date().getTime()
          if (currentTime - hiddenAt < BANNER_HIDE_DURATION) {
            setShowWarningBanner(false)
          } else {
            localStorage.removeItem(BANNER_STORAGE_KEY)
            setShowWarningBanner(true)
          }
        } catch (e: unknown) {
          const error = ensureError(e)
          console.error('Error parsing banner state:', error)
          localStorage.removeItem(BANNER_STORAGE_KEY)
        }
      }
    }

    checkBannerState()
  }, [])

  useEffect(() => {
    dispatch(actions.setLeaderBoardType(selectedOption))
  }, [selectedOption])

  return (
    <Leaderboard
      hasTETHPosition={hasTETHPosition}
      userContentPoints={userContentPoints}
      copyAddressHandler={copyAddressHandler}
      currentNetwork={currentNetwork}
      estimated24hPoints={estimated24hPoints}
      isDelayWarning={isDelayWarning}
      lastSnapTimestamp={lastSnapTimestamp}
      leaderboardType={leaderboardType}
      promotedPoolsData={promotedPoolsData}
      top3Scorers={top3Scorers}
      userStats={userStats}
      selectedOption={selectedOption}
      setSelectedOption={setSelectedOption}
      showWarningBanner={showWarningBanner}
      setShowWarningBanner={setShowWarningBanner}
      currentPage={currentPage}
      handlePageChange={handlePageChange}
      itemsPerPage={itemsPerPage}
      lpData={lpData}
      swapData={swapData}
      totalData={totalData}
      totalItems={totalItemsObject}
      onConnectWallet={onConnectWallet}
      totalItemsObject={totalItemsObject}
      userAddress={userAddress}
      walletStatus={walletStatus}
      isLoadingLeaderboardList={isLoadingLeaderboardList}
      contentProgramDates={contentProgramDates}
      isLoadingDebounced={isLoadingDebounced}
    />
  )
}
