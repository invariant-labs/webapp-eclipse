import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { network, rpcAddress, status } from '@store/selectors/solanaConnection'
import { Status, actions as solanaConnectionActions } from '@store/reducers/solanaConnection'
import { actions } from '@store/reducers/pools'
import { actions as swapActions } from '@store/reducers/swap'
import { poolsArraySortedByFees } from '@store/selectors/pools'
import { swap } from '@store/selectors/swap'
import { IWallet, MAINNET_POOL_WHITELIST } from '@invariant-labs/sdk-eclipse'
import { PublicKey } from '@solana/web3.js'
import { getMarketProgramSync } from '@utils/web3/programs/amm'
import { getCurrentSolanaConnection } from '@utils/web3/connection'
import { getMarketNewTokensData, getNetworkTokensList, ROUTES } from '@utils/utils'
import { getEclipseWallet } from '@utils/web3/wallet'
import { currentPoolIndex } from '@store/selectors/positions'
import { useLocation } from 'react-router-dom'
import { autoSwapPools, TOKEN_FETCH_DELAY } from '@store/consts/static'
import { FEE_TIERS } from '@invariant-labs/sdk-eclipse/lib/utils'
import { parsePool } from '@invariant-labs/sdk-eclipse/lib/market'
import { tokensData } from '@store/selectors/stats'
import { Token, TokenSerialized } from '@store/consts/types'

const MarketEvents = () => {
  const dispatch = useDispatch()
  const networkType = useSelector(network)
  const rpc = useSelector(rpcAddress)
  const wallet = getEclipseWallet()
  const marketProgram = getMarketProgramSync(networkType, rpc, wallet as IWallet)
  const { tokenFrom, tokenTo } = useSelector(swap)
  const networkStatus = useSelector(status)
  const allPools = useSelector(poolsArraySortedByFees)
  const tokenDetails = useSelector(tokensData)
  const unknownAdresses = tokenDetails.map(item => item.address.toString())
  const newPositionPoolIndex = useSelector(currentPoolIndex)
  const [subscribedTwoHopSwapPools, _setSubscribedTwoHopSwapPools] = useState<Set<PublicKey>>(
    new Set()
  )
  const [subscribedSwapPools, _setSubscribedSwapPools] = useState<Set<string>>(new Set())
  const [newPositionSubscribedPool, setNewPositionSubscribedPool] = useState<PublicKey>(
    PublicKey.default
  )
  const [autoswapSubscribedPool, setAutoswapSubscribedPool] = useState<PublicKey>(PublicKey.default)

  const location = useLocation()

  useEffect(() => {
    const connection = getCurrentSolanaConnection()
    if (networkStatus !== Status.Initialized || !connection) {
      return
    }
    const connectEvents = () => {
      let tokens = getNetworkTokensList(networkType)
      const currentListUnkown: PublicKey[] =
        unknownAdresses !== null
          ? unknownAdresses
              .filter((address: string) => !tokens[address])
              .map((address: string) => new PublicKey(address))
          : []

      const currentListStr = localStorage.getItem(`CUSTOM_TOKENS_${networkType}`)
      const currentListBefore: PublicKey[] =
        currentListStr !== null
          ? JSON.parse(currentListStr)
              .filter((address: string) => !tokens[address])
              .map((address: string) => new PublicKey(address))
          : []
      const currentList: PublicKey[] = [
        ...currentListBefore,
        ...currentListUnkown.filter(pk => !currentListBefore.some(existing => existing.equals(pk)))
      ]
      const lastTokenFrom = localStorage.getItem(`INVARIANT_LAST_TOKEN_FROM_${networkType}`)
      const lastTokenTo = localStorage.getItem(`INVARIANT_LAST_TOKEN_TO_${networkType}`)

      if (
        lastTokenFrom !== null &&
        !tokens[lastTokenFrom] &&
        !currentList.find(addr => addr.toString() === lastTokenFrom)
      ) {
        currentList.push(new PublicKey(lastTokenFrom))
      }

      if (
        lastTokenTo !== null &&
        !tokens[lastTokenTo] &&
        !currentList.find(addr => addr.toString() === lastTokenTo)
      ) {
        currentList.push(new PublicKey(lastTokenTo))
      }
      const lastTokenFetchAmountStr = localStorage.getItem(
        `INVARIANT_LAST_TOKEN_AMOUNT_${networkType}`
      )
      const lastTokenFetchAmount =
        lastTokenFetchAmountStr !== null ? JSON.parse(lastTokenFetchAmountStr) : null

      const fetchedTokensStr = localStorage.getItem(`INVARIANT_CACHED_METADATA_${networkType}`)
      const fetchedTokens: Record<string, TokenSerialized> =
        fetchedTokensStr !== null
          ? (JSON.parse(fetchedTokensStr) as Record<string, TokenSerialized>)
          : {}

      const shouldFetchTokens =
        lastTokenFetchAmount === null ||
        currentList.length > (lastTokenFetchAmount?.amount || 0) ||
        (lastTokenFetchAmount !== null &&
          Number(lastTokenFetchAmount.lastTimestamp) + TOKEN_FETCH_DELAY <= Date.now())

      if (shouldFetchTokens && currentList.length > 0) {
        getMarketNewTokensData(currentList, connection)
          .then(data => {
            tokens = {
              ...tokens,
              ...data
            }
            localStorage.setItem(`INVARIANT_CACHED_METADATA_${networkType}`, JSON.stringify(data))
            localStorage.setItem(
              `INVARIANT_LAST_TOKEN_AMOUNT_${networkType}`,
              JSON.stringify({
                amount: currentList.length,
                lastTimestamp: Date.now()
              })
            )
          })
          .finally(() => {
            dispatch(actions.addTokens(tokens))
          })
      } else {
        const parsedData: Token[] = Object.values(fetchedTokens).map(serialized => ({
          ...serialized,
          address: new PublicKey(serialized.address),
          tokenProgram: new PublicKey(serialized.tokenProgram ?? '')
        }))

        const parsedTokensMap: Record<string, Token> = parsedData.reduce(
          (map, token) => {
            map[token.address.toString()] = token
            return map
          },
          {} as Record<string, Token>
        )

        tokens = {
          ...tokens,
          ...parsedTokensMap
        }
        dispatch(actions.addTokens(tokens))
      }
    }

    connectEvents()
  }, [dispatch, networkStatus, unknownAdresses])

  // New position pool subscription
  useEffect(() => {
    if (
      networkStatus !== Status.Initialized ||
      !marketProgram ||
      !location.pathname.startsWith(ROUTES.NEW_POSITION)
    ) {
      return
    }

    if (newPositionPoolIndex !== null && newPositionPoolIndex !== undefined) {
      const pool = allPools[newPositionPoolIndex]

      if (pool && !pool.address.equals(newPositionSubscribedPool)) {
        const autoswapPool = autoSwapPools.find(
          autoswapPool =>
            autoswapPool.pair.tokenX.equals(pool.tokenX) &&
            autoswapPool.pair.tokenY.equals(pool.tokenY)
        )

        if (autoswapPool) {
          if (!autoswapSubscribedPool.equals(autoswapPool.swapPool.address)) {
            marketProgram.program.account.pool.unsubscribe(autoswapSubscribedPool)
            setAutoswapSubscribedPool(autoswapPool.swapPool.address)
            marketProgram.onPoolChange(
              pool.tokenX,
              pool.tokenY,
              FEE_TIERS[autoswapPool.swapPool.feeIndex],
              poolStructure => {
                dispatch(
                  actions.updatePool({
                    address: pool.address,
                    poolStructure
                  })
                )
              }
            )
          }
        } else {
          marketProgram.program.account.pool.unsubscribe(autoswapSubscribedPool)
          setAutoswapSubscribedPool(PublicKey.default)
        }

        marketProgram.program.account.pool.unsubscribe(newPositionSubscribedPool)
        setNewPositionSubscribedPool(pool.address)
        marketProgram.onPoolChange(
          pool.tokenX,
          pool.tokenY,
          { fee: pool.fee, tickSpacing: pool.tickSpacing },
          poolStructure => {
            dispatch(
              actions.updatePool({
                address: pool.address,
                poolStructure
              })
            )
          }
        )
      }
    }
  }, [dispatch, networkStatus, newPositionPoolIndex])

  useEffect(() => {
    window.addEventListener('unhandledrejection', e => {
      dispatch(solanaConnectionActions.handleRpcError(e))
    })

    return () => {}
  }, [])

  // Swap pool & tickmap and ticks query
  useEffect(() => {
    if (tokenFrom && tokenTo) {
      dispatch(actions.getNearestTicksForPair({ tokenFrom, tokenTo, allPools }))
      dispatch(actions.getTicksAndTickMaps({ tokenFrom, tokenTo, allPools }))

      const pools = allPools.filter(
        p =>
          (p.tokenX.equals(tokenFrom) && p.tokenY.equals(tokenTo)) ||
          (p.tokenX.equals(tokenTo) && p.tokenY.equals(tokenFrom))
      )

      for (const subscribedPool of Array.from(subscribedSwapPools)) {
        if (pools.some(p => p.address.toString() === subscribedPool)) {
          continue
        } else {
          marketProgram.program.account.pool.unsubscribe(new PublicKey(subscribedPool))
          subscribedSwapPools.delete(subscribedPool)
        }
      }

      if (subscribedTwoHopSwapPools.size === 0) {
        for (const pool of MAINNET_POOL_WHITELIST) {
          const address = pool.pair.getAddress(marketProgram.program.programId)
          subscribedTwoHopSwapPools.add(address)
          marketProgram.onPoolChange(
            pool.pair.tokenX,
            pool.pair.tokenY,
            { fee: pool.pair.feeTier.fee, tickSpacing: pool.pair.feeTier.tickSpacing },
            poolStructure => {
              const parsedPool = parsePool(poolStructure)
              dispatch(
                swapActions.updateSwapPool({
                  address,
                  pool: parsedPool
                })
              )
            }
          )
        }
      }

      if (pools) {
        for (const pool of pools) {
          subscribedSwapPools.add(pool.address.toString())

          marketProgram.onPoolChange(
            pool.tokenX,
            pool.tokenY,
            { fee: pool.fee, tickSpacing: pool.tickSpacing },
            poolStructure => {
              dispatch(
                actions.updatePool({
                  address: pool.address,
                  poolStructure
                })
              )
            }
          )
        }
      }
    }
  }, [tokenFrom, tokenTo])

  useEffect(() => {
    // Unsubscribe from swap pools on different pages than swap
    if (!location.pathname.startsWith(ROUTES.EXCHANGE)) {
      for (const pool of Array.from(subscribedSwapPools)) {
        marketProgram.program.account.pool.unsubscribe(new PublicKey(pool))
        subscribedSwapPools.delete(pool)
      }
      for (const pool of Array.from(subscribedTwoHopSwapPools)) {
        marketProgram.program.account.pool.unsubscribe(new PublicKey(pool))
        subscribedTwoHopSwapPools.delete(pool)
      }
    }

    // Unsubscribe from new position pool on different pages than new position
    if (
      !location.pathname.startsWith(ROUTES.NEW_POSITION) &&
      !newPositionSubscribedPool.equals(PublicKey.default)
    ) {
      marketProgram.program.account.pool.unsubscribe(newPositionSubscribedPool)
      setNewPositionSubscribedPool(PublicKey.default)
      marketProgram.program.account.pool.unsubscribe(autoswapSubscribedPool)
      setAutoswapSubscribedPool(PublicKey.default)
    }
  }, [location.pathname])

  return null
}

export default MarketEvents
