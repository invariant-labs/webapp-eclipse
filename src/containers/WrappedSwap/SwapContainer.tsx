import WrappedSwap from '@containers/WrappedSwap/WrappedSwap'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { swapMode } from '@store/selectors/navigation'
import { getCurrentSolanaConnection } from '@utils/web3/connection'
import {
  balance,
  balanceLoading,
  status,
  swapTokens,
  swapTokensDict
} from '@store/selectors/solanaWallet'
import { isLoadingPathTokens, poolsArraySortedByFees } from '@store/selectors/pools'
import { network, rpcAddress, timeoutError } from '@store/selectors/solanaConnection'
import { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { getEclipseWallet } from '@utils/web3/wallet'
import { getMarketProgramSync } from '@utils/web3/programs/amm'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import {
  addNewTokenToLocalStorage,
  getMockedTokenPrice,
  getNewTokenOrThrow,
  getTokenPrice,
  initialXtoY,
  tickerToAddress
} from '@utils/utils'
import { inputTarget, WETH_MAIN } from '@store/consts/static'
import { actions as poolsActions } from '@store/reducers/pools'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { TokenPriceData } from '@store/consts/types'
import { VariantType } from 'notistack'
import WrappedLimitOrder from './WrappedLimitOrder'
import { SwapMode, actions as navigationActions } from '@store/reducers/navigation'
import Switcher from '@common/Switcher/Switcher'
import { auditIcon } from '@static/icons'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { Box, Grid, useMediaQuery } from '@mui/material'
import { theme } from '@static/theme'

type Props = {
  initialTokenFrom: string
  initialTokenTo: string
}

export const SwapContainer = ({ initialTokenFrom, initialTokenTo }: Props) => {
  const { state } = useLocation()
  const dispatch = useDispatch()

  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  const swapModeType = useSelector(swapMode)
  const connection = getCurrentSolanaConnection()
  const walletStatus = useSelector(status)
  const tokensList = useSelector(swapTokens)
  const tokensDict = useSelector(swapTokensDict)
  const isBalanceLoading = useSelector(balanceLoading)
  const networkType = useSelector(network)
  const rpc = useSelector(rpcAddress)
  const ethBalance = useSelector(balance)
  const isPathTokensLoading = useSelector(isLoadingPathTokens)
  const isTimeoutError = useSelector(timeoutError)
  const allPools = useSelector(poolsArraySortedByFees)

  const wallet = getEclipseWallet()
  const market = getMarketProgramSync(networkType, rpc, wallet as IWallet)

  const [block, setBlock] = useState(state?.referer === 'stats')
  const [progress, setProgress] = useState<ProgressState>('none')
  const [tokenFrom, setTokenFrom] = useState<PublicKey | null>(null)
  const [tokenTo, setTokenTo] = useState<PublicKey | null>(null)
  const [inputRef, setInputRef] = useState<string>(inputTarget.DEFAULT)
  const [tokenFromIndex, setTokenFromIndex] = useState<number | null>(null)
  const [tokenToIndex, setTokenToIndex] = useState<number | null>(null)
  const [rateReversed, setRateReversed] = useState<boolean>(
    tokenFromIndex && tokenToIndex
      ? !initialXtoY(
          tokensList[tokenFromIndex].assetAddress.toString(),
          tokensList[tokenToIndex].assetAddress.toString()
        )
      : false
  )
  const [lockAnimation, setLockAnimation] = useState<boolean>(false)
  const [swap, setSwap] = useState<boolean | null>(null)
  const [rotates, setRotates] = useState<number>(0)

  const lastTokenFrom =
    initialTokenFrom && tickerToAddress(networkType, initialTokenFrom)
      ? tickerToAddress(networkType, initialTokenFrom)
      : (localStorage.getItem(`INVARIANT_LAST_TOKEN_FROM_${networkType}`) ??
        WETH_MAIN.address.toString())

  const lastTokenTo =
    initialTokenTo && tickerToAddress(networkType, initialTokenTo)
      ? tickerToAddress(networkType, initialTokenTo)
      : localStorage.getItem(`INVARIANT_LAST_TOKEN_TO_${networkType}`)

  const initialHideUnknownTokensValue =
    localStorage.getItem('HIDE_UNKNOWN_TOKENS') === 'true' ||
    localStorage.getItem('HIDE_UNKNOWN_TOKENS') === null

  const setHideUnknownTokensValue = (val: boolean) => {
    localStorage.setItem('HIDE_UNKNOWN_TOKENS', val ? 'true' : 'false')
  }
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
      tokensList.findIndex(token => token.assetAddress.toString() === address) === -1
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
      getTokenPrice(addr, networkType)
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
      getTokenPrice(addr, networkType)
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

  const copyTokenAddressHandler = (message: string, variant: VariantType) => {
    dispatch(
      snackbarsActions.add({
        message,
        variant,
        persist: false
      })
    )
  }

  return (
    <Grid display='flex' flexDirection='column'>
      <Box display={'flex'} paddingInline={isSm ? '8px' : 0}>
        <Switcher
          onChange={(e: SwapMode) => {
            dispatch(navigationActions.setSwapMode(e))
          }}
          options={[SwapMode.swap, SwapMode.limitOrder]}
          value={swapModeType}
          fullWidth
          padding={2}
          buttonsHeight={44}
          biggerFont
        />
      </Box>
      <Grid display='flex' flexDirection='column' mt={'24px'}>
        {swapModeType === SwapMode.swap ? (
          <WrappedSwap
            walletStatus={walletStatus}
            tokensList={tokensList}
            tokensDict={tokensDict}
            isBalanceLoading={isBalanceLoading}
            tokensFromState={{ tokenFrom, tokenTo, setTokenFrom, setTokenTo }}
            progressState={{ progress, setProgress }}
            networkType={networkType}
            ethBalance={ethBalance}
            market={market}
            triggerFetchPrices={() => setTriggerFetchPrice(!triggerFetchPrice)}
            initialHideUnknownTokensValue={initialHideUnknownTokensValue}
            setHideUnknownTokensValue={setHideUnknownTokensValue}
            copyTokenAddressHandler={copyTokenAddressHandler}
            priceFromLoading={priceFromLoading}
            priceToLoading={priceToLoading}
            tokenFromPriceData={tokenFromPriceData}
            tokenToPriceData={tokenToPriceData}
            addTokenHandler={addTokenHandler}
            canNavigate={canNavigate}
            initialTokenFromIndex={initialTokenFromIndex}
            initialTokenToIndex={initialTokenToIndex}
            deleteTimeoutError={() => {
              dispatch(connectionActions.setTimeoutError(false))
            }}
            isTimeoutError={isTimeoutError}
            rateState={{ rateReversed, setRateReversed }}
            tokensState={{ setTokenFromIndex, setTokenToIndex, tokenFromIndex, tokenToIndex }}
            inputState={{ inputRef, setInputRef }}
            lockAnimationState={{ lockAnimation, setLockAnimation }}
            rotatesState={{ rotates, setRotates }}
            swapState={{ setSwap, swap }}
            allPools={allPools}
          />
        ) : (
          <WrappedLimitOrder
            walletStatus={walletStatus}
            tokensList={tokensList}
            tokensDict={tokensDict}
            isBalanceLoading={isBalanceLoading}
            tokensFromState={{ tokenFrom, tokenTo, setTokenFrom, setTokenTo }}
            progressState={{ progress, setProgress }}
            networkType={networkType}
            ethBalance={ethBalance}
            market={market}
            triggerFetchPrices={() => setTriggerFetchPrice(!triggerFetchPrice)}
            initialHideUnknownTokensValue={initialHideUnknownTokensValue}
            setHideUnknownTokensValue={setHideUnknownTokensValue}
            copyTokenAddressHandler={copyTokenAddressHandler}
            priceFromLoading={priceFromLoading}
            priceToLoading={priceToLoading}
            tokenFromPriceData={tokenFromPriceData}
            tokenToPriceData={tokenToPriceData}
            addTokenHandler={addTokenHandler}
            canNavigate={canNavigate}
            initialTokenFromIndex={initialTokenFromIndex}
            initialTokenToIndex={initialTokenToIndex}
            deleteTimeoutError={() => {
              dispatch(connectionActions.setTimeoutError(false))
            }}
            isTimeoutError={isTimeoutError}
            rateState={{ rateReversed, setRateReversed }}
            tokensState={{ setTokenFromIndex, setTokenToIndex, tokenFromIndex, tokenToIndex }}
            inputState={{ inputRef, setInputRef }}
            lockAnimationState={{ lockAnimation, setLockAnimation }}
            rotatesState={{ rotates, setRotates }}
            swapState={{ setSwap, swap }}
            walletAddress={wallet.publicKey}
            allPools={allPools}
          />
        )}
      </Grid>
      <Box display='flex' justifyContent={'center'}>
        <img src={auditIcon} alt='Audit' style={{ marginTop: '24px' }} width={180} />
      </Box>
    </Grid>
  )
}

export default SwapContainer
