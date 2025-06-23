import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import Switcher from './Switcher/Switcher'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BITZ_MAIN, NetworkType, sBITZ_MAIN } from '@store/consts/static'
import ExchangeAmountInput from '@components/Inputs/ExchangeAmountInput/ExchangeAmountInput'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import SwapSeparator from './SwapSeparator/SwapSeparator'
import { Separator } from '@common/Separator/Separator'
import { colors } from '@static/theme'
import TransactionDetails from './TransactionDetails/TransactionDetails'
import { convertBalanceToBN, getMockedTokenPrice, getTokenPrice, printBN } from '@utils/utils'
import ApyTooltip from './ApyTooltip/ApyTooltip'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { StakeSwitch, TokenPriceData } from '@store/consts/types'
import { StakeLiquidityPayload } from '@store/reducers/sBitz'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import { TOKEN_DECIMALS } from '@invariant-labs/sbitz/lib/consts'
import { calculateTokensForWithdraw, calculateTokensToMint } from '@invariant-labs/sbitz'
export interface ILiquidityStaking {
  walletStatus: Status
  tokens: Record<string, SwapToken>
  handleStake: (props: StakeLiquidityPayload) => void
  handleUnstake: (props: StakeLiquidityPayload) => void
  inProgress: boolean
  success: boolean
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  networkType: NetworkType
  sBitzApyApr: { apy: number | null; apr: number | null }
  sBitzApyAprLoading: boolean
  stakedTokenSupply: BN
  stakedAmount: BN
  stakeDataLoading: boolean
  changeStakeTab: (tab: StakeSwitch) => void
  currentStakeTab: StakeSwitch
}

export const LiquidityStaking: React.FC<ILiquidityStaking> = ({
  walletStatus,
  tokens,
  handleStake,
  handleUnstake,
  inProgress,
  success,
  onConnectWallet,
  onDisconnectWallet,
  networkType,
  sBitzApyApr,
  sBitzApyAprLoading,
  stakedTokenSupply,
  stakedAmount,
  stakeDataLoading,
  changeStakeTab,
  currentStakeTab
}) => {
  const { classes } = useStyles()

  const [amountFrom, setAmountFrom] = useState<string>('')
  const [amountTo, setAmountTo] = useState<string>('')

  const [isRotating, setIsRotating] = useState(false)

  const [progress, setProgress] = useState<ProgressState>('none')

  const tokenFrom: SwapToken = useMemo(
    () =>
      currentStakeTab === StakeSwitch.Stake
        ? tokens[BITZ_MAIN.address.toString()]
        : tokens[sBITZ_MAIN.address.toString()],
    [currentStakeTab, tokens]
  )
  const tokenTo: SwapToken = useMemo(
    () =>
      currentStakeTab === StakeSwitch.Unstake
        ? tokens[BITZ_MAIN.address.toString()]
        : tokens[sBITZ_MAIN.address.toString()],
    [currentStakeTab, tokens]
  )

  const [tokenFromPriceData, setTokenFromPriceData] = useState<TokenPriceData | undefined>(
    undefined
  )

  const [priceFromLoading, setPriceFromLoading] = useState(false)

  useEffect(() => {
    const addr = tokenFrom.assetAddress.toString()

    if (addr) {
      setPriceFromLoading(true)
      getTokenPrice(addr, networkType)
        .then(data => setTokenFromPriceData({ price: data ?? 0 }))
        .catch(() =>
          setTokenFromPriceData(
            getMockedTokenPrice(tokens[tokenFrom.toString()].symbol, networkType)
          )
        )
        .finally(() => setPriceFromLoading(false))
    } else {
      setTokenFromPriceData(undefined)
    }
  }, [tokenFrom])

  const [tokenToPriceData, setTokenToPriceData] = useState<TokenPriceData | undefined>(undefined)
  const [priceToLoading, setPriceToLoading] = useState(false)

  useEffect(() => {
    const addr = tokenTo.assetAddress.toString()
    if (addr) {
      setPriceToLoading(true)
      getTokenPrice(addr, networkType)
        .then(data => setTokenToPriceData({ price: data ?? 0 }))
        .catch(() =>
          setTokenToPriceData(getMockedTokenPrice(tokens[tokenTo.toString()].symbol, networkType))
        )
        .finally(() => setPriceToLoading(false))
    } else {
      setTokenToPriceData(undefined)
    }
  }, [tokenTo])

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout

    if (!inProgress && progress === 'progress') {
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
  }, [success, inProgress])

  const handleSwitchTokens = () => {
    setIsRotating(true)
    const nextTab = currentStakeTab === StakeSwitch.Stake ? StakeSwitch.Unstake : StakeSwitch.Stake
    changeStakeTab(nextTab)

    setTimeout(() => setIsRotating(false), 500)
  }

  useEffect(() => {
    const newAmountToBN = calculateOtherTokenAmount(amountFrom)
    const newAmountTo = printBN(newAmountToBN, TOKEN_DECIMALS)
    setAmountTo(newAmountTo)
  }, [currentStakeTab])

  const handleActionButtons = (
    action: 'max' | 'half',
    tokenAddress: PublicKey,
    isAmountFrom: boolean
  ) => {
    if (action === 'max') {
      const value = tokens[tokenAddress.toString()]?.balance || new BN(0)
      if (isAmountFrom) {
        setAmountFrom(printBN(value, tokens[tokenAddress.toString()]?.decimals || 6))
      } else {
        setAmountTo(printBN(value, tokens[tokenAddress.toString()]?.decimals || 6))
      }
    } else if (action === 'half') {
      const balance = tokens[tokenAddress.toString()]?.balance || new BN(0)
      const value = balance.div(new BN(2)) || new BN(0)
      if (isAmountFrom) {
        setAmountFrom(printBN(value, tokens[tokenAddress.toString()]?.decimals || 6))
      } else {
        setAmountTo(printBN(value, tokens[tokenAddress.toString()]?.decimals || 6))
      }
    }
  }

  const getStateMessage = () => {
    if (currentStakeTab === StakeSwitch.Stake) {
      return `Stake`
    } else {
      return `Unstake`
    }
  }

  const calculateOtherTokenAmount = useCallback(
    (value: string, isStake?: boolean) => {
      if (stakeDataLoading || !stakedAmount || !stakedTokenSupply) return new BN(0)
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
  return (
    <Grid container className={classes.wrapper}>
      <Switcher
        switchTab={currentStakeTab}
        setSwitchTab={changeStakeTab}
        isRotating={isRotating}
        setIsRotating={setIsRotating}
      />
      <Box mt='32px' mb={'16px'} display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.title}>Stake</Typography>
      </Box>
      <ExchangeAmountInput
        value={amountFrom}
        balance={printBN(tokenFrom?.balance || new BN(0), tokenFrom?.decimals)}
        decimal={tokenFrom?.decimals}
        className={classes.amountInput}
        setValue={value => {
          if (value.match(/^\d*\.?\d*$/)) {
            setAmountFrom(value)
            setAmountTo(printBN(calculateOtherTokenAmount(value), TOKEN_DECIMALS))
          }
        }}
        placeholder={`0.${'0'.repeat(TOKEN_DECIMALS)}`}
        actionButtons={[
          {
            label: 'Max',
            variant: 'max',
            onClick: () => {
              handleActionButtons('max', tokenFrom.assetAddress, true)
            }
          },
          {
            label: '50%',
            variant: 'half',
            onClick: () => {
              handleActionButtons('half', tokenFrom.assetAddress, true)
            }
          }
        ]}
        tokens={[]}
        current={tokenFrom}
        hideBalances={walletStatus !== Status.Initialized}
        commonTokens={[]}
        limit={1e14}
        tokenPrice={tokenFromPriceData?.price}
        priceLoading={priceFromLoading}
        isBalanceLoading={false}
        showMaxButton={true}
        showBlur={stakeDataLoading}
        hideSelect
        notRoundIcon
      />
      <SwapSeparator
        onClick={handleSwitchTokens}
        rotateRight={currentStakeTab === StakeSwitch.Stake}
        isRotating={isRotating}
      />
      <Box mb={'16px'} display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.title}>You receive</Typography>
        <ApyTooltip
          tokenFrom={tokenFrom}
          tokenTo={tokenTo}
          sBitzApyApr={sBitzApyApr}
          sBitzApyAprLoading={sBitzApyAprLoading}
        />
      </Box>
      <ExchangeAmountInput
        value={amountTo}
        balance={printBN(tokenTo?.balance || new BN(0), tokenTo?.decimals)}
        decimal={tokenTo?.decimals}
        className={classes.amountOutInput}
        setValue={() => {}}
        placeholder={`0.${'0'.repeat(TOKEN_DECIMALS)}`}
        actionButtons={[]}
        tokens={[]}
        current={tokenTo}
        hideBalances={walletStatus !== Status.Initialized}
        commonTokens={[]}
        limit={1e14}
        tokenPrice={tokenToPriceData?.price}
        priceLoading={priceToLoading}
        isBalanceLoading={false}
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
            amountFrom !== '0' && amountFrom !== '' && progress === 'none'
              ? `${classes.swapButton} ${classes.ButtonSwapActive}`
              : classes.swapButton
          }
          disabled={progress !== 'none' || amountFrom === '0' || amountFrom === ''}
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
