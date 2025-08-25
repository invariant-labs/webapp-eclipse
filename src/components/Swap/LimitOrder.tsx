import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import ExchangeAmountInput from '@components/Inputs/ExchangeAmountInput/ExchangeAmountInput'
import { BN } from '@coral-xyz/anchor'
import { Box, Button, Grid, Typography, useMediaQuery } from '@mui/material'
import {
  DEFAULT_TOKEN_DECIMAL,
  NetworkType,
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
import { refreshIcon, swapArrowsIcon, warningIcon } from '@static/icons'
import { useNavigate } from 'react-router-dom'
import BuyTokenInput from './LimitOrderComponents/BuyTokenInput/BuyTokenInput'
import { DENOMINATOR, Market, Pair } from '@invariant-labs/sdk-eclipse'
import { theme } from '@static/theme'
import { OrderBook, PoolStructure } from '@invariant-labs/sdk-eclipse/lib/market'
import {
  limitOrderQuoteByInputToken,
  limitOrderQuoteByOutputToken
} from '@invariant-labs/sdk-eclipse/src/limit-order'
import { PoolWithAddress } from '@store/reducers/pools'
import TransactionDetailsBox from './SwapComponents/TransactionDetailsBox/TransactionDetailsBox'
import ExchangeRate from './SwapComponents/ExchangeRate/ExchangeRate'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'

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
  onRefresh: () => void
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
  // inputState,
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
  const [bnAmountOut, setBnAmountTo] = useState(new BN(0))

  const { setTokenFromIndex, setTokenToIndex, tokenFromIndex, tokenToIndex } = tokensState
  const { rateReversed, setRateReversed } = rateState
  const { lockAnimation, setLockAnimation } = lockAnimationState
  const { rotates, setRotates } = rotatesState
  const { swap, setSwap } = swapState
  const [hideUnknownTokens, setHideUnknownTokens] = React.useState<boolean>(
    initialHideUnknownTokensValue
  )
  const [detailsOpen, setDetailsOpen] = React.useState<boolean>(false)
  const [addBlur, _setAddBlur] = useState(false)
  const [errorVisible, setErrorVisible] = useState(false)

  const isXtoYOrderBook = useMemo(() => {
    if (tokenFromIndex === null) return

    const isXtoY =
      orderBookPair?.pair.tokenX.toString() === tokens[tokenFromIndex].address.toString()

    return isXtoY
  }, [tokenFromIndex, orderBookPair, tokens.length])

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
      onRefresh()
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

  const actions = createButtonActions({
    tokens,
    wrappedTokenAddress: WRAPPED_ETH_ADDRESS,
    minAmount: WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT,
    onAmountSet: setAmountFrom
  })

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

  const orderRewardRate = printBN(orderBook?.limitOrderRewardRate, DECIMAL - 2)

  const rewardValue = useMemo(() => {
    const poolFee = orderBookPair?.pair.feeTier.fee
    const rewardRate = orderBook?.limitOrderRewardRate
    if (!poolFee || !rewardRate || tokenToIndex === null) return '0'

    const reward = bnAmountOut
      .mul(poolFee)
      .mul(rewardRate)
      .div(DENOMINATOR.mul(DENOMINATOR).add(poolFee.mul(rewardRate)))

    return printBN(reward, tokens[tokenToIndex].decimals)
  }, [orderBookPair, bnAmountOut.toString()])

  const handleOpenTransactionDetails = () => {
    setDetailsOpen(!detailsOpen)
  }

  const swapRate =
    tokenFromIndex === null || tokenToIndex === null || amountFrom === '' || amountTo === ''
      ? 0
      : +amountTo / +amountFrom

  const hasShowRateMessage = () => {
    return (
      getStateMessage() === 'Insufficient balance' ||
      getStateMessage() === 'Add limit order' ||
      getStateMessage() === 'Set higher price' ||
      getStateMessage() === 'Loading' ||
      getStateMessage() === 'Connect a wallet' ||
      getStateMessage() === 'Insufficient ETH'
    )
  }

  const canShowDetails =
    tokenFromIndex !== null &&
    tokenToIndex !== null &&
    hasShowRateMessage() &&
    (getStateMessage() === 'Loading' ||
      (swapRate !== 0 && swapRate !== Infinity && !isNaN(swapRate))) &&
    amountFrom !== '' &&
    amountTo !== ''

  const showBlur = useMemo(() => {
    return addBlur || lockAnimation || getStateMessage() === 'Loading'
  }, [addBlur, lockAnimation, getStateMessage])

  useEffect(() => {
    const hasUnknown =
      tokens[tokenFromIndex ?? '']?.isUnknown || tokens[tokenToIndex ?? '']?.isUnknown

    const riskWarning =
      !priceToLoading && !priceFromLoading && !showBlur && (orderBook === null || !orderBookPair)

    if (hasUnknown) {
      setErrorVisible(true)
      return
    }
    const id = setTimeout(() => setErrorVisible(riskWarning), 150)
    return () => clearTimeout(id)
  }, [
    priceFromLoading,
    priceToLoading,
    showBlur,
    tokens,
    tokenFromIndex,
    tokenToIndex,
    orderBookPair,
    orderBook
  ])

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
                  onClick={onRefresh}
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
                    setBnAmountTo(new BN(0))
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

                  setBnAmountTo(amount)
                  setAmountTo(tokenOutAmount)
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

                  setAmountFrom(tmpAmount)
                }, 10)

                if (validatedTokenPriceAmount === '') return

                handleSetTokenPrice(1 / +validatedTokenPriceAmount, true)

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

                  setBnAmountTo(valueBN)
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
          {
            <>
              {tokenToIndex !== null && tokenFromIndex !== null ? (
                <Typography className={cx(classes.swapLabel)} mt={1.5}>
                  {/* {rateReversed ? 'Buy ' : 'Sell '}  */}
                  {'Sell '}
                  {tokens[tokenFromIndex].symbol}
                  {' at price'}
                </Typography>
              ) : (
                <Typography className={cx(classes.swapLabel)} mt={1.5}>
                  But price
                </Typography>
              )}
              <BuyTokenInput
                tokenPrice={tokenToPriceData?.price}
                setValue={value => {
                  if (tokenToIndex === null || tokenFromIndex === null) return

                  if (value === '') {
                    setTokenPriceAmount('')
                    setValidatedTokenPriceAmount('')
                    setAmountTo('')
                    setBnAmountTo(new BN(0))
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

                    setBnAmountTo(amountOutBN)

                    setAmountTo(tokenOutAmount)
                  }
                }}
                limit={1e14}
                decimalsLimit={tokenToIndex !== null ? tokens[tokenToIndex].decimals : 0}
                currency={tokenToIndex !== null ? tokens[tokenToIndex].symbol : ''}
                placeholder='0.0'
                onBlur={() => {
                  setTokenPriceAmount(validatedTokenPriceAmount)
                }}
                value={tokenPriceAmount}
                blocked={false}
                blockerInfo=''
                setMarketPrice={() => {
                  if (
                    !tokenToPriceData ||
                    !tokenFromPriceData ||
                    tokenToIndex === null ||
                    tokenFromIndex === null
                  )
                    return

                  const marketPrice = +tokenFromPriceData?.price / +tokenToPriceData?.price

                  handleSetTokenPrice(
                    +trimZeros(marketPrice.toFixed(tokens[tokenToIndex]?.decimals))
                  )

                  const { price, nearestTick } = validateTokenPrice(
                    +trimZeros(marketPrice.toFixed(tokens[tokenToIndex]?.decimals))
                  )

                  setTokenPriceAmount(price.toString())

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

                    setBnAmountTo(amountOutBN)
                    setAmountTo(tokenOutAmount)
                  }
                }}
              />
            </>
          }
          <Box
            className={classes.unknownWarningContainer}
            style={{
              height: errorVisible ? `34px` : '0px'
            }}>
            {(!orderBook || !orderBookPair) && tokenFromIndex !== null && tokenToIndex !== null && (
              <TooltipHover title='This swap price my differ from market price' top={100} fullSpan>
                <Box className={classes.unknownWarning}>
                  {` Can't create limit order for pair ${tokens[tokenFromIndex].symbol} -  ${tokens[tokenToIndex].symbol}`}
                </Box>
              </TooltipHover>
            )}

            <Grid className={classes.unverfiedWrapper}>
              {tokens[tokenFromIndex ?? '']?.isUnknown && (
                <TooltipHover
                  title={`${tokens[tokenFromIndex ?? ''].symbol} is unknown, make sure address is correct before trading`}
                  top={100}
                  fullSpan>
                  <Box className={classes.unknownWarning}>
                    <img width={16} src={warningIcon} />
                    {tokens[tokenFromIndex ?? ''].symbol} is not verified
                  </Box>
                </TooltipHover>
              )}
              {tokens[tokenToIndex ?? '']?.isUnknown && (
                <TooltipHover
                  title={`${tokens[tokenToIndex ?? ''].symbol} is unknown, make sure address is correct before trading`}
                  top={100}
                  fullSpan>
                  <Box className={classes.unknownWarning}>
                    <img width={16} src={warningIcon} />
                    {tokens[tokenToIndex ?? ''].symbol} is not verified
                  </Box>
                </TooltipHover>
              )}
            </Grid>
          </Box>
          <Box className={classes.mobileChangeRatioWrapper}>
            <Box className={classes.transactionDetailsInner}>
              <button
                onClick={
                  validatedTokenPriceAmount !== '' &&
                  hasShowRateMessage() &&
                  amountFrom !== '' &&
                  amountTo !== ''
                    ? handleOpenTransactionDetails
                    : undefined
                }
                className={cx(
                  tokenFromIndex !== null &&
                    tokenToIndex !== null &&
                    hasShowRateMessage() &&
                    amountFrom !== '' &&
                    amountTo !== ''
                    ? classes.HiddenTransactionButton
                    : classes.transactionDetailDisabled,
                  classes.transactionDetailsButton
                )}>
                <Grid className={classes.transactionDetailsWrapper}>
                  <Typography className={classes.transactionDetailsHeader}>
                    {detailsOpen && canShowDetails ? 'Hide' : 'Show'} transaction details
                  </Typography>
                </Grid>
              </button>
            </Box>
            {canShowDetails ? (
              <Box className={cx(classes.exchangeRateWrapper)}>
                <ExchangeRate
                  onClick={() => setRateReversed(!rateReversed)}
                  tokenFromSymbol={tokens[rateReversed ? tokenToIndex : tokenFromIndex].symbol}
                  tokenToSymbol={tokens[rateReversed ? tokenFromIndex : tokenToIndex].symbol}
                  amount={rateReversed ? 1 / swapRate : swapRate}
                  tokenToDecimals={tokens[rateReversed ? tokenFromIndex : tokenToIndex].decimals}
                  loading={false}
                />
              </Box>
            ) : null}
          </Box>
          <TransactionDetailsBox
            open={detailsOpen && canShowDetails}
            exchangeRate={{
              val: rateReversed ? 1 / swapRate : swapRate,
              symbol: canShowDetails
                ? tokens[rateReversed ? tokenFromIndex : tokenToIndex].symbol
                : '',
              decimal: canShowDetails
                ? tokens[rateReversed ? tokenFromIndex : tokenToIndex].decimals
                : 0
            }}
            isLoadingRate={getStateMessage() === 'Loading' || addBlur}
            feeTier={`${+printBN(orderBookPair?.pair.feeTier.fee, DECIMAL - 2).toString()}%`}
            makerProfit={{
              percentage: (
                (+printBN(orderBookPair?.pair.feeTier.fee, DECIMAL - 2) * +orderRewardRate) /
                100
              ).toString(),
              value: rewardValue,
              tokenSymbol: tokenToIndex !== null ? tokens[tokenToIndex].symbol : ''
            }}
            platformFee={'0'}
          />
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
