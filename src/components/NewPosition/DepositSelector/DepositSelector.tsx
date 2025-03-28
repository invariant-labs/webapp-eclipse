import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import DepositAmountInput from '@components/Inputs/DepositAmountInput/DepositAmountInput'
import Select from '@components/Inputs/Select/Select'
import { Box, Grid, Typography } from '@mui/material'
import {
  ALL_FEE_TIERS_DATA,
  NetworkType,
  WETH_POOL_INIT_LAMPORTS_MAIN,
  WETH_POOL_INIT_LAMPORTS_TEST,
  WETH_POSITION_INIT_LAMPORTS_MAIN,
  WETH_POSITION_INIT_LAMPORTS_TEST,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import classNames from 'classnames'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import FeeSwitch from '../FeeSwitch/FeeSwitch'
import { useStyles } from './style'
import { PositionOpeningMethod } from '@store/consts/types'
import { SwapToken } from '@store/selectors/solanaWallet'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { Status } from '@store/reducers/solanaWallet'
import {
  convertBalanceToBN,
  getScaleFromString,
  printBN,
  tickerToAddress,
  parsePathFeeToFeeString,
  trimDecimalZeros
} from '@utils/utils'
import { createButtonActions } from '@utils/uiUtils'
import icons from '@static/icons'

export interface InputState {
  value: string
  setValue: (value: string) => void
  blocked: boolean
  blockerInfo?: string
  decimalsLimit: number
}

export interface IDepositSelector {
  initialTokenFrom: string
  initialTokenTo: string
  initialFee: string
  tokens: SwapToken[]
  setPositionTokens: (
    tokenAIndex: number | null,
    tokenBindex: number | null,
    feeTierIndex: number
  ) => void
  onAddLiquidity: () => void
  tokenAInputState: InputState
  tokenBInputState: InputState
  feeTiers: number[]
  className?: string
  progress: ProgressState
  priceA?: number
  priceB?: number
  onReverseTokens: () => void
  poolIndex: number | null
  handleAddToken: (address: string) => void
  commonTokens: PublicKey[]
  initialHideUnknownTokensValue: boolean
  onHideUnknownTokensChange: (val: boolean) => void
  priceALoading?: boolean
  priceBLoading?: boolean
  feeTierIndex: number
  concentrationArray: number[]
  concentrationIndex: number
  minimumSliderIndex: number
  positionOpeningMethod: PositionOpeningMethod
  isBalanceLoading: boolean
  isGetLiquidityError: boolean
  ticksLoading: boolean
  network: NetworkType
  ethBalance: BN
  walletStatus: Status
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  tokenAIndex: number | null
  tokenBIndex: number | null
  setTokenAIndex: (index: number | null) => void
  setTokenBIndex: (index: number | null) => void
  canNavigate: boolean
  isCurrentPoolExisting: boolean
  promotedPoolTierIndex: number | undefined
  feeTiersWithTvl: Record<number, number>
  totalTvl: number
  isLoadingStats: boolean
}

export const DepositSelector: React.FC<IDepositSelector> = ({
  initialTokenFrom,
  initialTokenTo,
  initialFee,
  tokens,
  setPositionTokens,
  onAddLiquidity,
  tokenAInputState,
  tokenBInputState,
  feeTiers,
  className,
  progress,
  priceA,
  priceB,
  onReverseTokens,
  poolIndex,
  promotedPoolTierIndex,
  handleAddToken,
  commonTokens,
  initialHideUnknownTokensValue,
  onHideUnknownTokensChange,
  priceALoading,
  priceBLoading,
  feeTierIndex,
  concentrationArray,
  concentrationIndex,
  minimumSliderIndex,
  positionOpeningMethod,
  isBalanceLoading,
  isGetLiquidityError,
  ticksLoading,
  network,
  walletStatus,
  onConnectWallet,
  onDisconnectWallet,
  ethBalance,
  canNavigate,
  isCurrentPoolExisting,
  feeTiersWithTvl,
  totalTvl,
  isLoadingStats
}) => {
  const { classes } = useStyles()

  const [tokenAIndex, setTokenAIndex] = useState<number | null>(null)
  const [tokenBIndex, setTokenBIndex] = useState<number | null>(null)

  const WETH_MIN_FEE_LAMPORTS = useMemo(() => {
    if (network === NetworkType.Testnet) {
      return isCurrentPoolExisting ? WETH_POSITION_INIT_LAMPORTS_TEST : WETH_POOL_INIT_LAMPORTS_TEST
    } else {
      return isCurrentPoolExisting ? WETH_POSITION_INIT_LAMPORTS_MAIN : WETH_POOL_INIT_LAMPORTS_MAIN
    }
  }, [network, isCurrentPoolExisting])

  const [hideUnknownTokens, setHideUnknownTokens] = useState<boolean>(initialHideUnknownTokensValue)

  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (isLoaded || tokens.length === 0 || ALL_FEE_TIERS_DATA.length === 0) {
      return
    }
    let feeTierIndexFromPath = 0
    let tokenAIndexFromPath: null | number = null
    let tokenBIndexFromPath: null | number = null
    const tokenFromAddress = tickerToAddress(network, initialTokenFrom)
    const tokenToAddress = tickerToAddress(network, initialTokenTo)

    const tokenFromIndex = tokens.findIndex(
      token => token.assetAddress.toString() === tokenFromAddress
    )

    const tokenToIndex = tokens.findIndex(token => token.assetAddress.toString() === tokenToAddress)

    if (
      tokenFromAddress !== null &&
      tokenFromIndex !== -1 &&
      (tokenToAddress === null || tokenToIndex === -1)
    ) {
      tokenAIndexFromPath = tokenFromIndex
    } else if (
      tokenFromAddress !== null &&
      tokenToIndex !== -1 &&
      tokenToAddress !== null &&
      tokenFromIndex !== -1
    ) {
      tokenAIndexFromPath = tokenFromIndex
      tokenBIndexFromPath = tokenToIndex
    }
    const parsedFee = parsePathFeeToFeeString(initialFee)

    ALL_FEE_TIERS_DATA.forEach((feeTierData, index) => {
      if (feeTierData.tier.fee.toString() === parsedFee) {
        feeTierIndexFromPath = index
      }
    })
    setTokenAIndex(tokenAIndexFromPath)
    setTokenBIndex(tokenBIndexFromPath)
    setPositionTokens(tokenAIndexFromPath, tokenBIndexFromPath, feeTierIndexFromPath)

    setIsLoaded(true)
  }, [tokens, initialTokenFrom, initialTokenTo, initialFee])

  const [wasRunTokenA, setWasRunTokenA] = useState(false)
  const [wasRunTokenB, setWasRunTokenB] = useState(false)

  useEffect(() => {
    if (canNavigate) {
      const tokenAIndex = tokens.findIndex(
        token => token.assetAddress.toString() === tickerToAddress(network, initialTokenFrom)
      )
      if (!wasRunTokenA && tokenAIndex !== -1) {
        setTokenAIndex(tokenAIndex)
        setWasRunTokenA(true)
      }

      const tokenBIndex = tokens.findIndex(
        token => token.assetAddress.toString() === tickerToAddress(network, initialTokenTo)
      )
      if (!wasRunTokenB && tokenBIndex !== -1) {
        setTokenBIndex(tokenBIndex)
        setWasRunTokenB(true)
      }
    }
  }, [wasRunTokenA, wasRunTokenB, canNavigate, tokens.length])

  const getButtonMessage = useCallback(() => {
    if (tokenAIndex === null || tokenBIndex === null) {
      return 'Select tokens'
    }

    if (tokenAIndex === tokenBIndex) {
      return 'Select different tokens'
    }

    if (positionOpeningMethod === 'concentration' && concentrationIndex < minimumSliderIndex) {
      return concentrationArray[minimumSliderIndex]
        ? `Set concentration to at least ${concentrationArray[minimumSliderIndex].toFixed(0)}x`
        : 'Set higher fee tier'
    }

    if (isGetLiquidityError) {
      return 'Provide a smaller amount'
    }

    if (
      !tokenAInputState.blocked &&
      convertBalanceToBN(tokenAInputState.value, tokens[tokenAIndex].decimals).gt(
        tokens[tokenAIndex].balance
      )
    ) {
      return `Not enough ${tokens[tokenAIndex].symbol}`
    }

    if (
      !tokenBInputState.blocked &&
      convertBalanceToBN(tokenBInputState.value, tokens[tokenBIndex].decimals).gt(
        tokens[tokenBIndex].balance
      )
    ) {
      return `Not enough ${tokens[tokenBIndex].symbol}`
    }

    const tokenABalance = convertBalanceToBN(tokenAInputState.value, tokens[tokenAIndex].decimals)
    const tokenBBalance = convertBalanceToBN(tokenBInputState.value, tokens[tokenBIndex].decimals)

    if (
      (tokens[tokenAIndex].assetAddress.toString() === WRAPPED_ETH_ADDRESS &&
        tokens[tokenAIndex].balance.lt(tokenABalance.add(WETH_MIN_FEE_LAMPORTS))) ||
      (tokens[tokenBIndex].assetAddress.toString() === WRAPPED_ETH_ADDRESS &&
        tokens[tokenBIndex].balance.lt(tokenBBalance.add(WETH_MIN_FEE_LAMPORTS))) ||
      ethBalance.lt(WETH_MIN_FEE_LAMPORTS)
    ) {
      return `Insufficient ETH`
    }

    if (
      (!tokenAInputState.blocked && +tokenAInputState.value === 0) ||
      (!tokenBInputState.blocked && +tokenBInputState.value === 0)
    ) {
      return !tokenAInputState.blocked && !tokenBInputState.blocked
        ? 'Enter token amounts'
        : 'Enter token amount'
    }

    return 'Add Position'
  }, [
    tokenAIndex,
    tokenBIndex,
    tokenAInputState,
    tokenBInputState,
    tokens,
    positionOpeningMethod,
    concentrationIndex,
    feeTierIndex,
    minimumSliderIndex
  ])

  useEffect(() => {
    if (tokenAIndex !== null) {
      if (getScaleFromString(tokenAInputState.value) > tokens[tokenAIndex].decimals) {
        const parts = tokenAInputState.value.split('.')

        tokenAInputState.setValue(parts[0] + '.' + parts[1].slice(0, tokens[tokenAIndex].decimals))
      }
    }

    if (tokenBIndex !== null) {
      if (getScaleFromString(tokenBInputState.value) > tokens[tokenBIndex].decimals) {
        const parts = tokenBInputState.value.split('.')

        tokenAInputState.setValue(parts[0] + '.' + parts[1].slice(0, tokens[tokenBIndex].decimals))
      }
    }
  }, [poolIndex])

  const reverseTokens = () => {
    if (ticksLoading) {
      return
    }

    if (!tokenBInputState.blocked) {
      tokenAInputState.setValue(tokenBInputState.value)
    } else {
      tokenBInputState.setValue(tokenAInputState.value)
    }
    const pom = tokenAIndex
    setTokenAIndex(tokenBIndex)
    setTokenBIndex(pom)
    onReverseTokens()
  }

  const actionsTokenA = createButtonActions({
    tokens,
    wrappedTokenAddress: WRAPPED_ETH_ADDRESS,
    minAmount: WETH_MIN_FEE_LAMPORTS,
    onAmountSet: tokenAInputState.setValue
  })
  const actionsTokenB = createButtonActions({
    tokens,
    wrappedTokenAddress: WRAPPED_ETH_ADDRESS,
    minAmount: WETH_MIN_FEE_LAMPORTS,
    onAmountSet: tokenBInputState.setValue
  })

  return (
    <Grid container className={classNames(classes.wrapper, className)}>
      <Typography className={classes.sectionTitle}>Tokens</Typography>

      <Grid container className={classes.sectionWrapper} style={{ marginBottom: 40 }}>
        <Grid container className={classes.selects}>
          <Grid className={classes.selectWrapper}>
            <Select
              tokens={tokens}
              current={tokenAIndex !== null ? tokens[tokenAIndex] : null}
              onSelect={index => {
                setTokenAIndex(index)
                setPositionTokens(index, tokenBIndex, feeTierIndex)
              }}
              centered
              className={classes.customSelect}
              handleAddToken={handleAddToken}
              sliceName
              commonTokens={commonTokens}
              initialHideUnknownTokensValue={initialHideUnknownTokensValue}
              onHideUnknownTokensChange={e => {
                onHideUnknownTokensChange(e)
                setHideUnknownTokens(e)
              }}
              hiddenUnknownTokens={hideUnknownTokens}
              network={network}
            />
          </Grid>

          <TooltipHover title='Reverse tokens'>
            <img
              className={classes.arrows}
              src={icons.swapListIcon}
              alt='Arrow'
              onClick={reverseTokens}
            />
          </TooltipHover>

          <Grid className={classes.selectWrapper}>
            <Select
              tokens={tokens}
              current={tokenBIndex !== null ? tokens[tokenBIndex] : null}
              onSelect={index => {
                setTokenBIndex(index)
                setPositionTokens(tokenAIndex, index, feeTierIndex)
              }}
              centered
              className={classes.customSelect}
              handleAddToken={handleAddToken}
              sliceName
              commonTokens={commonTokens}
              initialHideUnknownTokensValue={initialHideUnknownTokensValue}
              onHideUnknownTokensChange={e => {
                onHideUnknownTokensChange(e)
                setHideUnknownTokens(e)
              }}
              hiddenUnknownTokens={hideUnknownTokens}
              network={network}
            />
          </Grid>
        </Grid>

        <FeeSwitch
          onSelect={fee => {
            setPositionTokens(tokenAIndex, tokenBIndex, fee)
          }}
          feeTiers={feeTiers}
          showOnlyPercents
          promotedPoolTierIndex={promotedPoolTierIndex}
          currentValue={feeTierIndex}
          feeTiersWithTvl={feeTiersWithTvl}
          totalTvl={totalTvl}
          isLoadingStats={isLoadingStats}
        />
      </Grid>

      <Typography className={classes.sectionTitle}>Deposit Amount</Typography>
      <Grid container className={classes.sectionWrapper}>
        <DepositAmountInput
          tokenPrice={priceA}
          currency={tokenAIndex !== null ? tokens[tokenAIndex].symbol : null}
          currencyIconSrc={tokenAIndex !== null ? tokens[tokenAIndex].logoURI : undefined}
          currencyIsUnknown={tokenAIndex !== null ? tokens[tokenAIndex].isUnknown ?? false : false}
          placeholder='0.0'
          actionButtons={[
            {
              label: 'Max',
              onClick: () => {
                actionsTokenA.max(tokenAIndex)
              },
              variant: 'max'
            },
            {
              label: '50%',
              variant: 'half',
              onClick: () => {
                actionsTokenA.half(tokenAIndex)
              }
            }
          ]}
          balanceValue={
            tokenAIndex !== null
              ? printBN(tokens[tokenAIndex].balance, tokens[tokenAIndex].decimals)
              : ''
          }
          style={{
            marginBottom: 10
          }}
          onBlur={() => {
            if (
              tokenAIndex !== null &&
              tokenBIndex !== null &&
              tokenAInputState.value.length === 0
            ) {
              tokenAInputState.setValue('0.0')
            }

            tokenAInputState.setValue(trimDecimalZeros(tokenAInputState.value))
          }}
          {...tokenAInputState}
          priceLoading={priceALoading}
          isBalanceLoading={isBalanceLoading}
          walletUninitialized={walletStatus !== Status.Initialized}
        />

        <DepositAmountInput
          tokenPrice={priceB}
          currency={tokenBIndex !== null ? tokens[tokenBIndex].symbol : null}
          currencyIconSrc={tokenBIndex !== null ? tokens[tokenBIndex].logoURI : undefined}
          currencyIsUnknown={tokenBIndex !== null ? tokens[tokenBIndex].isUnknown ?? false : false}
          placeholder='0.0'
          actionButtons={[
            {
              label: 'Max',
              variant: 'max',
              onClick: () => {
                actionsTokenB.max(tokenBIndex)
              }
            },
            {
              label: '50%',
              variant: 'half',
              onClick: () => {
                actionsTokenB.half(tokenBIndex)
              }
            }
          ]}
          balanceValue={
            tokenBIndex !== null
              ? printBN(tokens[tokenBIndex].balance, tokens[tokenBIndex].decimals)
              : ''
          }
          onBlur={() => {
            if (
              tokenAIndex !== null &&
              tokenBIndex !== null &&
              tokenBInputState.value.length === 0
            ) {
              tokenBInputState.setValue('0.0')
            }

            tokenBInputState.setValue(trimDecimalZeros(tokenBInputState.value))
          }}
          {...tokenBInputState}
          priceLoading={priceBLoading}
          isBalanceLoading={isBalanceLoading}
          walletUninitialized={walletStatus !== Status.Initialized}
        />
      </Grid>
      <Box width={'100%'}>
        {walletStatus !== Status.Initialized ? (
          <ChangeWalletButton
            name='Connect wallet'
            onConnect={onConnectWallet}
            connected={false}
            onDisconnect={onDisconnectWallet}
            className={classes.connectWalletButton}
          />
        ) : getButtonMessage() === 'Insufficient ETH' ? (
          <TooltipHover
            title='More ETH is required to cover the transaction fee. Obtain more ETH to complete this transaction.'
            top={-10}>
            <div>
              <AnimatedButton
                className={classNames(
                  classes.addButton,
                  progress === 'none' ? classes.hoverButton : undefined
                )}
                onClick={() => {
                  if (progress === 'none') {
                    onAddLiquidity()
                  }
                }}
                disabled={getButtonMessage() !== 'Add Position'}
                content={getButtonMessage()}
                progress={progress}
              />
            </div>
          </TooltipHover>
        ) : (
          <AnimatedButton
            className={classNames(
              classes.addButton,
              progress === 'none' ? classes.hoverButton : undefined
            )}
            onClick={() => {
              if (progress === 'none') {
                onAddLiquidity()
              }
            }}
            disabled={getButtonMessage() !== 'Add Position'}
            content={getButtonMessage()}
            progress={progress}
          />
        )}
      </Box>
    </Grid>
  )
}

export default DepositSelector
