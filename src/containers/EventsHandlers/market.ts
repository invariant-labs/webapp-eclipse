import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { network, rpcAddress, status } from '@store/selectors/solanaConnection'
import { Status, actions as solanaConnectionActions } from '@store/reducers/solanaConnection'
import { actions } from '@store/reducers/pools'
import { actions as positionsActions } from '@store/reducers/positions'
import { poolsArraySortedByFees } from '@store/selectors/pools'
import { swap } from '@store/selectors/swap'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import { PublicKey } from '@solana/web3.js'
import { getMarketProgramSync } from '@utils/web3/programs/amm'
import { getCurrentSolanaConnection } from '@utils/web3/connection'
import { getFullNewTokensData, getNetworkTokensList } from '@utils/utils'
import { getEclipseWallet } from '@utils/web3/wallet'
import {
  currentPoolIndex,
  lockedPositionsWithPoolsData,
  positionsWithPoolsData
} from '@store/selectors/positions'
import { useLocation } from 'react-router-dom'

const MarketEvents = () => {
  const dispatch = useDispatch()
  const networkType = useSelector(network)
  const rpc = useSelector(rpcAddress)
  const wallet = getEclipseWallet()
  const marketProgram = getMarketProgramSync(networkType, rpc, wallet as IWallet)
  const { tokenFrom, tokenTo } = useSelector(swap)
  const networkStatus = useSelector(status)
  const allPools = useSelector(poolsArraySortedByFees)
  const positionsList = useSelector(positionsWithPoolsData)
  const lockedPositionsList = useSelector(lockedPositionsWithPoolsData)
  const newPositionPoolIndex = useSelector(currentPoolIndex)
  const [subscribedSwapPools, _setSubscribedSwapPools] = useState<Set<string>>(new Set())
  const [subscribedPositionsPools, _setSubscribedPositionsPools] = useState<Set<string>>(new Set())
  const [newPositionSubscribedPool, setNewPositionSubscribedPool] = useState<PublicKey>(
    PublicKey.default
  )

  const location = useLocation()

  useEffect(() => {
    const connection = getCurrentSolanaConnection()
    if (networkStatus !== Status.Initialized || !connection) {
      return
    }
    const connectEvents = () => {
      let tokens = getNetworkTokensList(networkType)

      const currentListStr = localStorage.getItem(`CUSTOM_TOKENS_${networkType}`)
      const currentList: PublicKey[] =
        currentListStr !== null
          ? JSON.parse(currentListStr)
              .filter((address: string) => !tokens[address])
              .map((address: string) => new PublicKey(address))
          : []

      const lastTokenFrom = localStorage.getItem(`INVARIANT_LAST_TOKEN_FROM_${networkType}`)
      const lastTokenTo = localStorage.getItem(`INVARIANT_LAST_TOKEN_FROM_${networkType}`)

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

      getFullNewTokensData(currentList, connection)
        .then(data => {
          tokens = {
            ...tokens,
            ...data
          }
        })
        .finally(() => {
          dispatch(actions.addTokens(tokens))
        })
    }

    connectEvents()
  }, [dispatch, networkStatus])

  // New position pool subscription
  useEffect(() => {
    if (newPositionPoolIndex !== null && newPositionPoolIndex !== undefined) {
      const pool = allPools[newPositionPoolIndex]
      if (pool && !pool.address.equals(newPositionSubscribedPool)) {
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

  // User position pool subscriptions
  useEffect(() => {
    if (
      networkStatus !== Status.Initialized ||
      !marketProgram ||
      (!location.pathname.startsWith(`/portfolio`) && !location.pathname.startsWith(`/position`))
    ) {
      return
    }

    const connectEvents = () => {
      const allPositions = [...positionsList, ...lockedPositionsList]

      const pools = allPositions.map(position => position.poolData)

      const poolsAddresses = pools.map(pool => pool.address.toBase58())
      const unsubscribedPools = Array.from(subscribedPositionsPools).filter(
        pool => !poolsAddresses.includes(pool)
      )

      for (const pool of unsubscribedPools) {
        marketProgram.program.account.pool.unsubscribe(new PublicKey(pool))
        subscribedPositionsPools.delete(pool)
      }

      for (const pool of pools) {
        if (subscribedPositionsPools.has(pool.address.toBase58())) {
          continue
        }

        subscribedPositionsPools.add(pool.address.toBase58())

        const positionsInPool = allPositions.filter(position => {
          return position.poolData.address.toString() === pool.address.toString()
        })

        marketProgram.onPoolChange(
          pool.tokenX,
          pool.tokenY,
          { fee: pool.fee, tickSpacing: pool.tickSpacing },
          poolStructure => {
            // update position list
            if (pool.currentTickIndex !== poolStructure.currentTickIndex) {
              positionsInPool.map(position => {
                if (
                  (pool.currentTickIndex >= position?.lowerTickIndex &&
                    poolStructure.currentTickIndex < position?.lowerTickIndex) ||
                  (pool.currentTickIndex < position?.lowerTickIndex &&
                    poolStructure.currentTickIndex >= position?.lowerTickIndex)
                ) {
                  dispatch(
                    positionsActions.updatePositionTicksRange({
                      positionId: position.id.toString() + '_' + position.pool.toString(),
                      fetchTick: 'lower'
                    })
                  )
                } else if (
                  (pool.currentTickIndex < position?.upperTickIndex &&
                    poolStructure.currentTickIndex >= position?.upperTickIndex) ||
                  (pool.currentTickIndex >= position?.upperTickIndex &&
                    poolStructure.currentTickIndex < position?.upperTickIndex)
                ) {
                  dispatch(
                    positionsActions.updatePositionTicksRange({
                      positionId: position.id.toString() + '_' + position.pool.toString(),
                      fetchTick: 'upper'
                    })
                  )
                }
              })
            }

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

    connectEvents()
  }, [
    dispatch,
    lockedPositionsList,
    positionsList,
    networkStatus,
    marketProgram,
    location.pathname
  ])

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
    if (!location.pathname.startsWith('/exchange')) {
      for (const pool of Array.from(subscribedSwapPools)) {
        marketProgram.program.account.pool.unsubscribe(new PublicKey(pool))
        subscribedSwapPools.delete(pool)
      }
    }

    // Unsubscribe from new position pool on different pages than new position
    if (
      !location.pathname.startsWith(`/newPosition`) &&
      !newPositionSubscribedPool.equals(PublicKey.default)
    ) {
      marketProgram.program.account.pool.unsubscribe(newPositionSubscribedPool)
      setNewPositionSubscribedPool(PublicKey.default)
    }
    // Unsubscribe from position details pools on different pages than portfolio
    if (!location.pathname.startsWith(`/portfolio`) && !location.pathname.startsWith(`/position`)) {
      for (const pool of Array.from(subscribedPositionsPools)) {
        marketProgram.program.account.pool.unsubscribe(new PublicKey(pool))
        subscribedPositionsPools.delete(pool)
      }
    }
  }, [location.pathname])

  return null
}

export default MarketEvents
