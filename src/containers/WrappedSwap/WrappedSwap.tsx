import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { Swap } from '@components/Swap/Swap'
import {
  commonTokensForNetworks,
  DEFAULT_SWAP_SLIPPAGE,
  WETH_MAIN,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import { actions as poolsActions } from '@store/reducers/pools'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions as walletActions } from '@store/reducers/solanaWallet'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { actions } from '@store/reducers/swap'
import {
  isLoadingLatestPoolsForTransaction,
  poolsArraySortedByFees,
  tickMaps,
  nearestPoolTicksForPair,
  isLoadingPathTokens
} from '@store/selectors/pools'
import { network, rpcAddress, timeoutError } from '@store/selectors/solanaConnection'
import {
  status,
  swapTokens,
  swapTokensDict,
  balanceLoading,
  balance,
  accounts as solanaAccounts
} from '@store/selectors/solanaWallet'
import { swap as swapPool, accounts, isLoading } from '@store/selectors/swap'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addNewTokenToLocalStorage,
  getTokenPrice,
  getMockedTokenPrice,
  getNewTokenOrThrow,
  tickerToAddress
} from '@utils/utils'

import { TokenPriceData } from '@store/consts/types'
import { getCurrentSolanaConnection } from '@utils/web3/connection'
import { VariantType } from 'notistack'
import { BN } from '@coral-xyz/anchor'
import { useLocation } from 'react-router-dom'
import { getMarketProgramSync } from '@utils/web3/programs/amm'
import { getEclipseWallet } from '@utils/web3/wallet'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import { actions as swapActions } from '@store/reducers/swap'

type Props = {
  initialTokenFrom: string
  initialTokenTo: string
}

export const WrappedSwap = ({ initialTokenFrom, initialTokenTo }: Props) => {
  const dispatch = useDispatch()

  const connection = getCurrentSolanaConnection()

  const walletStatus = useSelector(status)
  const swap = useSelector(swapPool)
  const tickmap = useSelector(tickMaps)
  const poolTicksForSimulation = useSelector(nearestPoolTicksForPair)
  const allPools = useSelector(poolsArraySortedByFees)
  const tokensList = useSelector(swapTokens)
  const tokensDict = useSelector(swapTokensDict)
  const isBalanceLoading = useSelector(balanceLoading)
  const { success, inProgress } = useSelector(swapPool)
  const isFetchingNewPool = useSelector(isLoadingLatestPoolsForTransaction)
  const networkType = useSelector(network)
  const [progress, setProgress] = useState<ProgressState>('none')
  const [tokenFrom, setTokenFrom] = useState<PublicKey | null>(null)
  const [tokenTo, setTokenTo] = useState<PublicKey | null>(null)
  const ethBalance = useSelector(balance)
  const isTimeoutError = useSelector(timeoutError)
  const isPathTokensLoading = useSelector(isLoadingPathTokens)
  const { state } = useLocation()
  const [block, setBlock] = useState(state?.referer === 'stats')
  const rpc = useSelector(rpcAddress)
  const wallet = getEclipseWallet()
  const market = getMarketProgramSync(networkType, rpc, wallet as IWallet)

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

  useEffect(() => {
    if (tokenFrom !== null && tokenTo !== null && !isFetchingNewPool) {
      dispatch(
        actions.setPair({
          tokenFrom,
          tokenTo
        })
      )
    }
  }, [isFetchingNewPool])

  const lastTokenFrom =
    initialTokenFrom && tickerToAddress(networkType, initialTokenFrom)
      ? tickerToAddress(networkType, initialTokenFrom)
      : localStorage.getItem(`INVARIANT_LAST_TOKEN_FROM_${networkType}`) ??
        WETH_MAIN.address.toString()

  const lastTokenTo =
    initialTokenTo && tickerToAddress(networkType, initialTokenTo)
      ? tickerToAddress(networkType, initialTokenTo)
      : localStorage.getItem(`INVARIANT_LAST_TOKEN_TO_${networkType}`)

  const initialTokenFromIndex =
    lastTokenFrom === null
      ? null
      : Object.values(tokensList).findIndex(token => {
          try {
            return token.assetAddress.equals(new PublicKey(lastTokenFrom))
          } catch {
            return false
          }
        })
  const initialTokenToIndex =
    lastTokenTo === null
      ? null
      : Object.values(tokensList).findIndex(token => {
          try {
            return token.assetAddress.equals(new PublicKey(lastTokenTo))
          } catch {
            return false
          }
        })

  useEffect(() => {
    const tokens: string[] = []

    if (initialTokenFromIndex === -1 && lastTokenFrom && !tokensDict[lastTokenFrom]) {
      tokens.push(lastTokenFrom)
    }

    if (initialTokenToIndex === -1 && lastTokenTo && !tokensDict[lastTokenTo]) {
      tokens.push(lastTokenTo)
    }

    if (tokens.length) {
      dispatch(poolsActions.getPathTokens(tokens))
    }

    setBlock(false)
  }, [tokensList])

  const canNavigate = connection !== null && !isPathTokensLoading && !block

  const addTokenHandler = (address: string) => {
    if (
      connection !== null &&
      tokensList.findIndex(token => token.address.toString() === address) === -1
    ) {
      getNewTokenOrThrow(address, connection)
        .then(data => {
          dispatch(poolsActions.addTokens(data))
          addNewTokenToLocalStorage(address, networkType)
          dispatch(
            snackbarsActions.add({
              message: 'Token added',
              variant: 'success',
              persist: false
            })
          )
        })
        .catch(() => {
          dispatch(
            snackbarsActions.add({
              message: 'Token add failed',
              variant: 'error',
              persist: false
            })
          )
        })
    } else {
      dispatch(
        snackbarsActions.add({
          message: 'Token already in list',
          variant: 'info',
          persist: false
        })
      )
    }
  }

  const initialHideUnknownTokensValue =
    localStorage.getItem('HIDE_UNKNOWN_TOKENS') === 'true' ||
    localStorage.getItem('HIDE_UNKNOWN_TOKENS') === null

  const setHideUnknownTokensValue = (val: boolean) => {
    localStorage.setItem('HIDE_UNKNOWN_TOKENS', val ? 'true' : 'false')
  }

  const [triggerFetchPrice, setTriggerFetchPrice] = useState(false)

  const [tokenFromPriceData, setTokenFromPriceData] = useState<TokenPriceData | undefined>(
    undefined
  )

  const [priceFromLoading, setPriceFromLoading] = useState(false)

  useEffect(() => {
    if (tokenFrom === null) {
      return
    }

    const addr = tokensDict[tokenFrom.toString()]?.assetAddress.toString()

    if (addr) {
      setPriceFromLoading(true)
      getTokenPrice(networkType, addr)
        .then(data => setTokenFromPriceData({ price: data ?? 0 }))
        .catch(() =>
          setTokenFromPriceData(
            getMockedTokenPrice(tokensDict[tokenFrom.toString()].symbol, networkType)
          )
        )
        .finally(() => setPriceFromLoading(false))
    } else {
      setTokenFromPriceData(undefined)
    }
  }, [tokenFrom, triggerFetchPrice])

  const [tokenToPriceData, setTokenToPriceData] = useState<TokenPriceData | undefined>(undefined)
  const [priceToLoading, setPriceToLoading] = useState(false)

  useEffect(() => {
    if (tokenTo === null) {
      return
    }

    const addr = tokensDict[tokenTo.toString()]?.assetAddress.toString()
    if (addr) {
      setPriceToLoading(true)
      getTokenPrice(networkType, addr)
        .then(data => setTokenToPriceData({ price: data ?? 0 }))
        .catch(() =>
          setTokenToPriceData(
            getMockedTokenPrice(tokensDict[tokenTo.toString()].symbol, networkType)
          )
        )
        .finally(() => setPriceToLoading(false))
    } else {
      setTokenToPriceData(undefined)
    }
  }, [tokenTo, triggerFetchPrice])

  const initialSlippage = localStorage.getItem('INVARIANT_SWAP_SLIPPAGE') ?? DEFAULT_SWAP_SLIPPAGE

  const onSlippageChange = (slippage: string) => {
    localStorage.setItem('INVARIANT_SWAP_SLIPPAGE', slippage)
  }

  const onRefresh = (tokenFromIndex: number | null, tokenToIndex: number | null) => {
    dispatch(walletActions.getBalance())

    if (tokenFromIndex === null || tokenToIndex == null) {
      return
    }

    setTriggerFetchPrice(!triggerFetchPrice)

    dispatch(
      poolsActions.getAllPoolsForPairData({
        first: tokensList[tokenFromIndex].address,
        second: tokensList[tokenToIndex].address
      })
    )

    dispatch(
      swapActions.getTwoHopSwapData({
        tokenFrom: tokensList[tokenFromIndex].address,
        tokenTo: tokensList[tokenToIndex].address
      })
    )

    dispatch(
      poolsActions.getNearestTicksForPair({
        tokenFrom: tokensList[tokenFromIndex].address,
        tokenTo: tokensList[tokenToIndex].address,
        allPools
      })
    )
  }

  const copyTokenAddressHandler = (message: string, variant: VariantType) => {
    dispatch(
      snackbarsActions.add({
        message,
        variant,
        persist: false
      })
    )
  }

  const allAccounts = useSelector(solanaAccounts)

  const [wrappedETHAccountExist, wrappedETHBalance] = useMemo(() => {
    let wrappedETHAccountExist = false
    let wrappedETHBalance

    Object.entries(allAccounts).map(([address, token]) => {
      if (address === WRAPPED_ETH_ADDRESS && token.balance.gt(new BN(0))) {
        wrappedETHAccountExist = true
        wrappedETHBalance = token.balance
      }
    })

    return [wrappedETHAccountExist, wrappedETHBalance]
  }, [allAccounts])

  const unwrapWETH = () => {
    dispatch(walletActions.unwrapWETH())
  }

  useEffect(() => {
    if (tokenFrom && tokenTo) {
      dispatch(
        swapActions.getTwoHopSwapData({
          tokenFrom,
          tokenTo
        })
      )
    }
  }, [tokenFrom, tokenTo])

  const swapAccounts = useSelector(accounts)
  const swapIsLoading = useSelector(isLoading)

  return (
    <Swap
      isFetchingNewPool={isFetchingNewPool}
      onRefresh={onRefresh}
      onSwap={(
        slippage,
        estimatedPriceAfterSwap,
        tokenFrom,
        tokenBetween,
        tokenTo,
        firstPair,
        secondPair,
        amountIn,
        amountOut,
        byAmountIn
      ) => {
        setProgress('progress')
        dispatch(
          actions.swap({
            slippage,
            estimatedPriceAfterSwap,
            firstPair,
            secondPair,
            tokenFrom,
            tokenBetween,
            tokenTo,
            amountIn,
            amountOut,
            byAmountIn
          })
        )
      }}
      onSetPair={(tokenFrom, tokenTo) => {
        setTokenFrom(tokenFrom)
        setTokenTo(tokenTo)

        if (tokenFrom !== null) {
          localStorage.setItem(`INVARIANT_LAST_TOKEN_FROM_${networkType}`, tokenFrom.toString())
        }

        if (tokenTo !== null) {
          localStorage.setItem(`INVARIANT_LAST_TOKEN_TO_${networkType}`, tokenTo.toString())
        }
        if (tokenFrom !== null && tokenTo !== null && !tokenFrom.equals(tokenTo)) {
          dispatch(
            poolsActions.getAllPoolsForPairData({
              first: tokenFrom,
              second: tokenTo
            })
          )
        }
      }}
      onConnectWallet={() => {
        dispatch(walletActions.connect(false))
      }}
      onDisconnectWallet={() => {
        dispatch(walletActions.disconnect())
      }}
      walletStatus={walletStatus}
      tokens={tokensList}
      pools={allPools}
      swapData={swap}
      progress={progress}
      poolTicks={poolTicksForSimulation}
      isWaitingForNewPool={isFetchingNewPool}
      tickmap={tickmap}
      initialTokenFromIndex={initialTokenFromIndex === -1 ? null : initialTokenFromIndex}
      initialTokenToIndex={initialTokenToIndex === -1 ? null : initialTokenToIndex}
      handleAddToken={addTokenHandler}
      commonTokens={commonTokensForNetworks[networkType]}
      initialHideUnknownTokensValue={initialHideUnknownTokensValue}
      onHideUnknownTokensChange={setHideUnknownTokensValue}
      tokenFromPriceData={tokenFromPriceData}
      tokenToPriceData={tokenToPriceData}
      priceFromLoading={priceFromLoading || isBalanceLoading}
      priceToLoading={priceToLoading || isBalanceLoading}
      onSlippageChange={onSlippageChange}
      initialSlippage={initialSlippage}
      isBalanceLoading={isBalanceLoading}
      copyTokenAddressHandler={copyTokenAddressHandler}
      ethBalance={ethBalance}
      network={networkType}
      unwrapWETH={unwrapWETH}
      wrappedETHAccountExist={wrappedETHAccountExist}
      wrappedETHBalance={wrappedETHBalance}
      isTimeoutError={isTimeoutError}
      deleteTimeoutError={() => {
        dispatch(connectionActions.setTimeoutError(false))
      }}
      canNavigate={canNavigate}
      market={market}
      tokensDict={tokensDict}
      swapAccounts={swapAccounts}
      swapIsLoading={swapIsLoading}
    />
  )
}

export default WrappedSwap
