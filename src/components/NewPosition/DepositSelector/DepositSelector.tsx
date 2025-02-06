import AnimatedButton, { ProgressState } from '@components/AnimatedButton/AnimatedButton'
import DepositAmountInput from '@components/Inputs/DepositAmountInput/DepositAmountInput'
import Select from '@components/Inputs/Select/Select'
import { Box, Button, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import SwapList from '@static/svg/swap-list.svg'
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
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
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
  trimDecimalZeros,
  simulateAutoSwap,
  simulateAutoSwapOnTheSamePool
} from '@utils/utils'
import { blurContent, createButtonActions, unblurContent } from '@utils/uiUtils'
import icons from '@static/icons'
import { PoolWithAddress } from '@store/reducers/pools'
import { Tick, Tickmap } from '@invariant-labs/sdk-eclipse/lib/market'
import {
  fromFee,
  SimulateSwapAndCreatePositionSimulation
} from '@invariant-labs/sdk-eclipse/lib/utils'
import DepoSitOptionsModal from '@components/Modals/DepositOptionsModal/DepositOptionsModal'

export interface InputState {
  value: string
  setValue: (value: string) => void
  blocked: boolean
  blockerInfo?: string
  decimalsLimit: number
}

export enum DepositOptions {
  Basic = 'Basic',
  Auto = 'Auto'
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
  onSwapAndAddLiquidity: (
    maxLiquidityPercentage: BN,
    minUtilizationPercentage: BN,
    estimatedPriceAfterSwap: BN,
    swapAmount: BN,
    swapSlippage: BN,
    positionSlippage: BN,
    ticks: number[]
  ) => void
  tokenAInputState: InputState
  tokenBInputState: InputState
  feeTiers: number[]
  className?: string
  progress: ProgressState
  priceA?: number
  priceB?: number
  onReverseTokens: () => void
  poolIndex: number | null
  bestTierIndex?: number
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
  isAutoSwapAvailable: boolean
  isAutoSwapOnTheSamePool: boolean
  autoSwapPoolData: PoolWithAddress | null
  autoSwapTickmap: Tickmap | null
  autoSwapTicks: Tick[] | null
  actualPoolPrice: BN | null
  simulationParams: {
    lowerTickIndex: number
    upperTickIndex: number
  }
  initialMaxPriceImpact: string
  onMaxPriceImpactChange: (val: string) => void
  initialMinUtilization: string
  onMinUtilizationChange: (val: string) => void
  onMaxSlippageToleranceSwapChange: (val: string) => void
  initialMaxSlippageToleranceSwap: string
  onMaxSlippageToleranceCreatePositionChange: (val: string) => void
  initialMaxSlippageToleranceCreatePosition: string
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
  bestTierIndex,
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
  isAutoSwapAvailable,
  autoSwapPoolData,
  autoSwapTickmap,
  autoSwapTicks,
  simulationParams,
  initialMaxPriceImpact,
  onMaxPriceImpactChange,
  initialMinUtilization,
  onMinUtilizationChange,
  isAutoSwapOnTheSamePool,
  onSwapAndAddLiquidity,
  onMaxSlippageToleranceSwapChange,
  initialMaxSlippageToleranceSwap,
  onMaxSlippageToleranceCreatePositionChange,
  initialMaxSlippageToleranceCreatePosition,
  actualPoolPrice
}) => {
  const { classes } = useStyles()
  const [priceImpact, setPriceImpact] = useState<string>(initialMaxPriceImpact)
  const [utilization, setUtilization] = useState<string>(initialMinUtilization)
  const [slippageToleranceSwap, setSlippageToleranceSwap] = useState<string>(
    initialMaxSlippageToleranceSwap
  )
  const [slippageToleranceCreatePosition, setSlippageToleranceCreatePosition] = useState<string>(
    initialMaxSlippageToleranceCreatePosition
  )

  const [tokenAIndex, setTokenAIndex] = useState<number | null>(null)
  const [tokenBIndex, setTokenBIndex] = useState<number | null>(null)

  const [tokenACheckbox, setTokenACheckbox] = useState<boolean>(true)
  const [tokenBCheckbox, setTokenBCheckbox] = useState<boolean>(true)

  const [simulation, setSimulation] = useState<SimulateSwapAndCreatePositionSimulation | null>(null)

  const [alignment, setAlignment] = useState<string>(DepositOptions.Basic)

  const [settings, setSettings] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!isAutoSwapAvailable && alignment === DepositOptions.Auto) {
      setAlignment(DepositOptions.Basic)
    }
  }, [isAutoSwapAvailable])

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

    if (isAutoSwapAvailable && !tokenACheckbox && !tokenBCheckbox) {
      return 'At least one checkbox needs to be marked'
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
      tokenACheckbox &&
      convertBalanceToBN(tokenAInputState.value, tokens[tokenAIndex].decimals).gt(
        tokens[tokenAIndex].balance
      )
    ) {
      return `Not enough ${tokens[tokenAIndex].symbol}`
    }

    if (
      !tokenBInputState.blocked &&
      tokenBCheckbox &&
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
    isAutoSwapAvailable,
    tokenACheckbox,
    tokenBCheckbox,
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

  const handleClickDepositOptions = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setSettings(true)
  }

  const handleCloseDepositOptions = () => {
    unblurContent()
    setSettings(false)
  }

  const setMaxPriceImpact = (priceImpact: string): void => {
    setPriceImpact(priceImpact)
    onMaxPriceImpactChange(priceImpact)
  }

  const setMinUtilization = (utilization: string): void => {
    setUtilization(utilization)
    onMinUtilizationChange(utilization)
  }

  const setMaxSlippageToleranceSwap = (slippageToleranceSwap: string): void => {
    setSlippageToleranceSwap(slippageToleranceSwap)
    onMaxSlippageToleranceSwapChange(slippageToleranceSwap)
  }

  const setMaxSlippageToleranceCreatePosition = (slippageToleranceCreatePosition: string): void => {
    setSlippageToleranceCreatePosition(slippageToleranceCreatePosition)
    onMaxSlippageToleranceCreatePositionChange(slippageToleranceCreatePosition)
  }

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
    const pom2 = tokenACheckbox
    setTokenACheckbox(tokenBCheckbox)
    setTokenBCheckbox(pom2)
    onReverseTokens()
  }

  const handleSwitchDepositType = (
    _: React.MouseEvent<HTMLElement>,
    newAlignment: DepositOptions | null
  ) => {
    if (newAlignment !== null) {
      if (newAlignment === DepositOptions.Basic) {
        setTokenACheckbox(true)
        setTokenBCheckbox(true)
      }
      setAlignment(newAlignment)
    }
  }

  // const ACTIONS_BUTTON_METHODS = {
  //   max: (tokenIndex: number | null) => {
  //     if (tokenIndex === null) {
  //       return
  //     }

  //     if (tokens[tokenIndex].assetAddress.equals(new PublicKey(WRAPPED_ETH_ADDRESS))) {
  //       tokenAInputState.setValue(
  //         trimDecimalZeros(
  //           printBN(
  //             tokens[tokenIndex].balance.gt(WETH_MIN_FEE_LAMPORTS)
  //               ? tokens[tokenIndex].balance.sub(WETH_MIN_FEE_LAMPORTS)
  //               : new BN(0),
  //             tokens[tokenIndex].decimals
  //           )
  //         )
  //       )

  //       return
  //     }

  //     tokenAInputState.setValue(printBN(tokens[tokenIndex].balance, tokens[tokenIndex].decimals))
  //   }
  // }

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

  useEffect(() => {
    setTokenACheckbox(true)
    setTokenBCheckbox(true)
  }, [tokenAIndex, tokenBIndex])

  const simulateAutoSwapResult = async () => {
    if (
      !autoSwapPoolData ||
      !autoSwapTicks ||
      !autoSwapTickmap ||
      !tokenAIndex ||
      !tokenBIndex ||
      !actualPoolPrice
    )
      return
    let result: SimulateSwapAndCreatePositionSimulation | null = null
    if (isAutoSwapOnTheSamePool) {
      result = await simulateAutoSwapOnTheSamePool(
        tokens[tokenAIndex].balance,
        tokens[tokenBIndex].balance,
        autoSwapPoolData,
        autoSwapTicks,
        autoSwapTickmap,
        fromFee(new BN(Number(+slippageToleranceSwap * 1000))),
        simulationParams.lowerTickIndex,
        simulationParams.upperTickIndex,
        fromFee(new BN(Number(100 * 1000)))
      )
    } else {
      result = await simulateAutoSwap(
        tokens[tokenAIndex].balance,
        tokens[tokenBIndex].balance,
        autoSwapPoolData,
        autoSwapTicks,
        autoSwapTickmap,
        fromFee(new BN(Number(+slippageToleranceCreatePosition * 1000))),
        fromFee(new BN(Number(+slippageToleranceSwap * 1000))),
        simulationParams.lowerTickIndex,
        simulationParams.upperTickIndex,
        actualPoolPrice,
        fromFee(new BN(Number(100 * 1000)))
      )
    }
    console.log(result)
    if (!!result) {
      setSimulation(result)
    }
  }
  useEffect(() => {
    if (tokenACheckbox !== tokenBCheckbox) {
      simulateAutoSwapResult()
    }
  }, [
    tokenACheckbox,
    tokenBCheckbox,
    actualPoolPrice,
    autoSwapPoolData,
    autoSwapTickmap,
    autoSwapTicks,
    priceImpact,
    slippageToleranceCreatePosition,
    slippageToleranceSwap,
    utilization,
    tokenAInputState,
    tokenBInputState
  ])

  return (
    <Grid container direction='column' className={classNames(classes.wrapper, className)}>
      <DepoSitOptionsModal
        initialMaxPriceImpact={initialMaxPriceImpact}
        setMaxPriceImpact={setMaxPriceImpact}
        initialMinUtilization={initialMinUtilization}
        setMinUtilization={setMinUtilization}
        initialMaxSlippageToleranceSwap={initialMaxSlippageToleranceSwap}
        setMaxSlippageToleranceSwap={setMaxSlippageToleranceSwap}
        initialMaxSlippageToleranceCreatePosition={initialMaxSlippageToleranceCreatePosition}
        setMaxSlippageToleranceCreatePosition={setMaxSlippageToleranceCreatePosition}
        handleClose={handleCloseDepositOptions}
        anchorEl={anchorEl}
        open={settings}
      />
      <Typography className={classes.sectionTitle}>Tokens</Typography>
      <Grid container className={classes.sectionWrapper} style={{ marginBottom: 40 }}>
        <Grid container className={classes.selects} direction='row' justifyContent='space-between'>
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

          <TooltipHover text='Reverse tokens'>
            <img className={classes.arrows} src={SwapList} alt='Arrow' onClick={reverseTokens} />
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
          bestTierIndex={bestTierIndex}
          promotedPoolTierIndex={promotedPoolTierIndex}
          currentValue={feeTierIndex}
        />
      </Grid>
      <Grid container className={classes.depositHeader}>
        <Typography className={classes.sectionTitle}>Deposit Amount</Typography>
        <Box className={classes.depositOptions}>
          <Box className={classes.switchDepositTypeContainer}>
            <Box
              className={classes.switchDepositTypeMarker}
              sx={{
                left: alignment === DepositOptions.Basic ? 0 : '50%'
              }}
            />
            <ToggleButtonGroup
              value={alignment}
              exclusive
              onChange={handleSwitchDepositType}
              className={classes.switchDepositTypeButtonsGroup}>
              <ToggleButton
                value={DepositOptions.Basic}
                disableRipple
                className={classNames(
                  classes.switchDepositTypeButton,
                  alignment === DepositOptions.Basic
                    ? classes.switchSelected
                    : classes.switchNotSelected
                )}>
                Basic
              </ToggleButton>
              <ToggleButton
                disabled={!isAutoSwapAvailable}
                value={DepositOptions.Auto}
                disableRipple
                className={classNames(
                  classes.switchDepositTypeButton,
                  alignment === DepositOptions.Auto
                    ? classes.switchSelected
                    : classes.switchNotSelected
                )}>
                Auto
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Button
            onClick={handleClickDepositOptions}
            className={classes.optionsIconBtn}
            disabled={!isAutoSwapAvailable}>
            <img src={icons.autoSwapOptions} alt='options' />
          </Button>
        </Box>
      </Grid>
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
          value={tokenACheckbox ? tokenAInputState.value : '0'}
          priceLoading={priceALoading}
          isBalanceLoading={isBalanceLoading}
          walletUninitialized={walletStatus !== Status.Initialized}
          autoSwapEnabled={alignment === DepositOptions.Auto}
          checkBoxValue={tokenACheckbox}
          setCheckBoxValue={setTokenACheckbox}
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
          value={tokenBCheckbox ? tokenBInputState.value : '0'}
          priceLoading={priceBLoading}
          isBalanceLoading={isBalanceLoading}
          walletUninitialized={walletStatus !== Status.Initialized}
          autoSwapEnabled={alignment === DepositOptions.Auto}
          checkBoxValue={tokenBCheckbox}
          setCheckBoxValue={setTokenBCheckbox}
        />
      </Grid>
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
          text='More ETH is required to cover the transaction fee. Obtain more ETH to complete this transaction.'
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
            if (progress === 'none' && tokenAIndex && tokenBIndex) {
              const userMinUtilization = fromFee(new BN(Number(+utilization * 1000)))

              alignment === DepositOptions.Auto &&
              tokenACheckbox !== tokenBCheckbox &&
              simulation &&
              simulation.swapSimulation &&
              simulation.swapInput &&
              simulation.utilization
                ? onSwapAndAddLiquidity(
                    fromFee(new BN(Number(100 * 1000))),
                    userMinUtilization.lt(simulation.utilization)
                      ? userMinUtilization
                      : simulation.utilization,
                    simulation.swapSimulation.priceAfterSwap,
                    simulation.swapInput.swapAmount,
                    simulation.swapSimulation.priceImpact,
                    fromFee(new BN(Number(+slippageToleranceCreatePosition * 1000))),
                    simulation.swapSimulation.crossedTicks
                  )
                : onAddLiquidity()
            }
          }}
          disabled={getButtonMessage() !== 'Add Position'}
          content={getButtonMessage()}
          progress={progress}
        />
      )}
    </Grid>
  )
}

export default DepositSelector
