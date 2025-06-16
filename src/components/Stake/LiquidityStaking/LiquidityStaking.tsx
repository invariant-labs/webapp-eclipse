import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import Switcher from './Switcher/Switcher'
import { useMemo, useState } from 'react'
import { BITZ_MAIN } from '@store/consts/static'
import sBITZIcon from '@static/png/sBITZ.png'
import ExchangeAmountInput from '@components/Inputs/ExchangeAmountInput/ExchangeAmountInput'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import SwapSeparator from './SwapSeparator/SwapSeparator'
import { Separator } from '@common/Separator/Separator'
import { colors } from '@static/theme'
import TransactionDetails from './TransactionDetails/TransactionDetails'
import { printBN } from '@utils/utils'
import ApyTooltip from './ApyTooltip/ApyTooltip'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import AnimatedButton from '@common/AnimatedButton/AnimatedButton'
import { StakeSwitch } from '@store/consts/types'

export interface ILiquidityStaking {
  walletStatus: Status
  tokens: Record<string, SwapToken>
}

export const LiquidityStaking: React.FC<ILiquidityStaking> = ({ walletStatus, tokens }) => {
  const { classes } = useStyles()

  const [switchTab, setSwitchTab] = useState<StakeSwitch>(StakeSwitch.Stake)

  const [amountFrom, setAmountFrom] = useState<string>('')
  const [amountTo, setAmountTo] = useState<string>('')

  const [isRotating, setIsRotating] = useState(false)

  const sBitzMocked: SwapToken = {
    ...tokens['AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE'],
    logoURI: sBITZIcon,
    symbol: 'sBITZ(USDC)'
  }

  const tokenFrom: SwapToken = useMemo(
    () => (switchTab === StakeSwitch.Stake ? tokens[BITZ_MAIN.address.toString()] : sBitzMocked),
    [switchTab, tokens]
  )
  const tokenTo: SwapToken = useMemo(
    () => (switchTab === StakeSwitch.Unstake ? tokens[BITZ_MAIN.address.toString()] : sBitzMocked),
    [switchTab, tokens]
  )

  const handleSwitchTokens = () => {
    setIsRotating(true)

    if (switchTab === StakeSwitch.Stake) {
      setAmountFrom(amountTo)
      setAmountTo(amountFrom)
      setSwitchTab(StakeSwitch.Unstake)
    } else {
      setAmountFrom(amountTo)
      setAmountTo(amountFrom)
      setSwitchTab(StakeSwitch.Stake)
    }
    setTimeout(() => setIsRotating(false), 500)
  }

  const handleActionButtons = (action: 'max' | 'half', tokenAddress: PublicKey, isAmountFrom) => {
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
    if (switchTab === StakeSwitch.Stake) {
      return `Stake ${amountFrom} ${tokenFrom.symbol}`
    } else {
      return `Unstake ${amountFrom} ${tokenFrom.symbol}`
    }
  }

  const progress = 'none'
  return (
    <Grid container className={classes.wrapper}>
      <Switcher switchTab={switchTab} setSwitchTab={setSwitchTab} setIsRotating={setIsRotating} />
      <Box mt='32px' mb={'16px'} display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.title}>Stake</Typography>
      </Box>
      <ExchangeAmountInput
        value={amountFrom}
        balance={printBN(tokenFrom.balance, tokenFrom.decimals)}
        decimal={tokenFrom.decimals}
        className={classes.amountInput}
        setValue={value => {
          if (value.match(/^\d*\.?\d*$/)) {
            setAmountFrom(value)
          }
        }}
        placeholder={`0.${'0'.repeat(6)}`}
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
        tokenPrice={12}
        priceLoading={false}
        isBalanceLoading={false}
        showMaxButton={true}
        showBlur={
          false
          // (inputRef === inputTarget.TO && addBlur) ||
          // lockAnimation ||
          // (getStateMessage() === 'Loading' &&
          //   (inputRef === inputTarget.TO || inputRef === inputTarget.DEFAULT))
        }
        hideSelect
      />
      <SwapSeparator
        onClick={handleSwitchTokens}
        rotateRight={switchTab === StakeSwitch.Stake}
        isRotating={isRotating}
      />
      <Box mb={'16px'} display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.title}>You receive</Typography>
        <ApyTooltip tokenFrom={tokenFrom} tokenTo={tokenTo} apyStaked={803} apyCompound={2213} />
      </Box>
      <ExchangeAmountInput
        value={amountTo}
        balance={printBN(tokenTo.balance, tokenTo.decimals)}
        decimal={tokenTo.decimals}
        className={classes.amountInput}
        setValue={value => {
          if (value.match(/^\d*\.?\d*$/)) {
            setAmountTo(value)
          }
        }}
        placeholder={`0.${'0'.repeat(6)}`}
        actionButtons={[
          {
            label: 'Max',
            variant: 'max',
            onClick: () => {
              handleActionButtons('max', tokenTo.assetAddress, false)
            }
          },
          {
            label: '50%',
            variant: 'half',
            onClick: () => {
              handleActionButtons('half', tokenTo.assetAddress, false)
            }
          }
        ]}
        tokens={[]}
        current={tokenTo}
        hideBalances={walletStatus !== Status.Initialized}
        commonTokens={[]}
        limit={1e14}
        tokenPrice={12}
        priceLoading={false}
        isBalanceLoading={false}
        showMaxButton={true}
        showBlur={
          false
          // (inputRef === inputTarget.TO && addBlur) ||
          // lockAnimation ||
          // (getStateMessage() === 'Loading' &&
          //   (inputRef === inputTarget.TO || inputRef === inputTarget.DEFAULT))
        }
        hideSelect
      />
      <Separator isHorizontal width={1} color={colors.invariant.light} margin='16px 0' />
      <TransactionDetails />
      <AnimatedButton
        content={getStateMessage()}
        className={
          getStateMessage() === 'Connect a wallet'
            ? `${classes.swapButton}`
            : amountFrom !== '0' && amountFrom !== '' && progress === 'none'
              ? `${classes.swapButton} ${classes.ButtonSwapActive}`
              : classes.swapButton
        }
        disabled={getStateMessage() !== 'Exchange' || progress !== 'none'}
        onClick={() => {}}
        progress={progress}
      />
    </Grid>
  )
}

export default LiquidityStaking
