import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { commonTokensForNetworks, NetworkType } from '@store/consts/static'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import { SwapToken } from '@store/selectors/solanaWallet'
import { PublicKey } from '@solana/web3.js'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { TokenPriceData } from '@store/consts/types'
import { VariantType } from 'notistack'
import { BN } from '@coral-xyz/anchor'
import LimitOrder from '@components/Swap/LimitOrder'
import { Market } from '@invariant-labs/sdk-eclipse'

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
export const WrappedLimitOrder = ({
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
  rateState,
  tokensState,
  inputState,
  lockAnimationState,
  rotatesState,
  swapState
}: Props) => {
  const dispatch = useDispatch()

  const { setTokenFrom, setTokenTo } = tokensFromState

  const {} = tokensState
  useEffect(() => {
    dispatch(leaderboardActions.getLeaderboardConfig())
  }, [])

  const onRefresh = (tokenFromIndex: number | null, tokenToIndex: number | null) => {
    dispatch(walletActions.getBalance())

    if (tokenFromIndex === null || tokenToIndex == null) {
      return
    }

    triggerFetchPrices()
  }

  return (
    <>
      <LimitOrder
        canNavigate={canNavigate}
        commonTokens={commonTokensForNetworks[networkType]}
        copyTokenAddressHandler={copyTokenAddressHandler}
        deleteTimeoutError={deleteTimeoutError}
        ethBalance={ethBalance}
        handleAddToken={addTokenHandler}
        initialHideUnknownTokensValue={initialHideUnknownTokensValue}
        onSetPair={(tokenFrom, tokenTo) => {
          setTokenFrom(tokenFrom)
          setTokenTo(tokenTo)

          if (tokenFrom !== null) {
            localStorage.setItem(`INVARIANT_LAST_TOKEN_FROM_${networkType}`, tokenFrom.toString())
          }

          if (tokenTo !== null) {
            localStorage.setItem(`INVARIANT_LAST_TOKEN_TO_${networkType}`, tokenTo.toString())
          }
        }}
        initialTokenFromIndex={initialTokenFromIndex === -1 ? null : initialTokenFromIndex}
        initialTokenToIndex={initialTokenToIndex === -1 ? null : initialTokenToIndex}
        tokens={tokensList}
        onHideUnknownTokensChange={setHideUnknownTokensValue}
        tokenFromPriceData={tokenFromPriceData}
        tokenToPriceData={tokenToPriceData}
        priceFromLoading={priceFromLoading || isBalanceLoading}
        priceToLoading={priceToLoading || isBalanceLoading}
        isBalanceLoading={isBalanceLoading}
        network={networkType}
        isTimeoutError={isTimeoutError}
        market={market}
        tokensDict={tokensDict}
        onConnectWallet={() => {
          dispatch(walletActions.connect(false))
        }}
        onDisconnectWallet={() => {
          dispatch(walletActions.disconnect())
        }}
        onRefresh={onRefresh}
        progress={progressState.progress}
        walletStatus={walletStatus}
        rateState={rateState}
        tokensState={tokensState}
        inputState={inputState}
        lockAnimationState={lockAnimationState}
        rotatesState={rotatesState}
        swapState={swapState}
      />
    </>
  )
}

export default WrappedLimitOrder
