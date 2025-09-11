import React, { useEffect, useMemo, useState } from 'react'
import useStyles from './styles'
import { Box, Button, Grid, Typography, useMediaQuery } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import {
  balance,
  balanceLoading,
  status,
  SwapToken,
  swapTokensDict
} from '@store/selectors/solanaWallet'
import { StakeLiquidityPayload } from '@store/reducers/sBitz'
import { actions } from '@store/reducers/xInvt'
import { actions as walletActions } from '@store/reducers/solanaWallet'
import { stakedData } from '@store/selectors/sBitz'
import { isLoading } from '@store/selectors/sbitz-stats'
import { network } from '@store/selectors/solanaConnection'
import { BN } from '@coral-xyz/anchor'
import { computeBitzAprApy } from '@invariant-labs/sbitz'
import { INVT_MAIN, xINVT_MAIN } from '@store/consts/static'
import { getTokenPrice, printBN } from '@utils/utils'
import { LockerSwitch } from '@store/consts/types'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { refreshIcon } from '@static/icons'
import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { theme } from '@static/theme'

import XInvtLocker from '@components/XInvtLocker/XInvtLocker/XInvtLocker'
import {
  lockerTab,
  lockInputVal,
  unlockInputVal,
  success as successState,
  inProgress
} from '@store/selectors/xInvt'

export const LockWrapper: React.FC = () => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const networkType = useSelector(network)
  const walletStatus = useSelector(status)
  const tokens = useSelector(swapTokensDict)
  const ethBalance = useSelector(balance)
  const isBalanceLoading = useSelector(balanceLoading)
  const lockInput = useSelector(lockInputVal)
  const unlockInput = useSelector(unlockInputVal)
  const isInProgress = useSelector(inProgress)
  const success = useSelector(successState)
  const isLoadingStats = useSelector(isLoading)

  const stakedBitzData = useSelector(stakedData)
  // const stakeLoading = useSelector(stakeDataLoading)
  const currentLockerTab = useSelector(lockerTab)

  const [invtPrice, setInvtPrice] = useState(0)
  const [progress, setProgress] = useState<ProgressState>('none')
  const [priceLoading, setPriceLoading] = useState(false)

  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  const sBitzApyApr = useMemo(() => {
    if (!stakedBitzData.bitzTotalBalance) return { apr: 0, apy: 0 }
    return computeBitzAprApy(+printBN(stakedBitzData.bitzTotalBalance, INVT_MAIN.decimals))
  }, [stakedBitzData])

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

  const fetchPrices = () => {
    setPriceLoading(true)

    const invtAddr = INVT_MAIN.address.toString()

    Promise.allSettled([getTokenPrice(networkType, invtAddr)])

      .then(([bitzRes]) => {
        const invtPrice =
          bitzRes.status === 'fulfilled' && bitzRes.value != null ? bitzRes.value : 0

        setInvtPrice(invtPrice ?? 0)
      })
      .finally(() => {
        setPriceLoading(false)
      })
  }

  useEffect(() => {
    dispatch(walletActions.getBalance())
    fetchPrices()
  }, [dispatch])

  const onRefresh = () => {
    dispatch(walletActions.getBalance())
    // dispatch(actions.getStakedAmountAndBalance())
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

  // const toggleExpand = () => {
  //   const isWalletInitialized = walletStatus === Status.Initialized
  //   const newExpandedState = isWalletInitialized && !isExpanded

  //   localStorage.setItem(PORTFOLIO_STAKE_STORAGE_KEY, JSON.stringify(newExpandedState))

  //   if (newExpandedState) {
  //     setShouldRenderStats(true)
  //     setTimeout(() => setIsExpanded(true), PORTFOLIO_STAKE_EXPAND_DELAY)
  //   } else {
  //     setIsExpanded(false)
  //     if (shouldRenderStats) {
  //       setTimeout(() => setShouldRenderStats(false), PORTFOLIO_STAKE_COLLAPSE_DELAY)
  //     }
  //   }
  // }

  // useEffect(() => {
  //   const isWalletInitialized = walletStatus === Status.Initialized

  //   if (isWalletInitialized) {
  //     const savedExpandedState = localStorage.getItem(PORTFOLIO_STAKE_STORAGE_KEY)
  //     const shouldExpand = savedExpandedState !== null && JSON.parse(savedExpandedState)

  //     if (shouldExpand) {
  //       setShouldRenderStats(true)
  //       setTimeout(() => setIsExpanded(true), PORTFOLIO_STAKE_EXPAND_DELAY)
  //     }
  //   } else {
  //     setIsExpanded(false)
  //     setShouldRenderStats(false)
  //   }

  //   prevConnectionStatus.current = walletStatus
  // }, [walletStatus])
  return (
    <Grid container className={classes.wrapper}>
      <Box className={classes.animatedContainer}>
        <Box className={classes.liquidityStakingWrapper}>
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
                    disabled={isBalanceLoading || isLoadingStats}>
                    <img src={refreshIcon} className={classes.refreshIcon} alt='Refresh' />
                  </Button>
                </Grid>
              </TooltipHover>
            </Box>
          </Box>
          <Box className={classes.stakingContentWrapper}>
            <XInvtLocker
              walletStatus={walletStatus}
              tokens={tokens}
              handleLock={(props: StakeLiquidityPayload) => {
                dispatch(actions.lock(props))
              }}
              handleUnlock={(props: StakeLiquidityPayload) => {
                dispatch(actions.unlock(props))
              }}
              onConnectWallet={() => {
                dispatch(walletActions.connect(false))
              }}
              onDisconnectWallet={() => {
                dispatch(walletActions.disconnect())
              }}
              sBitzApyApr={sBitzApyApr}
              stakedTokenSupply={stakedBitzData.stakedTokenSupply || new BN(0)}
              stakedAmount={stakedBitzData.stakedAmount || new BN(0)}
              stakeDataLoading={false} //set loading
              changeLockerTab={(tab: LockerSwitch) => {
                dispatch(actions.setStakeTab({ tab }))
              }}
              currentLockerTab={currentLockerTab}
              ethBalance={ethBalance}
              isBalanceLoading={isBalanceLoading}
              lockInput={lockInput}
              unlockInput={unlockInput}
              setStakeInput={(val: string) => {
                dispatch(actions.setLockInputVal({ val }))
              }}
              setUnstakeInput={(val: string) => {
                dispatch(actions.setUnlockInputVal({ val }))
              }}
              progress={progress}
              setProgress={setProgress}
              tokenFrom={tokenFrom}
              tokenTo={tokenTo}
              priceLoading={priceLoading}
              invtPrice={invtPrice}
            />
          </Box>
        </Box>
      </Box>
    </Grid>
  )
}

export default LockWrapper
