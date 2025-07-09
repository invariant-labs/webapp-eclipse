import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import Switcher from './Switcher/Switcher'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { BITZ_MAIN, WETH_MIN_STAKE_UNSTAKE_LAMPORTS } from '@store/consts/static'
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
import { calculateTokensForWithdraw, calculateTokensToMint } from '@invariant-labs/sbitz'
export interface ILiquidityStaking {
  walletStatus: Status
  tokens: Record<string, SwapToken>
  handleStake: (props: StakeLiquidityPayload) => void
  handleUnstake: (props: StakeLiquidityPayload) => void
  onConnectWallet: () => void
  onDisconnectWallet: () => void
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
  sBitzBitzMonthlyAnnual: {
    sbitzMonthly: number
    sbitzAnnual: number
    bitzMonthly: number
    bitzAnnual: number
  }
}

export const LiquidityStaking: React.FC<ILiquidityStaking> = ({
  walletStatus,
  tokens,
  handleStake,
  handleUnstake,
  onConnectWallet,
  onDisconnectWallet,
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
  bitzPrice,
  sBitzBitzMonthlyAnnual
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

  const [isRotating, setIsRotating] = useState(false)

  const handleSwitchTokens = () => {
    setIsRotating(true)
    const nextTab = currentStakeTab === StakeSwitch.Stake ? StakeSwitch.Unstake : StakeSwitch.Stake
    changeStakeTab(nextTab)

    setTimeout(() => setIsRotating(false), 500)
  }

  const handleActionButtons = (action: 'max' | 'half', tokenAddress: PublicKey) => {
    if (action === 'max') {
      const value = tokens[tokenAddress.toString()]?.balance || new BN(0)
      const valueString = trimDecimalZeros(printBN(value, TOKEN_DECIMALS))
      setAmountFrom(valueString)
    } else if (action === 'half') {
      const balance = tokens[tokenAddress.toString()]?.balance || new BN(0)
      const value = balance.div(new BN(2)) || new BN(0)
      const valueString = trimDecimalZeros(printBN(value, TOKEN_DECIMALS))
      setAmountFrom(valueString)
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
        return calculateTokensToMint(stakedTokenSupply, stakedAmount, amount)
      } else {
        return calculateTokensForWithdraw(stakedTokenSupply, stakedAmount, amount)
      }
    },
    [stakeDataLoading, stakedAmount, stakedTokenSupply, tokenFrom, tokenTo]
  )

  useLayoutEffect(() => {
    if (!amountFrom || Number(amountFrom) === 0) {
      setAmountTo('0')
    } else {
      setAmountTo(printBN(calculateOtherTokenAmount(amountFrom), TOKEN_DECIMALS))
    }
  }, [amountFrom, currentStakeTab, calculateOtherTokenAmount])

  return (
    <Grid container className={classes.wrapper}>
      <Switcher
        switchTab={currentStakeTab}
        setSwitchTab={changeStakeTab}
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
        className={classes.amountInput}
        setValue={value => {
          if (value.match(/^\d*\.?\d*$/)) {
            setAmountFrom(value)
          }
        }}
        placeholder={`0`}
        actionButtons={[
          {
            label: 'Max',
            variant: 'max',
            onClick: () => {
              handleActionButtons('max', tokenFrom.assetAddress)
            }
          },
          {
            label: '50%',
            variant: 'half',
            onClick: () => {
              handleActionButtons('half', tokenFrom.assetAddress)
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
      <Box className={classes.apyWrapper}>
        <Typography className={classes.title}>You receive</Typography>
        {currentStakeTab === StakeSwitch.Stake ? (
          <ApyTooltip
            sBitzBitzMonthlyAnnual={sBitzBitzMonthlyAnnual}
            stakeDataLoading={stakeDataLoading}
          />
        ) : (
          <Grid className={classes.placeholder} />
        )}
      </Box>

      <ExchangeAmountInput
        value={amountTo}
        balance={printBN(tokenTo?.balance || new BN(0), tokenTo?.decimals)}
        decimal={tokenTo?.decimals}
        className={classes.amountOutInput}
        setValue={() => {}}
        placeholder={`0`}
        actionButtons={[]}
        tokens={[]}
        current={tokenTo}
        hideBalances={walletStatus !== Status.Initialized}
        commonTokens={[]}
        tokenPrice={tokenTo.assetAddress.equals(BITZ_MAIN.address) ? bitzPrice : sBitzPrice}
        priceLoading={priceLoading || stakeDataLoading}
        isBalanceLoading={isBalanceLoading}
        showMaxButton={false}
        disabled
        showBlur={stakeDataLoading}
        hideSelect
        notRoundIcon
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

            if (currentStakeTab === StakeSwitch.Stake) {
              handleStake({
                amount: convertBalanceToBN(amountFrom, tokenFrom.decimals)
              })
            } else {
              handleUnstake({
                amount: convertBalanceToBN(amountFrom, tokenFrom.decimals)
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
