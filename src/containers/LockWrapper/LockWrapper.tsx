import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import {
  balance,
  balanceLoading,
  status,
  SwapToken,
  swapTokensDict
} from '@store/selectors/solanaWallet'
import { actions, LockLiquidityPayload } from '@store/reducers/xInvt'
import { actions as walletActions } from '@store/reducers/solanaWallet'
import { actions as navigationActions } from '@store/reducers/navigation'
import { network } from '@store/selectors/solanaConnection'
import { INVT_MAIN, USDC_MAIN, xINVT_MAIN } from '@store/consts/static'
import {
  addressToTicker,
  displayYieldComparison,
  getTokenPrice,
  parseFeeToPathFee,
  printBN,
  ROUTES
} from '@utils/utils'
import { BannerPhase, LockerSwitch, PoolBannerItem } from '@store/consts/types'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { refreshIcon } from '@static/icons'
import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import XInvtLocker from '@components/XInvtLocker/XInvtLocker/XInvtLocker'
import {
  lockerTab,
  lockInputVal,
  unlockInputVal,
  success as successState,
  inProgress,
  invtMarketData,
  lockOperationLoading,
  invtStatsLoading
} from '@store/selectors/xInvt'
import { StatsLocker } from '@components/XInvtLocker/StatsLocker/StatsLocker'
import useStyles from './styles'
import DynamicBanner from '@components/DynamicBanner/DynamicBanner'
import PoolBanner from '@components/XInvtLocker/PoolBanner/PoolBanner'
import { useNavigate } from 'react-router-dom'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import imgInvtXInvt from '@static/png/xInvt/invt-xInvt.png'
import imgUsdcInvt from '@static/png/xInvt/usdc-invt.png'
import imgxInvtUsdc from '@static/png/xInvt/xInvt-usdc.png'

export interface BannerState {
  key: BannerPhase
  text: string
  timestamp: number
}

export const LockWrapper: React.FC = () => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const currentNetwork = useSelector(network)
  const walletStatus = useSelector(status)
  const marketData = useSelector(invtMarketData)
  const tokens = useSelector(swapTokensDict)
  const ethBalance = useSelector(balance)
  const isBalanceLoading = useSelector(balanceLoading)
  const lockInput = useSelector(lockInputVal)
  const unlockInput = useSelector(unlockInputVal)
  const isInProgress = useSelector(inProgress)
  const success = useSelector(successState)
  const currentLockerTab = useSelector(lockerTab)

  const [invtPrice, setInvtPrice] = useState(0)
  const [progress, setProgress] = useState<ProgressState>('none')
  const [priceLoading, setPriceLoading] = useState(false)
  const [bannerInitialLoading, setBannerInitialLoading] = useState(true)
  const depositLoading = useSelector(lockOperationLoading)
  const statsLoading = useSelector(invtStatsLoading)

  const [favouritePools, setFavouritePools] = useState<Set<string>>(
    new Set(
      JSON.parse(
        localStorage.getItem(`INVARIANT_FAVOURITE_POOLS_Eclipse_${currentNetwork}`) || '[]'
      )
    )
  )

  const switchFavouritePool = (poolAddress: string) => {
    if (favouritePools.has(poolAddress)) {
      const updatedFavouritePools = new Set(favouritePools)
      updatedFavouritePools.delete(poolAddress)
      setFavouritePools(updatedFavouritePools)
    } else {
      const updatedFavouritePools = new Set(favouritePools)
      updatedFavouritePools.add(poolAddress)
      setFavouritePools(updatedFavouritePools)
    }
  }

  const amountFrom = useMemo(() => {
    if (currentLockerTab === LockerSwitch.Lock) return lockInput
    return unlockInput
  }, [currentLockerTab, lockInput, unlockInput])

  const yieldIncomes = useMemo(() => {
    return displayYieldComparison(marketData.lockedInvt || 0, +amountFrom)
  }, [marketData, amountFrom])

  const tokenFrom: SwapToken = useMemo(
    () =>
      currentLockerTab === LockerSwitch.Lock
        ? tokens[INVT_MAIN.address.toString()]
        : tokens[xINVT_MAIN.address.toString()],
    [currentLockerTab, tokens]
  )

  const tokenTo: SwapToken = useMemo(
    () =>
      currentLockerTab === LockerSwitch.Unlock
        ? tokens[INVT_MAIN.address.toString()]
        : tokens[xINVT_MAIN.address.toString()],
    [currentLockerTab, tokens]
  )
  const userXInvtBalance = useMemo(
    () =>
      +printBN(
        tokenFrom.assetAddress.toString() === xINVT_MAIN.address.toString()
          ? tokenFrom.balance
          : tokenTo.balance,
        xINVT_MAIN?.decimals
      ),
    [tokenFrom, tokenTo]
  )

  const fetchPrices = () => {
    setPriceLoading(true)

    const invtAddr = INVT_MAIN.address.toString()

    Promise.allSettled([getTokenPrice(currentNetwork, invtAddr)])
      .then(([res]) => {
        const invtPrice = res.status === 'fulfilled' && res.value != null ? res.value : 0
        setInvtPrice(invtPrice ?? 0)
      })
      .finally(() => {
        setPriceLoading(false)
      })
      .catch(() => {
        setPriceLoading(false)
      })
  }

  useEffect(() => {
    dispatch(walletActions.getBalance())
    dispatch(actions.getCurrentStats())

    fetchPrices()
  }, [dispatch])
  useEffect(() => {
    if (bannerInitialLoading && !statsLoading) {
      setBannerInitialLoading(false)
    }
  }, [statsLoading, bannerInitialLoading])
  const onRefresh = () => {
    if (depositLoading) return
    dispatch(walletActions.getBalance())
    dispatch(actions.getCurrentStats())
    fetchPrices()
  }

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout

    if (!isInProgress && progress === 'progress') {
      setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

      timeoutId1 = setTimeout(() => {
        setProgress(success ? 'success' : 'failed')
      }, 1000)

      timeoutId2 = setTimeout(() => {
        setProgress('none')
      }, 3000)
    }

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
    }
  }, [success, isInProgress])
  const currentUnix = Math.floor(Date.now() / 1000)

  const bannerState: BannerState = useMemo(() => {
    const mintStart = marketData?.mintStartTime ? +marketData.mintStartTime : 0
    const mintEnd = marketData?.mintEndTime ? +marketData.mintEndTime : 0
    const burnStart = marketData?.burnStartTime ? +marketData.burnStartTime : 0
    const burnEnd = marketData?.burnEndTime ? +marketData.burnEndTime : 0

    if (currentUnix < mintStart) {
      return {
        key: BannerPhase.beforeStartPhase,
        text: 'INVT locking available in:',
        timestamp: mintStart
      }
    }

    if (currentUnix < mintEnd) {
      return {
        key: BannerPhase.lockPhase,
        text: 'Lock ends in:',
        timestamp: mintEnd
      }
    }

    if (currentUnix < burnStart) {
      return {
        key: BannerPhase.yieldPhase,
        text: 'Redeem available in:',
        timestamp: burnStart
      }
    }

    if (currentUnix < burnEnd) {
      return {
        key: BannerPhase.burningPhase,
        text: 'Burn ends in:',
        timestamp: burnEnd
      }
    }

    return { key: BannerPhase.endPhase, text: 'Burn ended', timestamp: 0 }
  }, [marketData, currentUnix])

  useEffect(() => {
    if (bannerState.key === BannerPhase.burningPhase) {
      dispatch(actions.setLockTab({ tab: LockerSwitch.Unlock }))
    } else if (bannerState.key === BannerPhase.lockPhase) {
      dispatch(actions.setLockTab({ tab: LockerSwitch.Lock }))
    }
  }, [bannerState])

  const unlockDisabled = useMemo(() => {
    if (bannerState.key === BannerPhase.lockPhase) {
      return true
    } else {
      return false
    }
  }, [bannerState])
  const lockDisabled = useMemo(() => {
    if (bannerState.key === BannerPhase.burningPhase) {
      return true
    } else {
      return false
    }
  }, [bannerState])

  const handleOpenPosition = (pool: PoolBannerItem) => {
    const tokenA = addressToTicker(currentNetwork, pool.tokenX.address.toString() ?? '')
    const tokenB = addressToTicker(currentNetwork, pool.tokenY.address.toString() ?? '')

    dispatch(navigationActions.setNavigation({ address: location.pathname }))
    navigate(
      ROUTES.getNewPositionRoute(
        tokenA,
        tokenB,
        parseFeeToPathFee(Math.round(1 * 10 ** (DECIMAL - 2)))
      ),
      { state: { referer: 'stats' } }
    )
  }

  const pools: PoolBannerItem[] = [
    {
      poolAddress: '',
      tokenX: INVT_MAIN,
      tokenY: USDC_MAIN,
      fee: 1,
      poolDistribute: 122334,
      userEarn: 32,
      isFavourite: false,
      image: imgUsdcInvt
    },
    {
      poolAddress: '',
      tokenX: xINVT_MAIN,
      tokenY: INVT_MAIN,
      fee: 1,
      poolDistribute: 4321,
      userEarn: 321,
      isFavourite: false,
      image: imgInvtXInvt
    },
    {
      poolAddress: '',
      tokenX: xINVT_MAIN,
      tokenY: USDC_MAIN,
      fee: 0.3,
      poolDistribute: 32432,
      userEarn: 12,
      isFavourite: false,
      image: imgxInvtUsdc
    }
  ]

  return (
    <Grid container className={classes.wrapper}>
      <DynamicBanner isLoading={bannerInitialLoading} bannerState={bannerState} />
      <Box className={classes.titleWrapper}>
        <Box className={classes.titleTextWrapper}>
          <Typography component='h1'>INVT locking</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TooltipHover title='Refresh'>
            <Grid className={classes.refreshIconContainer}>
              <Button
                onClick={onRefresh}
                className={classes.refreshIconBtn}
                disabled={isBalanceLoading}>
                <img src={refreshIcon} className={classes.refreshIcon} alt='Refresh' />
              </Button>
            </Grid>
          </TooltipHover>
        </Box>
      </Box>
      <Box className={classes.panelsWrapper}>
        <XInvtLocker
          bannerState={bannerState}
          walletStatus={walletStatus}
          tokens={tokens}
          handleLock={(props: LockLiquidityPayload) => {
            dispatch(actions.lock(props))
          }}
          handleUnlock={(props: LockLiquidityPayload) => {
            dispatch(actions.unlock(props))
          }}
          onConnectWallet={() => {
            dispatch(walletActions.connect(false))
          }}
          onDisconnectWallet={() => {
            dispatch(walletActions.disconnect())
          }}
          changeLockerTab={(tab: LockerSwitch) => {
            dispatch(actions.setLockTab({ tab }))
          }}
          currentLockerTab={currentLockerTab}
          ethBalance={ethBalance}
          isBalanceLoading={isBalanceLoading}
          lockInput={lockInput}
          unlockInput={unlockInput}
          setLockInput={(val: string) => {
            dispatch(actions.setLockInputVal({ val }))
          }}
          setUnlockInput={(val: string) => {
            dispatch(actions.setUnlockInputVal({ val }))
          }}
          progress={progress}
          setProgress={setProgress}
          tokenFrom={tokenFrom}
          tokenTo={tokenTo}
          priceLoading={priceLoading}
          invtPrice={invtPrice}
          unlockDisabled={unlockDisabled}
          lockDisabled={lockDisabled}
          statsData={yieldIncomes}
          statsLoading={statsLoading}
        />
        <StatsLocker
          statsData={yieldIncomes}
          userLockedInvt={userXInvtBalance}
          loading={statsLoading}
        />
      </Box>
      <PoolBanner
        handleOpenPosition={handleOpenPosition}
        handleClaim={() => {}}
        switchFavouritePool={switchFavouritePool}
        pools={pools}
        isLoading={false}
      />
    </Grid>
  )
}

export default LockWrapper
