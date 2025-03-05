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
  currentPositionData,
  currentPositionId,
  lockedPositionsWithPoolsData,
  positionsWithPoolsData
} from '@store/selectors/positions'
import { RawPoolStructure } from '@invariant-labs/sdk-eclipse/lib/market'

const MarketEvents = () => {
  const dispatch = useDispatch()
  const networkType = useSelector(network)
  const rpc = useSelector(rpcAddress)
  const wallet = getEclipseWallet()
  const marketProgram = getMarketProgramSync(networkType, rpc, wallet as IWallet)
  const { tokenFrom, tokenTo } = useSelector(swap)
  const networkStatus = useSelector(status)
  // const tickmaps = useSelector(tickMaps)
  const allPools = useSelector(poolsArraySortedByFees)
  const positionsList = useSelector(positionsWithPoolsData)
  const lockedPositionsList = useSelector(lockedPositionsWithPoolsData)
  const currentPositionIndex = useSelector(currentPositionId)
  const currentPosition = useSelector(currentPositionData)
  // const poolTicksArray = useSelector(poolTicks)
  // const [subscribedTick, _setSubscribeTick] = useState<Set<string>>(new Set())
  // const [subscribedTickmap, _setSubscribedTickmap] = useState<Set<string>>(new Set())
  // const [subscribedPoolPositions, _setSubscribedPoolPositions] = useState<Set<string>>(new Set())
  const [subscribedSwapPools, _setSubscribedSwapPools] = useState<Set<string>>(new Set())
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

  // User position pool subscriptions
  useEffect(() => {
    if (networkStatus !== Status.Initialized || !marketProgram) {
      return
    }

    const connectEvents = () => {
      const allPositions = [...positionsList, ...lockedPositionsList]

      const poolAddresses = allPositions.map(position => position.pool)

      for (const poolAddress of poolAddresses) {
        console.log('Subscribing to position pool', poolAddress.toString())
        marketProgram.program.account.pool
          .subscribe(poolAddress, 'singleGossip')
          .on('change', (poolStructure: RawPoolStructure) => {
            const positionsInPool = allPositions.filter(position =>
              position.pool.equals(poolAddress)
            )
            const pool = allPools.find(pool => pool.address.equals(poolAddress))
            if (!pool) {
              return
            }

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

                //update current position details
                if (
                  currentPositionIndex ===
                    position.id.toString() + '_' + position.pool.toString() &&
                  currentPosition
                ) {
                  if (
                    (pool.currentTickIndex >= currentPosition?.lowerTickIndex &&
                      poolStructure.currentTickIndex < currentPosition?.lowerTickIndex) ||
                    (pool.currentTickIndex < currentPosition?.lowerTickIndex &&
                      poolStructure.currentTickIndex >= currentPosition?.lowerTickIndex)
                  ) {
                    dispatch(
                      positionsActions.getCurrentPositionRangeTicks({
                        id: currentPositionIndex,
                        fetchTick: 'lower'
                      })
                    )
                  } else if (
                    (pool.currentTickIndex < currentPosition?.upperTickIndex &&
                      poolStructure.currentTickIndex >= currentPosition?.upperTickIndex) ||
                    (pool.currentTickIndex >= currentPosition?.upperTickIndex &&
                      poolStructure.currentTickIndex < currentPosition?.upperTickIndex)
                  ) {
                    dispatch(
                      positionsActions.getCurrentPositionRangeTicks({
                        id: currentPositionIndex,
                        fetchTick: 'upper'
                      })
                    )
                  }
                }
              })
            }

            dispatch(
              actions.updatePool({
                address: pool.address,
                poolStructure
              })
            )
          })
      }
    }

    connectEvents()
    // }, [dispatch, allPools.length, networkStatus, marketProgram, currentPositionIndex])
  }, [
    dispatch,
    lockedPositionsList,
    positionsList,
    networkStatus,
    marketProgram,
    currentPositionIndex
  ])

  // useEffect(() => {
  //   if (networkStatus !== Status.Initialized || !marketProgram || allPools.length === 0) {
  //     return
  //   }
  //   const connectEvents = async () => {
  //     if (tokenFrom && tokenTo) {
  //       Object.keys(poolTicksArray).forEach(address => {
  //         if (subscribedTick.has(address)) {
  //           return
  //         }
  //         subscribedTick.add(address)
  //         const pool = allPools.find(pool => {
  //           return pool.address.toString() === address
  //         })
  //         if (typeof pool === 'undefined') {
  //           return
  //         }
  //         poolTicksArray[address].forEach(singleTick => {
  //           marketProgram.onTickChange(
  //             new Pair(pool.tokenX, pool.tokenY, {
  //               fee: pool.fee,
  //               tickSpacing: pool.tickSpacing
  //             }),
  //             singleTick.index,
  //             tickObject => {
  //               dispatch(
  //                 actions.updateTicks({
  //                   address: address,
  //                   index: singleTick.index,
  //                   tick: tickObject
  //                 })
  //               )
  //             }
  //           )
  //         })
  //       })
  //     }
  //   }

  //   connectEvents()
  // }, [networkStatus, marketProgram, Object.values(poolTicksArray).length])

  // useEffect(() => {
  //   if (
  //     networkStatus !== Status.Initialized ||
  //     !marketProgram ||
  //     Object.values(allPools).length === 0
  //   ) {
  //     return
  //   }
  //   const connectEvents = async () => {
  //     if (tokenFrom && tokenTo) {
  //       Object.keys(tickmaps).forEach(address => {
  //         if (subscribedTickmap.has(address)) {
  //           return
  //         }
  //         subscribedTickmap.add(address)
  //         const pool = allPools.find(pool => {
  //           return pool.tickmap.toString() === address
  //         })
  //         if (typeof pool === 'undefined') {
  //           return
  //         }
  //         // trunk-ignore(eslint/@typescript-eslint/no-floating-promises)
  //         marketProgram.onTickmapChange(new PublicKey(address), tickmap => {
  //           const changes = findTickmapChanges(
  //             tickmaps[address].bitmap,
  //             tickmap.bitmap,
  //             pool.tickSpacing
  //           )

  //           for (const [index, info] of Object.entries(changes)) {
  //             if (info === 'added') {
  //               try {
  //                 // trunk-ignore(eslint/@typescript-eslint/no-floating-promises)
  //                 marketProgram.onTickChange(
  //                   new Pair(pool.tokenX, pool.tokenY, {
  //                     fee: pool.fee,
  //                     tickSpacing: pool.tickSpacing
  //                   }),
  //                   +index,
  //                   tickObject => {
  //                     dispatch(
  //                       actions.updateTicks({
  //                         address: pool.address.toString(),
  //                         index: +index,
  //                         tick: tickObject
  //                       })
  //                     )
  //                   }
  //                 )
  //               } catch (err) {
  //                 console.log(err)
  //               }
  //             }
  //           }
  //           dispatch(
  //             actions.updateTickmap({
  //               address: address,
  //               bitmap: tickmap.bitmap
  //             })
  //           )
  //         })
  //       })
  //     }
  //   }

  //   connectEvents()
  // }, [networkStatus, marketProgram, Object.values(tickmaps).length])

  useEffect(() => {
    window.addEventListener('unhandledrejection', e => {
      dispatch(solanaConnectionActions.handleRpcError(e))
    })

    return () => {}
  }, [])

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

  return null
}

export default MarketEvents
