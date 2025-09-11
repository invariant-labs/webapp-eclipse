import React, { useEffect, useMemo, useState } from 'react'
import useStyles from './styles'
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
import { getTokenPrice } from '@utils/utils'
import { LockerSwitch } from '@store/consts/types'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { refreshIcon } from '@static/icons'
import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
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
  const currentLockerTab = useSelector(lockerTab)

  const [invtPrice, setInvtPrice] = useState(0)
  const [progress, setProgress] = useState<ProgressState>('none')
  const [priceLoading, setPriceLoading] = useState(false)

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
    fetchPrices()
  }, [dispatch])

  const onRefresh = () => {
    dispatch(walletActions.getBalance())
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
                    disabled={isBalanceLoading}>
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
            />
          </Box>
        </Box>
      </Box>
    </Grid>
  )
}

export default LockWrapper
