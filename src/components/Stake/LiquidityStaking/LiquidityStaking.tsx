import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import Switcher from './Switcher/Switcher'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { BITZ_MAIN, inputTarget, WETH_MIN_STAKE_UNSTAKE_LAMPORTS } from '@store/consts/static'
import ExchangeAmountInput from '@components/Inputs/ExchangeAmountInput/ExchangeAmountInput'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import SwapSeparator from './SwapSeparator/SwapSeparator'
import { Separator } from '@common/Separator/Separator'
import { colors } from '@static/theme'
import TransactionDetails from './TransactionDetails/TransactionDetails'
import { convertBalanceToBN, printBN, trimDecimalZeros } from '@utils/utils'
import ApyTooltip from './ApyTooltip/ApyTooltip'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { StakeSwitch } from '@store/consts/types'
import { StakeLiquidityPayload } from '@store/reducers/sBitz'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import { TOKEN_DECIMALS } from '@invariant-labs/sbitz/lib/consts'
import { calculateTokensStake, calculateTokensUnstake } from '@invariant-labs/sbitz'
export interface ILiquidityStaking {
  walletStatus: Status
  tokens: Record<string, SwapToken>
  handleStake: (props: StakeLiquidityPayload) => void
  handleUnstake: (props: StakeLiquidityPayload) => void
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  sBitzApyApr: { apy: number; apr: number }
  stakedTokenSupply: BN
  stakedAmount: BN
  stakeDataLoading: boolean
  changeStakeTab: (tab: StakeSwitch) => void
  currentStakeTab: StakeSwitch
  ethBalance: BN
  isBalanceLoading: boolean
  stakeInput: string
  unstakeInput: string
  setStakeInput: (val: string) => void
  setUnstakeInput: (val: string) => void
  progress: ProgressState
  setProgress: (val: ProgressState) => void
  tokenFrom: SwapToken
  tokenTo: SwapToken
  priceLoading: boolean
  sBitzPrice: number
  bitzPrice: number
}

export const LiquidityStaking: React.FC<ILiquidityStaking> = ({
  walletStatus,
  tokens,
  handleStake,
  handleUnstake,
  onConnectWallet,
  onDisconnectWallet,
  sBitzApyApr,
  stakedTokenSupply,
  stakedAmount,
  stakeDataLoading,
  changeStakeTab,
  currentStakeTab,
  ethBalance,
  isBalanceLoading,
  stakeInput,
  unstakeInput,
  setStakeInput,
  setUnstakeInput,
  progress,
  setProgress,
  tokenFrom,
  tokenTo,
  priceLoading,
  sBitzPrice,
  bitzPrice
}) => {
  const { classes } = useStyles()

  const amountFrom = useMemo(() => {
    if (currentStakeTab === StakeSwitch.Stake) return stakeInput
    return unstakeInput
  }, [currentStakeTab, stakeInput, unstakeInput])

  const setAmountFrom = useCallback(
    (val: string) => {
      if (currentStakeTab === StakeSwitch.Stake) {
        setStakeInput(val)
      } else {
        setUnstakeInput(val)
      }
    },
    [currentStakeTab, setStakeInput, setUnstakeInput]
  )

  const [amountTo, setAmountTo] = useState<string>('')
  const [inputRef, setInputRef] = useState<string>(inputTarget.FROM)

  const [isRotating, setIsRotating] = useState(false)

  const handleSwitchTokens = () => {
    setIsRotating(true)
    const nextTab = currentStakeTab === StakeSwitch.Stake ? StakeSwitch.Unstake : StakeSwitch.Stake
    changeStakeTab(nextTab)

    setTimeout(() => setIsRotating(false), 500)
  }

  const handleActionButtons = (
    action: 'max' | 'half',
    tokenAddress: PublicKey,
    ref: inputTarget
  ) => {
    const balance = tokens[tokenAddress.toString()]?.balance || new BN(0)
    if (action === 'max') {
      const valueString = trimDecimalZeros(printBN(balance, TOKEN_DECIMALS))
      if (ref === inputTarget.FROM) {
        setAmountFrom(valueString)
      } else {
        setAmountTo(valueString)
      }
    } else if (action === 'half') {
      const value = balance.div(new BN(2)) || new BN(0)
      const valueString = trimDecimalZeros(printBN(value, TOKEN_DECIMALS))
      if (ref === inputTarget.FROM) {
        setAmountFrom(valueString)
      } else {
        setAmountTo(valueString)
      }
    }
  }

  const getStateMessage = () => {
    if (isBalanceLoading || stakeDataLoading) {
      return 'Loading...'
    }
    if (ethBalance.lt(WETH_MIN_STAKE_UNSTAKE_LAMPORTS)) {
      return `Insufficient ETH`
    }

    if (progress !== 'none' || amountFrom === '' || Number(amountFrom) === 0)
      return 'Enter token amount'

    if (
      tokenFrom &&
      tokenFrom.balance &&
      amountFrom.length > 0 &&
      tokenFrom.balance.lt(new BN(convertBalanceToBN(amountFrom, TOKEN_DECIMALS)))
    )
      return `Not enough ${tokenFrom.symbol}`

    if (currentStakeTab === StakeSwitch.Stake) {
      return `Stake`
    } else {
      return `Unstake`
    }
  }

  const calculateOtherTokenAmount = useCallback(
    (value: string, isStake?: boolean) => {
      if (!stakedAmount || !stakedTokenSupply) return new BN(0)
      const isStakeAction = isStake ?? tokenFrom.assetAddress.equals(BITZ_MAIN.address)
      const amount = convertBalanceToBN(value, TOKEN_DECIMALS)
      if (isStakeAction) {
        return calculateTokensStake(
          stakedTokenSupply,
          stakedAmount,
          amount,
          inputRef === inputTarget.FROM
        )
      } else {
        return calculateTokensUnstake(
          stakedTokenSupply,
          stakedAmount,
          amount,
          inputRef === inputTarget.FROM
        )
      }
    },
    [stakeDataLoading, stakedAmount, stakedTokenSupply, tokenFrom, tokenTo, inputRef]
  )

  useLayoutEffect(() => {
    if (inputRef === inputTarget.FROM) {
      if (!amountFrom || Number(amountFrom) === 0) {
        setAmountTo('')
      } else {
        setAmountTo(printBN(calculateOtherTokenAmount(amountFrom), TOKEN_DECIMALS))
      }
      return
    }
    if (inputRef === inputTarget.TO) {
      if (!amountTo || Number(amountTo) === 0) {
        setAmountFrom('')
      } else {
        setAmountFrom(printBN(calculateOtherTokenAmount(amountTo), TOKEN_DECIMALS))
      }
      return
    }
  }, [amountFrom, amountTo, calculateOtherTokenAmount])

  return (
    <Grid container className={classes.wrapper}>
      <Switcher
        switchTab={currentStakeTab}
        setSwitchTab={changeStakeTab}
        setInputRef={setInputRef}
        isRotating={isRotating}
        setIsRotating={setIsRotating}
      />
      <Box mt='32px' mb={'16px'} display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.title}>
          {currentStakeTab === StakeSwitch.Stake ? 'Stake' : 'Unstake'}
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
        tokenPrice={tokenFrom.assetAddress.equals(BITZ_MAIN.address) ? bitzPrice : sBitzPrice}
        priceLoading={priceLoading}
        isBalanceLoading={isBalanceLoading}
        showMaxButton={true}
        showBlur={false}
        hideSelect
        notRoundIcon
        limit={1e14}
      />
      <SwapSeparator
        onClick={handleSwitchTokens}
        rotateRight={currentStakeTab === StakeSwitch.Stake}
        isRotating={isRotating}
      />
      <Box mb={'16px'} display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.title}>You receive</Typography>
        {currentStakeTab === StakeSwitch.Stake && (
          <ApyTooltip sBitzApyApr={sBitzApyApr} stakeDataLoading={stakeDataLoading} />
        )}
      </Box>
      <ExchangeAmountInput
        value={amountTo}
        balance={printBN(tokenTo?.balance || new BN(0), tokenTo?.decimals)}
        decimal={tokenTo?.decimals}
        setValue={value => {
          if (value.match(/^\d*\.?\d*$/)) {
            setAmountTo(value)
            setInputRef(inputTarget.TO)
          }
        }}
        placeholder={`0`}
        actionButtons={[
          {
            label: 'Max',
            variant: 'max',
            onClick: () => {
              setInputRef(inputTarget.TO)
              handleActionButtons('max', tokenTo.assetAddress, inputTarget.TO)
            }
          },
          {
            label: '50%',
            variant: 'half',
            onClick: () => {
              setInputRef(inputTarget.FROM)
              handleActionButtons('half', tokenTo.assetAddress, inputTarget.TO)
            }
          }
        ]}
        tokens={[]}
        current={tokenTo}
        hideBalances={walletStatus !== Status.Initialized}
        commonTokens={[]}
        tokenPrice={tokenTo.assetAddress.equals(BITZ_MAIN.address) ? bitzPrice : sBitzPrice}
        priceLoading={priceLoading}
        isBalanceLoading={isBalanceLoading}
        showMaxButton={true}
        showBlur={false}
        hideSelect
        notRoundIcon
        limit={1e14}
      />
      <Separator isHorizontal width={1} color={colors.invariant.light} margin='16px 0' />
      <TransactionDetails
        tokenFromTicker={tokenFrom.symbol}
        tokenToTicker={tokenTo.symbol}
        tokenToAmount={printBN(calculateOtherTokenAmount('1'), TOKEN_DECIMALS)}
        stakedDataLoading={stakeDataLoading}
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
            getStateMessage() !== 'Stake' && getStateMessage() !== 'Unstake'
              ? classes.swapButton
              : `${classes.swapButton} ${classes.ButtonSwapActive}`
          }
          disabled={getStateMessage() !== 'Stake' && getStateMessage() !== 'Unstake'}
          onClick={() => {
            setProgress('progress')
            const amount = inputRef === inputTarget.FROM ? amountFrom : amountTo
            if (currentStakeTab === StakeSwitch.Stake) {
              handleStake({
                byAmountIn: inputRef === inputTarget.FROM,
                amount: convertBalanceToBN(amount, tokenFrom.decimals)
              })
            } else {
              handleUnstake({
                byAmountIn: inputRef === inputTarget.FROM,
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

export default LiquidityStaking
