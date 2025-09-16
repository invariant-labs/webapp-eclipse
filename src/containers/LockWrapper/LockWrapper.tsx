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
import { network } from '@store/selectors/solanaConnection'
import { INVT_MAIN, xINVT_MAIN } from '@store/consts/static'
import { displayYieldComparison, getTokenPrice, printBN } from '@utils/utils'
import { BannerPhase, LockerSwitch } from '@store/consts/types'
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
export interface BannerState {
  key: BannerPhase
  text: string
  timestamp: number
}

export const LockWrapper: React.FC = () => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const networkType = useSelector(network)
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

  const depositLoading = useSelector(lockOperationLoading)
  const statsLoading = useSelector(invtStatsLoading)

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

    Promise.allSettled([getTokenPrice(networkType, invtAddr)])
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
        text: 'Lock starts in:',
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
  return (
    <Grid container className={classes.wrapper}>
      <DynamicBanner bannerState={bannerState} />
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
          unlockDisabled={true}
          statsData={yieldIncomes}
          statsLoading={statsLoading}
        />
        <StatsLocker
          statsData={yieldIncomes}
          userLockedInvt={userXInvtBalance}
          loading={statsLoading}
        />
      </Box>
    </Grid>
  )
}

export default LockWrapper
