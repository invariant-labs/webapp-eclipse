import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import Switcher from './Switcher/Switcher'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { inputTarget, INVT_MAIN } from '@store/consts/static'
import ExchangeAmountInput from '@components/Inputs/ExchangeAmountInput/ExchangeAmountInput'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import SwapSeparator from './SwapSeparator/SwapSeparator'
import { convertBalanceToBN, printBN, trimDecimalZeros } from '@utils/utils'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { BannerPhase, LockerSwitch } from '@store/consts/types'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import { LockLiquidityPayload } from '@store/reducers/xInvt'
import { colors, typography } from '@static/theme'
import { LockIcon } from '@static/componentIcon/LockIcon'
import TransactionDetails from './TransactionDetails/TransactionDetails'
import { Separator } from '@common/Separator/Separator'
import { BannerState } from '@containers/LockWrapper/LockWrapper'

export interface ILocker {
  walletStatus: Status
  tokens: Record<string, SwapToken>
  handleLock: (props: LockLiquidityPayload) => void
  handleUnlock: (props: LockLiquidityPayload) => void
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  changeLockerTab: (tab: LockerSwitch) => void
  currentLockerTab: LockerSwitch
  ethBalance: BN
  isBalanceLoading: boolean
  lockInput: string
  unlockInput: string
  setLockInput: (val: string) => void
  setUnlockInput: (val: string) => void
  progress: ProgressState
  setProgress: (val: ProgressState) => void
  tokenFrom: SwapToken
  tokenTo: SwapToken
  priceLoading: boolean
  invtPrice: number
  unlockDisabled: boolean
  startTimestamp: BN
  bannerState: BannerState
}

export const XInvtLocker: React.FC<ILocker> = ({
  walletStatus,
  tokens,
  handleLock,
  handleUnlock,
  onConnectWallet,
  onDisconnectWallet,
  currentLockerTab,
  changeLockerTab,
  // ethBalance,
  isBalanceLoading,
  lockInput,
  unlockInput,
  setLockInput,
  setUnlockInput,
  progress,
  setProgress,
  tokenFrom,
  tokenTo,
  priceLoading,
  invtPrice,
  unlockDisabled,
  bannerState
  // startTimestamp
}) => {
  const { classes } = useStyles()

  // const targetDate = useMemo(() => new Date(startTimestamp.toNumber() * 1000), [startTimestamp])
  // const { hours, minutes, seconds } = useCountdown({
  //   targetDate
  // })

  const amountFrom = useMemo(() => {
    if (currentLockerTab === LockerSwitch.Lock) return lockInput
    return unlockInput
  }, [currentLockerTab, lockInput, unlockInput])

  const setAmountFrom = useCallback(
    (val: string) => {
      if (currentLockerTab === LockerSwitch.Lock) {
        setLockInput(val)
      } else {
        setUnlockInput(val)
      }
    },
    [currentLockerTab, setLockInput, setUnlockInput]
  )

  const [amountTo, setAmountTo] = useState<string>('')
  const [inputRef, setInputRef] = useState<string>(inputTarget.FROM)

  const [isRotating, setIsRotating] = useState(false)

  const handleSwitchTokens = () => {
    setIsRotating(true)
    const nextTab = currentLockerTab === LockerSwitch.Lock ? LockerSwitch.Unlock : LockerSwitch.Lock
    changeLockerTab(nextTab)

    setTimeout(() => setIsRotating(false), 500)
  }

  const handleActionButtons = (
    action: 'max' | 'half',
    tokenAddress: PublicKey,
    ref: inputTarget
  ) => {
    const balance = tokens[tokenAddress.toString()]?.balance || new BN(0)
    if (action === 'max') {
      const valueString = trimDecimalZeros(printBN(balance, INVT_MAIN.decimals))
      if (ref === inputTarget.FROM) {
        setAmountFrom(valueString)
      } else {
        setAmountTo(valueString)
      }
    } else if (action === 'half') {
      const value = balance.div(new BN(2)) || new BN(0)
      const valueString = trimDecimalZeros(printBN(value, INVT_MAIN.decimals))
      if (ref === inputTarget.FROM) {
        setAmountFrom(valueString)
      } else {
        setAmountTo(valueString)
      }
    }
  }

  const getStateMessage = () => {
    if (isBalanceLoading) {
      return 'Loading...'
    }
    // if (ethBalance.lt(WETH_MIN_STAKE_UNSTAKE_LAMPORTS)) {
    //   return `Insufficient ETH`
    // }

    if (progress !== 'none' || amountFrom === '' || Number(amountFrom) === 0)
      return 'Enter token amount'

    if (
      tokenFrom &&
      tokenFrom.balance &&
      amountFrom.length > 0 &&
      tokenFrom.balance.lt(new BN(convertBalanceToBN(amountFrom, INVT_MAIN.decimals)))
    )
      return `Not enough ${tokenFrom.symbol}`

    if (currentLockerTab === LockerSwitch.Lock) {
      if (bannerState.key == BannerPhase.burnEnds) {
        return 'Burn'
      }
      return `Lock`
    } else {
      return `Unlock`
    }
  }

  const calculateOtherTokenAmount = useCallback(
    (value: string, isLock?: boolean, _byAmountIn?: boolean) => {
      const isLockAction = isLock ?? tokenFrom.assetAddress.equals(INVT_MAIN.address)
      const amount = convertBalanceToBN(value, INVT_MAIN.decimals)
      if (amount)
        if (isLockAction) {
          return amount
        } else {
          return amount
        }
    },
    [tokenFrom, tokenTo, inputRef]
  )

  useLayoutEffect(() => {
    if (inputRef === inputTarget.FROM) {
      if (!amountFrom || Number(amountFrom) === 0) {
        setAmountTo('')
      } else {
        setAmountTo(printBN(calculateOtherTokenAmount(amountFrom), INVT_MAIN.decimals))
      }
      return
    }
    if (inputRef === inputTarget.TO) {
      if (!amountTo || Number(amountTo) === 0) {
        setAmountFrom('')
      } else {
        setAmountFrom(printBN(calculateOtherTokenAmount(amountTo), INVT_MAIN.decimals))
      }
      return
    }
  }, [amountFrom, amountTo, calculateOtherTokenAmount])

  return (
    <Grid container className={classes.wrapper}>
      <Switcher
        switchTab={currentLockerTab}
        setSwitchTab={changeLockerTab}
        setInputRef={setInputRef}
        isRotating={isRotating}
        setIsRotating={setIsRotating}
        disabled={unlockDisabled}
      />

      <Box mt='24px' mb={'12px'} display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.title}>
          {currentLockerTab === LockerSwitch.Lock ? 'Lock' : 'Unlock'}
        </Typography>
      </Box>
      <ExchangeAmountInput
        value={amountFrom}
        balance={printBN(tokenFrom?.balance || new BN(0), tokenFrom?.decimals)}
        decimal={tokenFrom?.decimals}
        setValue={value => {
          if (value.match(/^\d*\.?\d*$/)) {
            setAmountFrom(value)
            setInputRef(inputTarget.FROM)
          }
        }}
        placeholder={`0`}
        actionButtons={[
          {
            label: 'Max',
            variant: 'max',
            onClick: () => {
              setInputRef(inputTarget.FROM)
              handleActionButtons('max', tokenFrom.assetAddress, inputTarget.FROM)
            }
          },
          {
            label: '50%',
            variant: 'half',
            onClick: () => {
              setInputRef(inputTarget.FROM)
              handleActionButtons('half', tokenFrom.assetAddress, inputTarget.FROM)
            }
          }
        ]}
        tokens={[]}
        current={tokenFrom}
        hideBalances={walletStatus !== Status.Initialized}
        commonTokens={[]}
        tokenPrice={invtPrice}
        priceLoading={priceLoading}
        isBalanceLoading={isBalanceLoading}
        showMaxButton={true}
        showBlur={false}
        hideSelect
        notRoundIcon
        limit={1e14}
      />
      <SwapSeparator
        onClick={unlockDisabled ? () => {} : handleSwitchTokens}
        rotateRight={currentLockerTab === LockerSwitch.Lock}
        isRotating={isRotating}
        disabled={unlockDisabled}
      />
      <Box mb={'12px'} display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.title}>Recive</Typography>
        <Box className={classes.lockPeriod}>
          <LockIcon color={colors.invariant.textGrey} width={14} height={14} />
          <Typography style={{ ...typography.caption4 }} color={colors.invariant.textGrey}>
            Lock period:{' '}
          </Typography>
          <Typography style={{ ...typography.caption3 }} color={colors.invariant.green}>
            3 months
          </Typography>
        </Box>
      </Box>
      <ExchangeAmountInput
        value={amountTo}
        balance={printBN(tokenTo?.balance || new BN(0), tokenTo?.decimals)}
        decimal={tokenTo?.decimals}
        setValue={value => {
          if (unlockDisabled) return
          if (value.match(/^\d*\.?\d*$/)) {
            setAmountTo(value)
            setInputRef(inputTarget.TO)
          }
        }}
        placeholder={`0`}
        actionButtons={[]}
        tokens={[]}
        current={tokenTo}
        hideBalances={walletStatus !== Status.Initialized}
        commonTokens={[]}
        tokenPrice={invtPrice}
        priceLoading={priceLoading}
        isBalanceLoading={isBalanceLoading}
        showMaxButton={true}
        showBlur={false}
        hideSelect
        notRoundIcon
        limit={1e14}
        disabled={unlockDisabled}
      />

      {/* <Box display='flex' marginTop={2} gap={0} flexDirection='column'>
        <Box className={classes.timerWrapper}>
          <Typography sx={{ color: colors.invariant.text, ...typography.body1 }}>
            Lock ends in:
          </Typography>
          <Timer hours={hours} minutes={minutes} seconds={seconds} isSmall width={130} />
        </Box>
      </Box> */}
      <Separator isHorizontal width={1} color={colors.invariant.light} margin='16px 0' />
      <TransactionDetails
        tokenToAmount={printBN(calculateOtherTokenAmount('1', true, true), INVT_MAIN.decimals)}
        tokenFromTicker={tokenFrom.symbol}
        tokenToTicker={tokenTo.symbol}
        stakedDataLoading={false}
        currentYield={'145%'}
        yieldChange='143.3%'
        income='212'
      />
      {walletStatus !== Status.Initialized ? (
        <ChangeWalletButton
          margin={'24px 0 0 0'}
          width={'100%'}
          height={48}
          name='Connect wallet'
          onConnect={onConnectWallet}
          connected={false}
          onDisconnect={onDisconnectWallet}
        />
      ) : (
        <AnimatedButton
          content={getStateMessage()}
          className={
            getStateMessage() !== 'Lock' && getStateMessage() !== 'Unlock'
              ? classes.swapButton
              : `${classes.swapButton} ${classes.ButtonSwapActive}`
          }
          disabled={getStateMessage() !== 'Lock' && getStateMessage() !== 'Unlock'}
          onClick={() => {
            setProgress('progress')
            const amount = inputRef === inputTarget.FROM ? amountFrom : amountTo
            if (currentLockerTab === LockerSwitch.Lock) {
              handleLock({
                amount: convertBalanceToBN(amount, tokenFrom.decimals)
              })
            } else {
              handleUnlock({
                amount: convertBalanceToBN(amount, tokenFrom.decimals)
              })
            }
          }}
          progress={progress}
        />
      )}
    </Grid>
  )
}

export default XInvtLocker
