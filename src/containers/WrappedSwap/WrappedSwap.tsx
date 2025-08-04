import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { Swap } from '@components/Swap/Swap'
import {
  commonTokensForNetworks,
  DEFAULT_SWAP_SLIPPAGE,
  Intervals,
  NetworkType,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import { actions as poolsActions } from '@store/reducers/pools'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import { actions } from '@store/reducers/swap'
import {
  isLoadingLatestPoolsForTransaction,
  poolsArraySortedByFees,
  tickMaps,
  nearestPoolTicksForPair
} from '@store/selectors/pools'
import { accounts as solanaAccounts, SwapToken } from '@store/selectors/solanaWallet'
import { swap as swapPool, accounts, isLoading } from '@store/selectors/swap'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TokenPriceData } from '@store/consts/types'
import { VariantType } from 'notistack'
import { BN } from '@coral-xyz/anchor'
import { feeds, pointsPerUsd, swapPairs, swapMultiplier } from '@store/selectors/leaderboard'
import { Market } from '@invariant-labs/sdk-eclipse'
import { actions as swapActions } from '@store/reducers/swap'
import { actions as statsActions } from '@store/reducers/stats'

type Props = {
  walletStatus: Status
  tokensList: SwapToken[]
  tokensDict: Record<string, SwapToken>
  networkType: NetworkType
  tokensFromState: {
    tokenFrom: PublicKey | null
    setTokenFrom: React.Dispatch<React.SetStateAction<PublicKey | null>>
    tokenTo: PublicKey | null
    setTokenTo: React.Dispatch<React.SetStateAction<PublicKey | null>>
  }
  isBalanceLoading: boolean
  progressState: {
    progress: ProgressState
    setProgress: React.Dispatch<React.SetStateAction<ProgressState>>
  }
  ethBalance: BN
  market: Market
  triggerFetchPrices: () => void
  initialHideUnknownTokensValue: boolean
  setHideUnknownTokensValue: (val: boolean) => void
  copyTokenAddressHandler: (message: string, variant: VariantType) => void
  tokenToPriceData?: TokenPriceData
  tokenFromPriceData?: TokenPriceData
  priceFromLoading: boolean
  priceToLoading: boolean
  addTokenHandler: (address: string) => void
  canNavigate: boolean
  initialTokenFromIndex: number | null
  initialTokenToIndex: number | null
  deleteTimeoutError: () => void
  isTimeoutError: boolean
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
}

export const WrappedSwap = ({
  addTokenHandler,
  canNavigate,
  copyTokenAddressHandler,
  ethBalance,
  initialHideUnknownTokensValue,
  initialTokenFromIndex,
  initialTokenToIndex,
  isBalanceLoading,
  market,
  networkType,
  priceFromLoading,
  priceToLoading,
  progressState,
  setHideUnknownTokensValue,
  tokensFromState,
  tokensDict,
  tokensList,
  triggerFetchPrices,
  walletStatus,
  tokenFromPriceData,
  tokenToPriceData,
  deleteTimeoutError,
  isTimeoutError,
  tokensState,
  rateState,
  inputState,
  lockAnimationState,
  rotatesState,
  swapState
}: Props) => {
  const dispatch = useDispatch()

  const tickmap = useSelector(tickMaps)
  const poolTicksForSimulation = useSelector(nearestPoolTicksForPair)
  const allPools = useSelector(poolsArraySortedByFees)
  const multiplyer = useSelector(swapMultiplier)
  const { success, inProgress } = useSelector(swapPool)
  const isFetchingNewPool = useSelector(isLoadingLatestPoolsForTransaction)
  const pointsPerUsdFee = useSelector(pointsPerUsd)
  const promotedSwapPairs = useSelector(swapPairs)
  const priceFeeds = useSelector(feeds)

  const { progress, setProgress } = progressState
  const { setTokenFrom, setTokenTo, tokenFrom, tokenTo } = tokensFromState

  useEffect(() => {
    dispatch(leaderboardActions.getLeaderboardConfig())
    dispatch(statsActions.getCurrentIntervalStats({ interval: Intervals.Daily }))
  }, [])

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

  const initialSlippage = localStorage.getItem('INVARIANT_SWAP_SLIPPAGE') ?? DEFAULT_SWAP_SLIPPAGE

  const onSlippageChange = (slippage: string) => {
    localStorage.setItem('INVARIANT_SWAP_SLIPPAGE', slippage)
  }

  const onRefresh = (tokenFromIndex: number | null, tokenToIndex: number | null) => {
    dispatch(walletActions.getBalance())

    if (tokenFromIndex === null || tokenToIndex == null) {
      return
    }

    triggerFetchPrices()

    dispatch(
      poolsActions.getAllPoolsForPairData({
        first: tokensList[tokenFromIndex].assetAddress,
        second: tokensList[tokenToIndex].assetAddress
      })
    )

    dispatch(
      swapActions.getTwoHopSwapData({
        tokenFrom: tokensList[tokenFromIndex].assetAddress,
        tokenTo: tokensList[tokenToIndex].assetAddress
      })
    )

    dispatch(
      poolsActions.getNearestTicksForPair({
        tokenFrom: tokensList[tokenFromIndex].assetAddress,
        tokenTo: tokensList[tokenToIndex].assetAddress,
        allPools
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
      deleteTimeoutError={deleteTimeoutError}
      canNavigate={canNavigate}
      pointsPerUsdFee={pointsPerUsdFee}
      feeds={priceFeeds}
      promotedSwapPairs={promotedSwapPairs}
      swapMultiplier={multiplyer}
      market={market}
      tokensDict={tokensDict}
      swapAccounts={swapAccounts}
      swapIsLoading={swapIsLoading}
      rateState={rateState}
      tokensState={tokensState}
      inputState={inputState}
      lockAnimationState={lockAnimationState}
      rotatesState={rotatesState}
      swapState={swapState}
    />
  )
}

export default WrappedSwap
