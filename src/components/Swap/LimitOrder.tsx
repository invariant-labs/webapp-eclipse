import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import ExchangeAmountInput from '@components/Inputs/ExchangeAmountInput/ExchangeAmountInput'
import { BN } from '@coral-xyz/anchor'
import { Box, Button, Grid, Typography, useMediaQuery } from '@mui/material'
import {
  DEFAULT_TOKEN_DECIMAL,
  inputTarget,
  NetworkType,
  REFRESHER_INTERVAL,
  WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN,
  WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_TEST,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import {
  addressToTicker,
  calcPriceByTickIndex,
  convertBalanceToBN,
  initialXtoY,
  nearestTickIndex,
  printBN,
  ROUTES,
  trimZeros
} from '@utils/utils'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import { createButtonActions } from '@utils/uiUtils'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import useStyles from './style'
import { TokenPriceData } from '@store/consts/types'
import TokensInfo from './TokensInfo/TokensInfo'
import { VariantType } from 'notistack'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { PublicKey } from '@solana/web3.js'
import { refreshIcon, swapArrowsIcon } from '@static/icons'
import { useNavigate } from 'react-router-dom'
import BuyTokenInput from './LimitOrderComponents/BuyTokenInput/BuyTokenInput'
import { Market, Pair } from '@invariant-labs/sdk-eclipse'
import { theme } from '@static/theme'
import { OrderBook, PoolStructure } from '@invariant-labs/sdk-eclipse/lib/market'
import {
  isLimitOrderBetterThanSwap,
  limitOrderQuoteByInputToken,
  limitOrderQuoteByOutputToken
} from '@invariant-labs/sdk-eclipse/src/limit-order'
import { PoolWithAddress } from '@store/reducers/pools'
export interface Pools {
  tokenX: PublicKey
  tokenY: PublicKey
  tokenXReserve: PublicKey
  tokenYReserve: PublicKey
  tickSpacing: number
  sqrtPrice: {
    v: BN
    scale: number
  }
  fee: {
    val: BN
    scale: number
  }
  exchangeRate: {
    val: BN
    scale: number
  }
}

export interface ILimitOrder {
  onRefresh: (tokenFrom: number | null, tokenTo: number | null) => void
  walletStatus: Status
  tokens: SwapToken[]
  onSetPair: (tokenFrom: PublicKey | null, tokenTo: PublicKey | null) => void
  progress: ProgressState
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  initialTokenFromIndex: number | null
  initialTokenToIndex: number | null
  handleAddToken: (address: string) => void
  commonTokens: PublicKey[]
  initialHideUnknownTokensValue: boolean
  onHideUnknownTokensChange: (val: boolean) => void
  tokenFromPriceData?: TokenPriceData
  tokenToPriceData?: TokenPriceData
  priceFromLoading?: boolean
  priceToLoading?: boolean
  isBalanceLoading: boolean
  copyTokenAddressHandler: (message: string, variant: VariantType) => void
  network: NetworkType
  ethBalance: BN
  isTimeoutError: boolean
  deleteTimeoutError: () => void
  canNavigate: boolean
  market: Market
  tokensDict: Record<string, SwapToken>
  tokensState: {
    tokenFromIndex: number | null
    setTokenFromIndex: React.Dispatch<React.SetStateAction<number | null>>
    tokenToIndex: number | null
    setTokenToIndex: React.Dispatch<React.SetStateAction<number | null>>
  }
  rateState: {
    rateReversed: boolean
    setRateReversed: React.Dispatch<React.SetStateAction<boolean>>
  }
  inputState: { inputRef: string; setInputRef: React.Dispatch<React.SetStateAction<string>> }
  lockAnimationState: {
    lockAnimation: boolean
    setLockAnimation: React.Dispatch<React.SetStateAction<boolean>>
  }
  swapState: {
    swap: boolean | null
    setSwap: React.Dispatch<React.SetStateAction<boolean | null>>
  }
  rotatesState: {
    rotates: number
    setRotates: React.Dispatch<React.SetStateAction<number>>
  }
  handleAddOrder: (amount: BN, tickIndex: number, xToY: boolean) => void
  orderBookPair?: {
    pair: Pair
    tickmap: PublicKey
  }
  orderBook: OrderBook | null
  poolData?: PoolWithAddress
  isLoading: boolean
}

export const LimitOrder: React.FC<ILimitOrder> = ({
  onRefresh,
  walletStatus,
  tokens,
  onSetPair,
  progress,
  onConnectWallet,
  onDisconnectWallet,
  initialTokenFromIndex,
  initialTokenToIndex,
  handleAddToken,
  commonTokens,
  initialHideUnknownTokensValue,
  onHideUnknownTokensChange,
  tokenFromPriceData,
  tokenToPriceData,
  priceFromLoading,
  priceToLoading,
  isBalanceLoading,
  copyTokenAddressHandler,
  network,
  ethBalance,
  isTimeoutError,
  deleteTimeoutError,
  canNavigate,
  // market,
  // tokensDict,
  rateState,
  tokensState,
  inputState,
  lockAnimationState,
  rotatesState,
  swapState,
  handleAddOrder,
  orderBookPair,
  orderBook,
  poolData,
  isLoading
}) => {
  const { classes, cx } = useStyles()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  const [amountFrom, setAmountFrom] = useState<string>('')
  const [amountTo, setAmountTo] = useState<string>('')
  const [tokenPriceAmount, setTokenPriceAmount] = useState<string>('')
  const [validatedTokenPriceAmount, setValidatedTokenPriceAmount] = useState<string>('')
  const [priceTickIndex, setPriceTickIndex] = useState(0)

  const { setTokenFromIndex, setTokenToIndex, tokenFromIndex, tokenToIndex } = tokensState
  const { rateReversed, setRateReversed } = rateState
  const { inputRef, setInputRef } = inputState
  const { lockAnimation, setLockAnimation } = lockAnimationState
  const { rotates, setRotates } = rotatesState
  const { swap, setSwap } = swapState
  const [refresherTime, setRefresherTime] = React.useState<number>(REFRESHER_INTERVAL)
  const [hideUnknownTokens, setHideUnknownTokens] = React.useState<boolean>(
    initialHideUnknownTokensValue
  )

  console.log(orderBookPair)
  console.log(orderBook)
  const isXtoYOrderBook = useMemo(() => {
    if (tokenFromIndex === null) return

    const isXtoY =
      orderBookPair?.pair.tokenX.toString() === tokens[tokenFromIndex].address.toString()

    return isXtoY
  }, [tokenFromIndex, orderBookPair, tokens.length])
  console.log(poolData?.currentTickIndex)
  console.log(priceTickIndex)

  console.log(isXtoYOrderBook)
  const WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT = useMemo(() => {
    if (network === NetworkType.Testnet) {
      return WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_TEST
    } else {
      return WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN
    }
  }, [network])

  const navigate = useNavigate()

  useEffect(() => {
    if (isTimeoutError) {
      onRefresh(tokenFromIndex, tokenToIndex)
      deleteTimeoutError()
    }
  }, [isTimeoutError])

  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!tokens.length) return
    if (tokenFromIndex === null || tokenToIndex === null) return
    if (!tokens[tokenFromIndex] || !tokens[tokenToIndex]) return

    clearTimeout(urlUpdateTimeoutRef.current)
    urlUpdateTimeoutRef.current = setTimeout(() => {
      const fromTicker = addressToTicker(network, tokens[tokenFromIndex].assetAddress.toString())
      const toTicker = addressToTicker(network, tokens[tokenToIndex].assetAddress.toString())
      const newPath = ROUTES.getExchangeRoute(fromTicker, toTicker)

      if (newPath !== window.location.pathname && !newPath.includes('/-/')) {
        navigate(newPath, { replace: true })
      }
    }, 500)

    return () => clearTimeout(urlUpdateTimeoutRef.current)
  }, [tokenFromIndex, tokenToIndex, tokens.length, network])

  useEffect(() => {
    if (!!tokens.length && tokenFromIndex === null && tokenToIndex === null && canNavigate) {
      setTokenFromIndex(initialTokenFromIndex)
      setTokenToIndex(initialTokenToIndex)
    }
  }, [tokens.length, canNavigate, initialTokenFromIndex, initialTokenToIndex])

  useEffect(() => {
    onSetPair(
      tokenFromIndex === null ? null : tokens[tokenFromIndex].assetAddress,
      tokenToIndex === null ? null : tokens[tokenToIndex].assetAddress
    )
  }, [tokenFromIndex, tokenToIndex])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (refresherTime > 0 && tokenFromIndex !== null && tokenToIndex !== null) {
        setRefresherTime(refresherTime - 1)
      } else {
        handleRefresh()
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [refresherTime, tokenFromIndex, tokenToIndex])

  useEffect(() => {
    if (inputRef !== inputTarget.DEFAULT) {
      const temp: string = amountFrom
      setAmountFrom(amountTo)
      setAmountTo(temp)
      setInputRef(inputRef === inputTarget.FROM ? inputTarget.TO : inputTarget.FROM)
    }
  }, [swap])

  useEffect(() => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      setRateReversed(
        !initialXtoY(
          tokens[tokenFromIndex].assetAddress.toString(),
          tokens[tokenToIndex].assetAddress.toString()
        )
      )
    }
  }, [tokenFromIndex, tokenToIndex])

  const isLimitOrderBetterThanSwap = (
    tickIndex: number,
    xToY: boolean,
    pool: Pick<PoolStructure, 'currentTickIndex'>
  ) => {
    return (
      (xToY && tickIndex > pool.currentTickIndex) || (!xToY && tickIndex < pool.currentTickIndex)
    )
  }

  const isLimitOrderAvailable = useMemo(() => {
    if (isXtoYOrderBook === undefined || !poolData) return
    return isLimitOrderBetterThanSwap(priceTickIndex, isXtoYOrderBook, poolData)
  }, [priceTickIndex, isXtoYOrderBook, poolData])

  const getStateMessage = () => {
    if (!orderBook || !orderBookPair) {
      return "Orderbook doesn't exist"
    }

    if (tokenFromIndex !== null && tokenToIndex !== null && amountFrom === '' && amountTo === '') {
      return 'Enter amount'
    }
    if (walletStatus !== Status.Initialized) {
      return 'Connect a wallet'
    }

    if (tokenFromIndex === null || tokenToIndex === null) {
      return 'Select a token'
    }

    if (tokenFromIndex === tokenToIndex) {
      return 'Select different tokens'
    }

    if (validatedTokenPriceAmount === '') {
      return 'Set token price'
    }

    if (!isLimitOrderAvailable) {
      return 'Set higher price'
    }

    if (isLoading) {
      return 'Loading'
    }

    if (
      convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals).gt(
        convertBalanceToBN(
          printBN(tokens[tokenFromIndex].balance, tokens[tokenFromIndex].decimals),
          tokens[tokenFromIndex].decimals
        )
      )
    ) {
      return 'Insufficient balance'
    }

    if (
      tokens[tokenFromIndex].assetAddress.toString() === WRAPPED_ETH_ADDRESS
        ? ethBalance.lt(
            convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals).add(
              WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT
            )
          )
        : ethBalance.lt(WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT)
    ) {
      return `Insufficient ETH`
    }

    if (convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals).eqn(0)) {
      return 'Insufficient amount'
    }

    return 'Add limit order'
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (lockAnimation) {
      timeoutId = setTimeout(() => setLockAnimation(false), 300)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [lockAnimation])

  const handleRefresh = async () => {
    setErrorVisible(false)
    onRefresh(tokenFromIndex, tokenToIndex)
    setRefresherTime(REFRESHER_INTERVAL)
  }

  useEffect(() => {
    setRefresherTime(REFRESHER_INTERVAL)

    if (tokenFromIndex === tokenToIndex) {
      setAmountFrom('')
      setAmountTo('')
    }
  }, [tokenFromIndex, tokenToIndex])

  const actions = createButtonActions({
    tokens,
    wrappedTokenAddress: WRAPPED_ETH_ADDRESS,
    minAmount: WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT,
    onAmountSet: setAmountFrom,
    onSelectInput: () => setInputRef(inputTarget.FROM)
  })

  const oraclePriceDiffPercentage = useMemo(() => {
    if (!tokenFromPriceData || !tokenToPriceData) return 0

    const tokenFromValue = tokenFromPriceData.price * +amountFrom
    const tokenToValue = tokenToPriceData.price * +amountTo
    if (tokenFromValue === 0 || tokenToValue === 0) return 0
    if (tokenToValue > tokenFromValue) return 0

    return Math.abs((tokenFromValue - tokenToValue) / tokenFromValue) * 100
  }, [tokenFromPriceData, tokenToPriceData, amountFrom, amountTo])

  const [errorVisible, setErrorVisible] = useState(false)

  useEffect(() => {
    const hasUnknown =
      tokens[tokenFromIndex ?? '']?.isUnknown || tokens[tokenToIndex ?? '']?.isUnknown

    const riskWarning = !priceToLoading && !priceFromLoading

    if (hasUnknown) {
      setErrorVisible(true)
      return
    }
    const id = setTimeout(() => setErrorVisible(riskWarning), 150)
    return () => clearTimeout(id)
  }, [
    oraclePriceDiffPercentage,
    priceFromLoading,
    priceToLoading,
    tokens,
    tokenFromIndex,
    tokenToIndex
  ])

  // const unknownFrom = tokens[tokenFromIndex ?? '']?.isUnknown
  // const unknownTo = tokens[tokenToIndex ?? '']?.isUnknown
  // const isUnkown = unknownFrom || unknownTo
  // const showOracle = oraclePriceDiffPercentage >= 10 && errorVisible

  // const warningsCount = [showOracle, isUnkown].filter(Boolean).length

  const validateTokenPrice = (input: number, reverseXtoY?: boolean) => {
    if (
      tokenFromIndex === null ||
      tokenToIndex === null ||
      !orderBookPair ||
      isXtoYOrderBook === undefined
    )
      return { price: 0, nearestTick: 0 }

    const nearestTick = nearestTickIndex(
      input,
      orderBookPair?.pair.tickSpacing,
      reverseXtoY ? !isXtoYOrderBook : isXtoYOrderBook,
      tokens[tokenFromIndex].decimals,
      tokens[tokenToIndex].decimals
    )

    const price = calcPriceByTickIndex(
      nearestTick,
      reverseXtoY ? !isXtoYOrderBook : isXtoYOrderBook,
      tokens[tokenFromIndex].decimals,
      tokens[tokenToIndex].decimals
    )

    return { price, nearestTick }
  }

  const handleSetTokenPrice = (priceInput: number, reverseXtoY?: boolean) => {
    const { price, nearestTick } = validateTokenPrice(priceInput, reverseXtoY)

    if (
      tokenFromIndex === null ||
      tokenToIndex === null ||
      !orderBookPair ||
      isXtoYOrderBook === undefined
    )
      return

    setPriceTickIndex(nearestTick)

    setValidatedTokenPriceAmount(price.toString())

    return price
  }

  return (
    <Grid container className={classes.swapWrapper} alignItems='center'>
      <Grid container className={classes.header}>
        <Box className={classes.leftSection}>
          <Typography component='h1'>Limit Order</Typography>
        </Box>

        <Box className={classes.rightSection}>
          <Box className={classes.swapControls}>
            <TooltipHover title='Refresh'>
              <Grid className={classes.refreshIconContainer}>
                <Button
                  onClick={handleRefresh}
                  className={classes.refreshIconBtn}
                  disabled={
                    priceFromLoading ||
                    priceToLoading ||
                    isBalanceLoading ||
                    tokenFromIndex === null ||
                    tokenToIndex === null ||
                    tokenFromIndex === tokenToIndex
                  }>
                  <img src={refreshIcon} className={classes.refreshIcon} alt='Refresh' />
                </Button>
              </Grid>
            </TooltipHover>
          </Box>
        </Box>
      </Grid>
      <Box className={cx(classes.borderContainer)}>
        <Grid container className={classes.root} direction='column'>
          <Typography className={cx(classes.swapLabel)}>Pay</Typography>
          <Box
            className={cx(
              classes.exchangeRoot,
              lockAnimation ? classes.amountInputDown : undefined
            )}>
            <ExchangeAmountInput
              value={amountFrom}
              balance={
                tokenFromIndex !== null && !!tokens[tokenFromIndex]
                  ? printBN(tokens[tokenFromIndex].balance, tokens[tokenFromIndex].decimals)
                  : '- -'
              }
              decimal={
                tokenFromIndex !== null ? tokens[tokenFromIndex].decimals : DEFAULT_TOKEN_DECIMAL
              }
              className={classes.amountInput}
              setValue={value => {
                if (value.match(/^\d*\.?\d*$/)) {
                  setAmountFrom(value)
                  setInputRef(inputTarget.FROM)

                  if (
                    tokenFromIndex === null ||
                    tokenToIndex === null ||
                    isXtoYOrderBook === undefined ||
                    !orderBookPair ||
                    !orderBook
                  )
                    return

                  if (validatedTokenPriceAmount === '') {
                    setAmountTo('')
                    return
                  }

                  const valueBN = convertBalanceToBN(value, tokens[tokenFromIndex].decimals)

                  const amount = limitOrderQuoteByInputToken(
                    valueBN,
                    isXtoYOrderBook,
                    priceTickIndex,
                    orderBookPair.pair.feeTier,
                    orderBook
                  )

                  const tokenOutAmount = printBN(amount, tokens[tokenToIndex].decimals)

                  setAmountTo(tokenOutAmount)
                  // if (tokenPriceAmount) {
                  //   if (rateReversed) {
                  //     setAmountTo(
                  //       trimZeros(
                  //         (+value / +tokenPriceAmount).toFixed(tokens[tokenToIndex]?.decimals)
                  //       )
                  //     )
                  //   } else {
                  //     setAmountTo(
                  //       trimZeros(
                  //         (+value * +tokenPriceAmount).toFixed(tokens[tokenToIndex]?.decimals)
                  //       )
                  //     )
                  //   }
                  // } else {
                  //   if (rateReversed) {
                  //     if (!tokenToPriceData || !tokenFromPriceData) return
                  //     const marketPrice = +tokenToPriceData?.price / +tokenFromPriceData?.price
                  //     setTokenPriceAmount(marketPrice.toString())

                  //     setAmountTo(
                  //       trimZeros((+value / +marketPrice).toFixed(tokens[tokenToIndex]?.decimals))
                  //     )
                  //   } else {
                  //     if (!tokenToPriceData || !tokenFromPriceData) return
                  //     const marketPrice = +tokenFromPriceData?.price / +tokenToPriceData?.price

                  //     setTokenPriceAmount(marketPrice.toString())

                  //     setAmountTo(
                  //       trimZeros((+value * +marketPrice).toFixed(tokens[tokenToIndex]?.decimals))
                  //     )
                  //   }
                  // }
                }
              }}
              placeholder={`0.${'0'.repeat(6)}`}
              actionButtons={[
                {
                  label: 'Max',
                  variant: 'max',
                  onClick: () => {
                    actions.max(tokenFromIndex)
                  }
                },
                {
                  label: '50%',
                  variant: 'half',
                  onClick: () => {
                    actions.half(tokenFromIndex)
                  }
                }
              ]}
              tokens={tokens}
              current={tokenFromIndex !== null ? tokens[tokenFromIndex] : null}
              onSelect={setTokenFromIndex}
              disabled={tokenFromIndex === tokenToIndex || tokenFromIndex === null}
              hideBalances={walletStatus !== Status.Initialized}
              handleAddToken={handleAddToken}
              commonTokens={commonTokens}
              limit={1e14}
              initialHideUnknownTokensValue={initialHideUnknownTokensValue}
              onHideUnknownTokensChange={e => {
                onHideUnknownTokensChange(e)
                setHideUnknownTokens(e)
              }}
              tokenPrice={tokenFromPriceData?.price}
              priceLoading={priceFromLoading}
              isBalanceLoading={isBalanceLoading}
              showMaxButton={true}
              showBlur={lockAnimation}
              hiddenUnknownTokens={hideUnknownTokens}
              network={network}
            />
          </Box>

          <Box className={classes.tokenComponentTextContainer}>
            <Box
              className={cx(classes.swapArrowBox)}
              onClick={() => {
                if (lockAnimation) return
                setRotates(rotates + 1)
                swap !== null ? setSwap(!swap) : setSwap(true)
                setTimeout(() => {
                  const tmpAmount = amountTo

                  const tmp = tokenFromIndex
                  setTokenFromIndex(tokenToIndex)
                  setTokenToIndex(tmp)

                  setInputRef(inputTarget.FROM)
                  setAmountFrom(tmpAmount)
                }, 10)

                if (validatedTokenPriceAmount === '') return

                console.log(validatedTokenPriceAmount)

                console.log(1 / +validatedTokenPriceAmount)
                console.log(validatedTokenPriceAmount)
                handleSetTokenPrice(1 / +validatedTokenPriceAmount, true)

                console.log(1 / +validatedTokenPriceAmount)

                setTokenPriceAmount((1 / +validatedTokenPriceAmount).toString())
              }}>
              <Box className={cx(classes.swapImgRoot)}>
                <img
                  src={swapArrowsIcon}
                  style={{
                    transform: `rotate(${-rotates * 180}deg)`
                  }}
                  className={classes.swapArrows}
                  alt='Invert tokens'
                />
              </Box>
            </Box>
          </Box>
          <Typography className={cx(classes.swapLabel)} mt={1.5}>
            Receive
          </Typography>
          <Box
            className={cx(classes.exchangeRoot, lockAnimation ? classes.amountInputUp : undefined)}>
            <ExchangeAmountInput
              value={amountTo}
              balance={
                tokenToIndex !== null
                  ? printBN(tokens[tokenToIndex].balance, tokens[tokenToIndex].decimals)
                  : '- -'
              }
              className={classes.amountInput}
              decimal={
                tokenToIndex !== null ? tokens[tokenToIndex].decimals : DEFAULT_TOKEN_DECIMAL
              }
              setValue={value => {
                if (value.match(/^\d*\.?\d*$/)) {
                  setAmountTo(value)
                  setInputRef(inputTarget.TO)

                  if (
                    tokenFromIndex === null ||
                    tokenToIndex === null ||
                    isXtoYOrderBook === undefined ||
                    !orderBookPair ||
                    !orderBook
                  )
                    return

                  if (validatedTokenPriceAmount === '') {
                    setAmountFrom('')

                    return
                  }

                  const valueBN = convertBalanceToBN(value, tokens[tokenToIndex].decimals)

                  const amount = limitOrderQuoteByOutputToken(
                    valueBN,
                    isXtoYOrderBook,
                    priceTickIndex,
                    orderBookPair.pair.feeTier,
                    orderBook
                  )

                  const tokenOutAmount = printBN(amount, tokens[tokenFromIndex].decimals)

                  setAmountFrom(tokenOutAmount)

                  // if (tokenPriceValue) {
                  //   if (rateReversed) {
                  //     const amountFrom = +tokenPriceValue / +value
                  //     setAmountFrom(trimZeros(amountFrom.toFixed(tokens[tokenFromIndex]?.decimals)))
                  //   } else {
                  //     const amountFrom = +value / +tokenPriceValue
                  //     setAmountFrom(trimZeros(amountFrom.toFixed(tokens[tokenFromIndex]?.decimals)))
                  //   }
                  // } else {
                  //   if (rateReversed) {
                  //     if (!tokenToPriceData || !tokenFromPriceData) return

                  //     const marketPrice = +tokenToPriceData?.price / +tokenFromPriceData?.price
                  //     setTokenPriceValue(
                  //       trimZeros(marketPrice.toFixed(tokens[tokenToIndex]?.decimals))
                  //     )
                  //     const amountFrom = +marketPrice / +value

                  //     setAmountFrom(trimZeros(amountFrom.toFixed(tokens[tokenFromIndex]?.decimals)))
                  //   } else {
                  //     if (!tokenToPriceData || !tokenFromPriceData) return

                  //     const marketPrice = +tokenFromPriceData?.price / +tokenToPriceData?.price
                  //     setTokenPriceValue(
                  //       trimZeros(marketPrice.toFixed(tokens[tokenToIndex]?.decimals))
                  //     )

                  //     const amountFrom = +value / +marketPrice

                  //     setAmountFrom(trimZeros(amountFrom.toFixed(tokens[tokenFromIndex]?.decimals)))
                  //   }
                  // }
                }
              }}
              placeholder={`0.${'0'.repeat(6)}`}
              actionButtons={[
                {
                  label: 'Max',
                  variant: 'max',
                  onClick: () => {
                    actions.max(tokenFromIndex)
                  }
                },
                {
                  label: '50%',
                  variant: 'half',
                  onClick: () => {
                    actions.half(tokenFromIndex)
                  }
                }
              ]}
              tokens={tokens}
              current={tokenToIndex !== null ? tokens[tokenToIndex] : null}
              onSelect={setTokenToIndex}
              disabled={tokenFromIndex === tokenToIndex || tokenToIndex === null}
              hideBalances={walletStatus !== Status.Initialized}
              handleAddToken={handleAddToken}
              commonTokens={commonTokens}
              limit={1e14}
              initialHideUnknownTokensValue={initialHideUnknownTokensValue}
              onHideUnknownTokensChange={e => {
                onHideUnknownTokensChange(e)
                setHideUnknownTokens(e)
              }}
              tokenPrice={tokenToPriceData?.price}
              showMaxButton={false}
              priceLoading={priceToLoading}
              isBalanceLoading={isBalanceLoading}
              showBlur={lockAnimation}
              hiddenUnknownTokens={hideUnknownTokens}
              network={network}
            />
          </Box>
          {tokenFromIndex !== null && tokenToIndex !== null && (
            <>
              <Typography className={cx(classes.swapLabel)} mt={1.5}>
                {rateReversed
                  ? 'Buy ' + tokens[tokenToIndex].symbol
                  : 'Sell ' + tokens[tokenFromIndex].symbol}{' '}
                at price
              </Typography>
              <BuyTokenInput
                tokenPrice={tokenToPriceData?.price}
                setValue={value => {
                  if (value === '') {
                    setTokenPriceAmount('')
                    setValidatedTokenPriceAmount('')
                    setAmountTo('')

                    return
                  }

                  setTokenPriceAmount(value)
                  handleSetTokenPrice(+value)

                  const { nearestTick } = validateTokenPrice(+value)

                  if (isXtoYOrderBook !== undefined && orderBookPair && orderBook) {
                    const parsedAmountFrom = +amountFrom ? amountFrom : '1'

                    if (!+amountFrom || amountFrom === '0') {
                      setAmountFrom(parsedAmountFrom)
                    }
                    const tokenFromBNValue = convertBalanceToBN(
                      parsedAmountFrom,
                      tokens[tokenFromIndex].decimals
                    )

                    const amountOutBN = limitOrderQuoteByInputToken(
                      tokenFromBNValue,
                      isXtoYOrderBook,
                      nearestTick,
                      orderBookPair.pair.feeTier,
                      orderBook
                    )

                    const tokenOutAmount = printBN(amountOutBN, tokens[tokenToIndex].decimals)

                    setAmountTo(tokenOutAmount)
                  }
                }}
                limit={1e14}
                decimalsLimit={tokens[tokenToIndex].decimals}
                currency={tokens[tokenToIndex].symbol}
                placeholder='0.0'
                onBlur={() => {
                  setTokenPriceAmount(validatedTokenPriceAmount)
                }}
                value={tokenPriceAmount}
                blocked={false}
                blockerInfo=''
                setMarketPrice={() => {
                  if (!tokenToPriceData || !tokenFromPriceData) return

                  const marketPrice = +tokenFromPriceData?.price / +tokenToPriceData?.price

                  handleSetTokenPrice(
                    +trimZeros(marketPrice.toFixed(tokens[tokenToIndex]?.decimals))
                  )

                  const { price, nearestTick } = validateTokenPrice(
                    +trimZeros(marketPrice.toFixed(tokens[tokenToIndex]?.decimals))
                  )

                  setTokenPriceAmount(price.toString())

                  if (
                    amountFrom !== '' &&
                    amountFrom !== '0' &&
                    isXtoYOrderBook !== undefined &&
                    orderBookPair &&
                    orderBook
                  ) {
                    const tokenFromBNValue = convertBalanceToBN(
                      amountFrom,
                      tokens[tokenFromIndex].decimals
                    )

                    const amountOutBN = limitOrderQuoteByInputToken(
                      tokenFromBNValue,
                      isXtoYOrderBook,
                      nearestTick,
                      orderBookPair.pair.feeTier,
                      orderBook
                    )

                    const tokenOutAmount = printBN(amountOutBN, tokens[tokenToIndex].decimals)

                    setAmountTo(tokenOutAmount)
                  }
                }}
              />
            </>
          )}
          <Grid container margin={isSm ? '12px 0' : 0}>
            <TokensInfo
              tokenFrom={tokenFromIndex !== null ? tokens[tokenFromIndex] : null}
              tokenTo={tokenToIndex !== null ? tokens[tokenToIndex] : null}
              tokenToPrice={tokenToPriceData?.price}
              tokenFromPrice={tokenFromPriceData?.price}
              copyTokenAddressHandler={copyTokenAddressHandler}
              network={network}
              isPairGivingPoints={false}
            />
          </Grid>
          {walletStatus !== Status.Initialized && getStateMessage() !== 'Loading' ? (
            <ChangeWalletButton
              height={48}
              name='Connect wallet'
              onConnect={onConnectWallet}
              connected={false}
              onDisconnect={onDisconnectWallet}
              isSwap={true}
            />
          ) : getStateMessage() === 'Insufficient ETH' ? (
            <TooltipHover
              title='More ETH is required to cover the transaction fee. Obtain more ETH to complete this transaction.'
              top={-45}>
              <AnimatedButton
                content={getStateMessage()}
                className={
                  getStateMessage() === 'Connect a wallet'
                    ? `${classes.swapButton}`
                    : getStateMessage() === 'Add limit order' && progress === 'none'
                      ? `${classes.swapButton} ${classes.buttonSwapActive}`
                      : classes.swapButton
                }
                disabled={getStateMessage() !== 'Add limit order' || progress !== 'none'}
                onClick={() => {
                  if (tokenFromIndex === null || tokenToIndex === null) return
                }}
                progress={progress}
              />
            </TooltipHover>
          ) : (
            <AnimatedButton
              content={getStateMessage()}
              className={
                getStateMessage() === 'Connect a wallet'
                  ? `${classes.swapButton}`
                  : getStateMessage() === 'Add limit order' && progress === 'none'
                    ? `${classes.swapButton} ${classes.buttonSwapActive}`
                    : classes.swapButton
              }
              disabled={getStateMessage() !== 'Add limit order' || progress !== 'none'}
              onClick={() => {
                if (
                  tokenFromIndex === null ||
                  tokenToIndex === null ||
                  isXtoYOrderBook === undefined
                )
                  return

                const amountBn = convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals)

                handleAddOrder(amountBn, priceTickIndex, isXtoYOrderBook)
              }}
              progress={progress}
            />
          )}
        </Grid>
      </Box>
    </Grid>
  )
}

export default LimitOrder
