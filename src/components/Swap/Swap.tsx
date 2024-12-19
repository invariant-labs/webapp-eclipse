import AnimatedButton, { ProgressState } from '@components/AnimatedButton/AnimatedButton'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import ExchangeAmountInput from '@components/Inputs/ExchangeAmountInput/ExchangeAmountInput'
import Slippage from '@components/Modals/Slippage/Slippage'
import Refresher from '@components/Refresher/Refresher'
import { BN } from '@coral-xyz/anchor'
import { Box, Button, Grid, Typography } from '@mui/material'
import refreshIcon from '@static/svg/refresh.svg'
import settingIcon from '@static/svg/settings.svg'
import SwapArrows from '@static/svg/swap-arrows.svg'
import {
  DEFAULT_TOKEN_DECIMAL,
  NetworkType,
  REFRESHER_INTERVAL,
  WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN,
  WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_TEST,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import {
  addressToTicker,
  convertBalanceToBN,
  findPairs,
  handleSimulate,
  printBN,
  trimDecimalZeros,
  trimLeadingZeros
} from '@utils/utils'
import { Swap as SwapData } from '@store/reducers/swap'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import { blurContent, unblurContent } from '@utils/uiUtils'
import classNames from 'classnames'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ExchangeRate from './ExchangeRate/ExchangeRate'
import TransactionDetailsBox from './TransactionDetailsBox/TransactionDetailsBox'
import useStyles from './style'
import { TokenPriceData } from '@store/consts/types'
import TokensInfo from './TokensInfo/TokensInfo'
import { VariantType } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { DECIMAL, fromFee } from '@invariant-labs/sdk-eclipse/lib/utils'
import { PoolWithAddress } from '@store/reducers/pools'
import { PublicKey } from '@solana/web3.js'
import { Tick, Tickmap } from '@invariant-labs/sdk-eclipse/lib/market'

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

export interface ISwap {
  isFetchingNewPool: boolean
  onRefresh: (tokenFrom: number | null, tokenTo: number | null) => void
  walletStatus: Status
  swapData: SwapData
  tokens: SwapToken[]
  pools: PoolWithAddress[]
  tickmap: { [x: string]: Tickmap }
  onSwap: (
    slippage: BN,
    knownPrice: BN,
    tokenFrom: PublicKey,
    tokenTo: PublicKey,
    poolIndex: number,
    amountIn: BN,
    amountOut: BN,
    byAmountIn: boolean
  ) => void
  onSetPair: (tokenFrom: PublicKey | null, tokenTo: PublicKey | null) => void
  progress: ProgressState
  poolTicks: { [x: string]: Tick[] }
  isWaitingForNewPool: boolean
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
  onSlippageChange: (slippage: string) => void
  initialSlippage: string
  isBalanceLoading: boolean
  copyTokenAddressHandler: (message: string, variant: VariantType) => void
  network: NetworkType
  ethBalance: BN
  unwrapWETH: () => void
  wrappedETHAccountExist: boolean
  isTimeoutError: boolean
  deleteTimeoutError: () => void
  canNavigate: boolean
}

export const Swap: React.FC<ISwap> = ({
  isFetchingNewPool,
  onRefresh,
  walletStatus,
  tokens,
  pools,
  tickmap,
  onSwap,
  onSetPair,
  progress,
  poolTicks,
  isWaitingForNewPool,
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
  onSlippageChange,
  initialSlippage,
  isBalanceLoading,
  copyTokenAddressHandler,
  network,
  ethBalance,
  unwrapWETH,
  wrappedETHAccountExist,
  isTimeoutError,
  deleteTimeoutError,
  canNavigate
}) => {
  const { classes } = useStyles()
  enum inputTarget {
    DEFAULT = 'default',
    FROM = 'from',
    TO = 'to'
  }
  const [tokenFromIndex, setTokenFromIndex] = React.useState<number | null>(null)
  const [tokenToIndex, setTokenToIndex] = React.useState<number | null>(null)
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [lockAnimation, setLockAnimation] = React.useState<boolean>(false)
  const [amountFrom, setAmountFrom] = React.useState<string>('')
  const [amountTo, setAmountTo] = React.useState<string>('')
  const [swap, setSwap] = React.useState<boolean | null>(null)
  const [rotates, setRotates] = React.useState<number>(0)
  const [slippTolerance, setSlippTolerance] = React.useState<string>(initialSlippage)
  const [throttle, setThrottle] = React.useState<boolean>(false)
  const [settings, setSettings] = React.useState<boolean>(false)
  const [detailsOpen, setDetailsOpen] = React.useState<boolean>(false)
  const [inputRef, setInputRef] = React.useState<string>(inputTarget.DEFAULT)
  const [rateReversed, setRateReversed] = React.useState<boolean>(false)
  const [refresherTime, setRefresherTime] = React.useState<number>(REFRESHER_INTERVAL)
  const [hideUnknownTokens, setHideUnknownTokens] = React.useState<boolean>(
    initialHideUnknownTokensValue
  )
  const [simulateResult, setSimulateResult] = React.useState<{
    amountOut: BN
    poolIndex: number
    AmountOutWithFee: BN
    estimatedPriceAfterSwap: BN
    // minimumReceived: BN
    priceImpact: BN
    error: string[]
  }>({
    amountOut: new BN(0),
    poolIndex: 0,
    AmountOutWithFee: new BN(0),
    estimatedPriceAfterSwap: new BN(0),
    // minimumReceived: new BN(0),
    priceImpact: new BN(0),
    error: []
  })

  const WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT = useMemo(() => {
    if (network === NetworkType.Testnet) {
      return WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_TEST
    } else {
      return WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN
    }
  }, [network])

  const IS_ERROR_LABEL_SHOW =
    +printBN(simulateResult.priceImpact, DECIMAL - 2) > 25 ||
    tokens[tokenFromIndex ?? '']?.isUnknown ||
    tokens[tokenToIndex ?? '']?.isUnknown

  const timeoutRef = useRef<number>(0)

  const navigate = useNavigate()

  useEffect(() => {
    if (isTimeoutError) {
      onRefresh(tokenFromIndex, tokenToIndex)
      deleteTimeoutError()
    }
  }, [isTimeoutError])

  useEffect(() => {
    if (canNavigate) {
      navigate(
        `/exchange/${tokenFromIndex !== null ? addressToTicker(network, tokens[tokenFromIndex].assetAddress.toString()) : '-'}/${tokenToIndex !== null ? addressToTicker(network, tokens[tokenToIndex].assetAddress.toString()) : '-'}`,
        {
          replace: true
        }
      )
    }
  }, [tokenFromIndex, tokenToIndex])

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
  }, [tokenFromIndex, tokenToIndex, pools.length])

  useEffect(() => {
    if (inputRef === inputTarget.FROM && !(amountFrom === '' && amountTo === '')) {
      simulateWithTimeout()
    }
  }, [
    amountFrom,
    tokenToIndex,
    tokenFromIndex,
    slippTolerance,
    Object.keys(poolTicks).length,
    Object.keys(tickmap).length
  ])

  useEffect(() => {
    if (inputRef === inputTarget.TO && !(amountFrom === '' && amountTo === '')) {
      simulateWithTimeout()
    }
  }, [
    amountTo,
    tokenToIndex,
    tokenFromIndex,
    slippTolerance,
    Object.keys(poolTicks).length,
    Object.keys(tickmap).length
  ])

  useEffect(() => {
    if (progress === 'none' && !(amountFrom === '' && amountTo === '')) {
      simulateWithTimeout()
    }
  }, [progress])

  const simulateWithTimeout = () => {
    setThrottle(true)

    clearTimeout(timeoutRef.current)
    const timeout = setTimeout(() => {
      setSimulateAmount().finally(() => {
        setThrottle(false)
      })
    }, 500)
    timeoutRef.current = timeout as unknown as number
  }

  useEffect(() => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      if (inputRef === inputTarget.FROM) {
        const amount = getAmountOut(tokens[tokenToIndex])
        setAmountTo(+amount === 0 ? '' : trimLeadingZeros(amount))
      } else if (tokenFromIndex !== null) {
        const amount = getAmountOut(tokens[tokenFromIndex])
        setAmountFrom(+amount === 0 ? '' : trimLeadingZeros(amount))
      } else if (!tokens[tokenToIndex]) {
        setAmountTo('')
      } else if (!tokens[tokenFromIndex]) {
        setAmountFrom('')
      }
    }
  }, [simulateResult])

  useEffect(() => {
    updateEstimatedAmount()
  }, [tokenToIndex, tokenFromIndex, pools.length])

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
    setRateReversed(false)
  }, [tokenFromIndex, tokenToIndex])

  const getAmountOut = (assetFor: SwapToken) => {
    const amountOut: number = Number(printBN(simulateResult.amountOut, assetFor.decimals))

    return amountOut.toFixed(assetFor.decimals)
  }

  const setSimulateAmount = async () => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      const pair = findPairs(
        tokens[tokenFromIndex].assetAddress,
        tokens[tokenToIndex].assetAddress,
        pools
      )[0]
      if (typeof pair === 'undefined') {
        setAmountTo('')
        return
      }
      const indexPool = Object.keys(poolTicks).filter(key => {
        return key === pair.address.toString()
      })

      if (indexPool.length === 0) {
        setAmountTo('')
        return
      }

      if (inputRef === inputTarget.FROM) {
        setSimulateResult(
          await handleSimulate(
            pools,
            poolTicks,
            tickmap,
            fromFee(new BN(Number(+slippTolerance * 1000))),
            tokens[tokenFromIndex].assetAddress,
            tokens[tokenToIndex].assetAddress,
            convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals),
            true
          )
        )
      } else if (inputRef === inputTarget.TO) {
        setSimulateResult(
          await handleSimulate(
            pools,
            poolTicks,
            tickmap,
            fromFee(new BN(Number(+slippTolerance * 1000))),
            tokens[tokenFromIndex].assetAddress,
            tokens[tokenToIndex].assetAddress,
            convertBalanceToBN(amountTo, tokens[tokenToIndex].decimals),
            false
          )
        )
      }
    }
  }

  const getIsXToY = (fromToken: PublicKey, toToken: PublicKey) => {
    const swapPool = pools.find(
      pool =>
        (fromToken.equals(pool.tokenX) && toToken.equals(pool.tokenY)) ||
        (fromToken.equals(pool.tokenY) && toToken.equals(pool.tokenX))
    )
    return !!swapPool
  }

  const updateEstimatedAmount = () => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      const amount = getAmountOut(tokens[tokenToIndex])
      setAmountTo(+amount === 0 ? '' : trimLeadingZeros(amount))
    }
  }

  const isError = (error: string) => {
    return simulateResult.error.some(err => err === error)
  }

  const isEveryPoolEmpty = useMemo(() => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      const pairs = findPairs(
        tokens[tokenFromIndex].assetAddress,
        tokens[tokenToIndex].assetAddress,
        pools
      )

      let poolEmptyCount = 0
      for (const pair of pairs) {
        if (
          poolTicks[pair.address.toString()] === undefined ||
          (poolTicks[pair.address.toString()] && !poolTicks[pair.address.toString()].length)
        ) {
          poolEmptyCount++
        }
      }
      return poolEmptyCount === pairs.length
    }

    return true
  }, [tokenFromIndex, tokenToIndex, poolTicks])

  // const isInsufficientLiquidityError = useMemo(
  //   () =>
  //     simulateResult.poolKey === null &&
  //     (isError(SwapError.InsufficientLiquidity) || isError(SwapError.MaxSwapStepsReached)),
  //   [simulateResult]
  // )

  const getStateMessage = () => {
    if (
      (tokenFromIndex !== null && tokenToIndex !== null && throttle) ||
      isWaitingForNewPool ||
      isError("TypeError: Cannot read properties of undefined (reading 'bitmap')")
    ) {
      return 'Loading'
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

    if (!getIsXToY(tokens[tokenFromIndex].assetAddress, tokens[tokenToIndex].assetAddress)) {
      return "Pool doesn't exist."
    }

    if (
      isError('At the end of price range') ||
      isError('Price would cross swap limit') ||
      isError('Too large liquidity gap')
    ) {
      return 'Insufficient liquidity'
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
      return `Insufficient Wrapped ETH`
    }

    if (
      (convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals).eqn(0) ||
        isError('Amount out is zero')) &&
      !simulateResult.error.length
    ) {
      return 'Insufficient amount'
    }

    if (isError('Too large amount')) {
      return 'Not enough liquidity'
    }

    if (!isEveryPoolEmpty && amountTo === '') {
      return 'Amount out is zero'
    }

    if (isEveryPoolEmpty) {
      return 'RPC connection error'
    }

    return 'Exchange'
  }
  const hasShowRateMessage = () => {
    return (
      getStateMessage() === 'Insufficient balance' ||
      getStateMessage() === 'Exchange' ||
      getStateMessage() === 'Loading' ||
      getStateMessage() === 'Connect a wallet' ||
      getStateMessage() === 'Insufficient liquidity' ||
      getStateMessage() === 'Not enough liquidity' ||
      getStateMessage() === 'Insufficient Wrapped ETH'
    )
  }
  const setSlippage = (slippage: string): void => {
    setSlippTolerance(slippage)
    onSlippageChange(slippage)
  }

  const handleClickSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setSettings(true)
  }

  const handleCloseSettings = () => {
    unblurContent()
    setSettings(false)
  }

  const handleOpenTransactionDetails = () => {
    setDetailsOpen(!detailsOpen)
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

  const swapRate =
    tokenFromIndex === null || tokenToIndex === null || amountFrom === '' || amountTo === ''
      ? 0
      : +amountTo / +amountFrom

  const canShowDetails =
    tokenFromIndex !== null &&
    tokenToIndex !== null &&
    hasShowRateMessage() &&
    (getStateMessage() === 'Loading' ||
      (swapRate !== 0 && swapRate !== Infinity && !isNaN(swapRate))) &&
    amountFrom !== '' &&
    amountTo !== ''

  const [prevOpenState, setPrevOpenState] = useState(detailsOpen && canShowDetails)

  useEffect(() => {
    if (getStateMessage() !== 'Loading') {
      setPrevOpenState(detailsOpen && canShowDetails)
    }
  }, [detailsOpen, canShowDetails])

  const handleRefresh = async () => {
    onRefresh(tokenFromIndex, tokenToIndex)
    setRefresherTime(REFRESHER_INTERVAL)
  }

  useEffect(() => {
    void setSimulateAmount()
  }, [isFetchingNewPool])

  useEffect(() => {
    setRefresherTime(REFRESHER_INTERVAL)

    if (tokenFromIndex === tokenToIndex) {
      setAmountFrom('')
      setAmountTo('')
    }
  }, [tokenFromIndex, tokenToIndex])

  return (
    <Grid container className={classes.swapWrapper} alignItems='center'>
      {wrappedETHAccountExist && (
        <Box className={classes.unwrapContainer}>
          You have wrapped ETH.{' '}
          <u className={classes.unwrapNowButton} onClick={unwrapWETH}>
            Unwrap now.
          </u>
        </Box>
      )}
      <Grid container className={classes.header}>
        <Typography component='h1'>Exchange tokens</Typography>
        <Box className={classes.swapControls}>
          <Button className={classes.slippageButton} onClick={e => handleClickSettings(e)}>
            <p>
              Slippage: <span className={classes.slippageAmount}>{slippTolerance}%</span>
            </p>
          </Button>
          <TooltipHover text='Refresh'>
            <Grid display='flex' alignItems='center'>
              <Button
                onClick={handleRefresh}
                className={classes.refreshIconBtn}
                disabled={
                  priceFromLoading ||
                  priceToLoading ||
                  isBalanceLoading ||
                  getStateMessage() === 'Loading' ||
                  tokenFromIndex === null ||
                  tokenToIndex === null ||
                  tokenFromIndex === tokenToIndex
                }>
                <img src={refreshIcon} className={classes.refreshIcon} alt='Refresh' />
              </Button>
            </Grid>
          </TooltipHover>
          <TooltipHover text='Settings'>
            <Button onClick={handleClickSettings} className={classes.settingsIconBtn}>
              <img src={settingIcon} className={classes.settingsIcon} alt='Settings' />
            </Button>
          </TooltipHover>
        </Box>
        <Grid className={classes.slippage}>
          <Slippage
            open={settings}
            setSlippage={setSlippage}
            handleClose={handleCloseSettings}
            anchorEl={anchorEl}
            initialSlippage={initialSlippage}
          />
        </Grid>
      </Grid>
      <Grid container className={classes.root} direction='column'>
        <Typography className={classes.swapLabel}>Pay</Typography>
        <Box
          className={classNames(
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
              }
            }}
            placeholder={`0.${'0'.repeat(6)}`}
            onMaxClick={() => {
              if (tokenFromIndex !== null) {
                setInputRef(inputTarget.FROM)

                if (
                  tokens[tokenFromIndex].assetAddress.equals(new PublicKey(WRAPPED_ETH_ADDRESS))
                ) {
                  setAmountFrom(
                    trimDecimalZeros(
                      printBN(
                        tokens[tokenFromIndex].balance.gt(WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT)
                          ? tokens[tokenFromIndex].balance.sub(WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT)
                          : new BN(0),
                        tokens[tokenFromIndex].decimals
                      )
                    )
                  )

                  return
                }

                setAmountFrom(
                  printBN(tokens[tokenFromIndex].balance, tokens[tokenFromIndex].decimals)
                )
              }
            }}
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
            showBlur={
              lockAnimation ||
              (getStateMessage() === 'Loading' &&
                (inputRef === inputTarget.TO || inputRef === inputTarget.DEFAULT))
            }
            hiddenUnknownTokens={hideUnknownTokens}
            network={network}
          />
        </Box>

        <Box className={classes.tokenComponentTextContainer}>
          <Box
            className={classes.swapArrowBox}
            onClick={() => {
              if (lockAnimation) return
              setLockAnimation(!lockAnimation)
              setRotates(rotates + 1)
              swap !== null ? setSwap(!swap) : setSwap(true)
              setTimeout(() => {
                const tmpAmount = amountTo

                const tmp = tokenFromIndex
                setTokenFromIndex(tokenToIndex)
                setTokenToIndex(tmp)

                setInputRef(inputTarget.FROM)
                setAmountFrom(tmpAmount)
              }, 50)
            }}>
            <Box className={classes.swapImgRoot}>
              <img
                src={SwapArrows}
                style={{
                  transform: `rotate(${-rotates * 180}deg)`
                }}
                className={classes.swapArrows}
                alt='Invert tokens'
              />
            </Box>
          </Box>
        </Box>
        <Typography className={classes.swapLabel} mt={1.5}>
          Receive
        </Typography>
        <Box
          className={classNames(
            classes.exchangeRoot,
            classes.transactionBottom,
            lockAnimation ? classes.amountInputUp : undefined
          )}>
          <ExchangeAmountInput
            value={amountTo}
            balance={
              tokenToIndex !== null
                ? printBN(tokens[tokenToIndex].balance, tokens[tokenToIndex].decimals)
                : '- -'
            }
            className={classes.amountInput}
            decimal={tokenToIndex !== null ? tokens[tokenToIndex].decimals : DEFAULT_TOKEN_DECIMAL}
            setValue={value => {
              if (value.match(/^\d*\.?\d*$/)) {
                setAmountTo(value)
                setInputRef(inputTarget.TO)
              }
            }}
            placeholder={`0.${'0'.repeat(6)}`}
            onMaxClick={() => {}}
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
            priceLoading={priceToLoading}
            isBalanceLoading={isBalanceLoading}
            showMaxButton={false}
            showBlur={
              lockAnimation ||
              (getStateMessage() === 'Loading' &&
                (inputRef === inputTarget.FROM || inputRef === inputTarget.DEFAULT))
            }
            hiddenUnknownTokens={hideUnknownTokens}
            network={network}
          />
        </Box>
        <Box
          className={classes.unknownWarningContainer}
          style={{ height: IS_ERROR_LABEL_SHOW ? '34px' : '0px' }}>
          {+printBN(simulateResult.priceImpact, DECIMAL - 2) > 25 && (
            <TooltipHover text='Your trade size might be too large'>
              <Box className={classes.unknownWarning}>
                {(+printBN(simulateResult.priceImpact, DECIMAL - 2)).toFixed(2)}% Price impact
              </Box>
            </TooltipHover>
          )}
          {tokens[tokenFromIndex ?? '']?.isUnknown && (
            <TooltipHover
              text={`${tokens[tokenFromIndex ?? ''].symbol} is unknown, make sure address is correct before trading`}>
              <Box className={classes.unknownWarning}>
                {tokens[tokenFromIndex ?? ''].symbol} is not verified
              </Box>
            </TooltipHover>
          )}
          {tokens[tokenToIndex ?? '']?.isUnknown && (
            <TooltipHover
              text={`${tokens[tokenToIndex ?? ''].symbol} is unknown, make sure address is correct before trading`}>
              <Box className={classes.unknownWarning}>
                {tokens[tokenToIndex ?? ''].symbol} is not verified
              </Box>
            </TooltipHover>
          )}
        </Box>
        <Box className={classes.transactionDetails}>
          <Box className={classes.transactionDetailsInner}>
            <button
              onClick={
                tokenFromIndex !== null &&
                tokenToIndex !== null &&
                hasShowRateMessage() &&
                amountFrom !== '' &&
                amountTo !== ''
                  ? handleOpenTransactionDetails
                  : undefined
              }
              className={classNames(
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
            {tokenFromIndex !== null &&
              tokenToIndex !== null &&
              tokenFromIndex !== tokenToIndex && (
                <TooltipHover text='Refresh'>
                  <Grid
                    container
                    alignItems='center'
                    justifyContent='center'
                    width={20}
                    height={34}
                    minWidth='fit-content'
                    ml={1}>
                    <Refresher
                      currentIndex={refresherTime}
                      maxIndex={REFRESHER_INTERVAL}
                      onClick={handleRefresh}
                    />
                  </Grid>
                </TooltipHover>
              )}
          </Box>
          {canShowDetails ? (
            <Box className={classes.exchangeRateWrapper}>
              <ExchangeRate
                onClick={() => setRateReversed(!rateReversed)}
                tokenFromSymbol={tokens[rateReversed ? tokenToIndex : tokenFromIndex].symbol}
                tokenToSymbol={tokens[rateReversed ? tokenFromIndex : tokenToIndex].symbol}
                amount={rateReversed ? 1 / swapRate : swapRate}
                tokenToDecimals={tokens[rateReversed ? tokenFromIndex : tokenToIndex].decimals}
                loading={getStateMessage() === 'Loading'}
              />
            </Box>
          ) : null}
        </Box>
        <TransactionDetailsBox
          open={getStateMessage() !== 'Loading' ? detailsOpen && canShowDetails : prevOpenState}
          fee={canShowDetails ? pools[simulateResult.poolIndex].fee : new BN(0)}
          exchangeRate={{
            val: rateReversed ? 1 / swapRate : swapRate,
            symbol: canShowDetails
              ? tokens[rateReversed ? tokenFromIndex : tokenToIndex].symbol
              : '',
            decimal: canShowDetails
              ? tokens[rateReversed ? tokenFromIndex : tokenToIndex].decimals
              : 0
          }}
          priceImpact={simulateResult.priceImpact}
          slippage={+slippTolerance}
          isLoadingRate={getStateMessage() === 'Loading'}
        />
        <TokensInfo
          tokenFrom={tokenFromIndex !== null ? tokens[tokenFromIndex] : null}
          tokenTo={tokenToIndex !== null ? tokens[tokenToIndex] : null}
          tokenToPrice={tokenToPriceData?.price}
          tokenFromPrice={tokenFromPriceData?.price}
          copyTokenAddressHandler={copyTokenAddressHandler}
          network={network}
        />
        {walletStatus !== Status.Initialized && getStateMessage() !== 'Loading' ? (
          <ChangeWalletButton
            name='Connect wallet'
            onConnect={onConnectWallet}
            connected={false}
            onDisconnect={onDisconnectWallet}
            className={classes.connectWalletButton}
          />
        ) : getStateMessage() === 'Insufficient Wrapped ETH' ? (
          <TooltipHover
            text='More ETH is required to cover the transaction fee. Obtain more ETH to complete this transaction.'
            top={-45}>
            <div>
              <AnimatedButton
                content={getStateMessage()}
                className={
                  getStateMessage() === 'Connect a wallet'
                    ? `${classes.swapButton}`
                    : getStateMessage() === 'Exchange' && progress === 'none'
                      ? `${classes.swapButton} ${classes.ButtonSwapActive}`
                      : classes.swapButton
                }
                disabled={getStateMessage() !== 'Exchange' || progress !== 'none'}
                onClick={() => {
                  if (tokenFromIndex === null || tokenToIndex === null) return

                  onSwap(
                    fromFee(new BN(Number(+slippTolerance * 1000))),
                    simulateResult.estimatedPriceAfterSwap,
                    tokens[tokenFromIndex].assetAddress,
                    tokens[tokenToIndex].assetAddress,
                    simulateResult.poolIndex,
                    convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals),
                    convertBalanceToBN(amountTo, tokens[tokenToIndex].decimals),
                    inputRef === inputTarget.FROM
                  )
                }}
                progress={progress}
              />
            </div>
          </TooltipHover>
        ) : (
          <AnimatedButton
            content={getStateMessage()}
            className={
              getStateMessage() === 'Connect a wallet'
                ? `${classes.swapButton}`
                : getStateMessage() === 'Exchange' && progress === 'none'
                  ? `${classes.swapButton} ${classes.ButtonSwapActive}`
                  : classes.swapButton
            }
            disabled={getStateMessage() !== 'Exchange' || progress !== 'none'}
            onClick={() => {
              if (tokenFromIndex === null || tokenToIndex === null) return

              onSwap(
                fromFee(new BN(Number(+slippTolerance * 1000))),
                simulateResult.estimatedPriceAfterSwap,
                tokens[tokenFromIndex].assetAddress,
                tokens[tokenToIndex].assetAddress,
                simulateResult.poolIndex,
                convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals),
                convertBalanceToBN(amountTo, tokens[tokenToIndex].decimals),
                inputRef === inputTarget.FROM
              )
            }}
            progress={progress}
          />
        )}
      </Grid>
    </Grid>
  )
}

export default Swap
