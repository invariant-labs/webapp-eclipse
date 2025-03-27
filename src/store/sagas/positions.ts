import { call, put, takeEvery, take, select, all, spawn, takeLatest } from 'typed-redux-saga'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions as poolsActions, ListPoolsResponse, ListType } from '@store/reducers/pools'
import { createAccount, getWallet, sleep } from './wallet'
import { getConnection, handleRpcError } from './connection'
import {
  actions,
  ClosePositionData,
  GetCurrentTicksData,
  InitPositionData,
  PositionWithAddress
} from '@store/reducers/positions'
import { PayloadAction } from '@reduxjs/toolkit'
import { poolsArraySortedByFees, tokens } from '@store/selectors/pools'
import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import { accounts } from '@store/selectors/solanaWallet'
import { actions as RPCAction, RpcStatus } from '@store/reducers/solanaConnection'
import {
  Transaction,
  sendAndConfirmRawTransaction,
  Keypair,
  TransactionExpiredTimeoutError,
  PublicKey
} from '@solana/web3.js'
import {
  SIGNING_SNACKBAR_CONFIG,
  TIMEOUT_ERROR_MESSAGE,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import {
  plotTicks,
  lockedPositionsWithPoolsData,
  positionsList,
  positionsWithPoolsData
} from '@store/selectors/positions'
import { GuardPredicate } from '@redux-saga/types'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { closeSnackbar } from 'notistack'
import { getLockerProgram, getMarketProgram } from '@utils/web3/programs/amm'
import {
  createLiquidityPlot,
  createLoaderKey,
  createPlaceholderLiquidityPlot,
  ensureError,
  getLiquidityTicksByPositionsList,
  getPositionByIdAndPoolAddress,
  getPositionsAddressesFromRange,
  getTicksFromAddresses
} from '@utils/utils'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import {
  createNativeAtaInstructions,
  createNativeAtaWithTransferInstructions
} from '@invariant-labs/sdk-eclipse/lib/utils'
import { networkTypetoProgramNetwork } from '@utils/web3/connection'
import { ClaimAllFee, parseTick, Position } from '@invariant-labs/sdk-eclipse/lib/market'

function* handleInitPositionAndPoolWithETH(action: PayloadAction<InitPositionData>): Generator {
  const data = action.payload

  if (
    (data.tokenX.toString() === WRAPPED_ETH_ADDRESS && data.xAmount === 0) ||
    (data.tokenY.toString() === WRAPPED_ETH_ADDRESS && data.yAmount === 0)
  ) {
    return yield* call(handleInitPosition, action)
  }

  const loaderCreatePool = createLoaderKey()
  const loaderSigningTx = createLoaderKey()
  try {
    yield put(
      snackbarsActions.add({
        message: 'Creating pool...',
        variant: 'pending',
        persist: true,
        key: loaderCreatePool
      })
    )

    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    marketProgram.setWallet(wallet as IWallet)

    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)

    const wrappedEthAccount = Keypair.generate()
    const net = networkTypetoProgramNetwork(networkType)

    const { createIx, initIx, transferIx, unwrapIx } = createNativeAtaWithTransferInstructions(
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      net,
      allTokens[data.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? data.xAmount
        : data.yAmount
    )

    let userTokenX =
      allTokens[data.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[data.tokenX.toString()]
          ? tokensAccounts[data.tokenX.toString()].address
          : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, data.tokenX)
    }

    let userTokenY =
      allTokens[data.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[data.tokenY.toString()]
          ? tokensAccounts[data.tokenY.toString()].address
          : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, data.tokenY)
    }

    const combinedTransaction = new Transaction()

    const { createPoolTx, createPoolSigners, createPositionTx } = yield* call(
      [marketProgram, marketProgram.createPoolWithSqrtPriceAndPositionTx],
      {
        pair: new Pair(data.tokenX, data.tokenY, {
          fee: data.fee,
          tickSpacing: data.tickSpacing
        }),
        userTokenX,
        userTokenY,
        lowerTick: data.lowerTick,
        upperTick: data.upperTick,
        liquidityDelta: data.liquidityDelta,
        owner: wallet.publicKey,
        initTick: data.initTick,
        slippage: data.slippage,
        knownPrice: data.knownPrice
      },
      undefined,
      {
        tokenXProgramAddress: allTokens[data.tokenX.toString()].tokenProgram,
        tokenYProgramAddress: allTokens[data.tokenY.toString()].tokenProgram
      }
    )

    combinedTransaction
      .add(createIx)
      .add(transferIx)
      .add(initIx)
      .add(createPositionTx)
      .add(unwrapIx)

    // const initialBlockhash = yield* call([connection, connection.getRecentBlockhash])
    // initialTx.recentBlockhash = initialBlockhash.blockhash
    // initialTx.feePayer = wallet.publicKey

    const createPoolBlockhash = yield* call([connection, connection.getLatestBlockhash])

    createPoolTx.recentBlockhash = createPoolBlockhash.blockhash
    createPoolTx.feePayer = wallet.publicKey

    const createPositionBlockhash = yield* call([connection, connection.getLatestBlockhash])

    combinedTransaction.recentBlockhash = createPositionBlockhash.blockhash
    combinedTransaction.feePayer = wallet.publicKey

    // const unwrapTx = new Transaction().add(unwrapIx)
    // const unwrapBlockhash = yield* call([connection, connection.getRecentBlockhash])
    // unwrapTx.recentBlockhash = unwrapBlockhash.blockhash
    // unwrapTx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const [signedCombinedTransactionTx, createPoolSignedTx] = (yield* call(
      [wallet, wallet.signAllTransactions],
      // [initialTx, initPositionTx, unwrapTx, initPoolTx]
      [combinedTransaction, createPoolTx]
    )) as Transaction[]

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    // initialSignedTx.partialSign(wrappedEthAccount)
    ;(signedCombinedTransactionTx as Transaction).partialSign(wrappedEthAccount)

    if (createPoolSigners.length) {
      ;(createPoolSignedTx as Transaction).partialSign(...createPoolSigners)
    }

    // const initialTxid = yield* call(
    //   sendAndConfirmRawTransaction,
    //   connection,
    //   initialSignedTx.serialize(),
    //   {
    //     skipPreflight: false
    //   }
    // )

    // if (!initialTxid.length) {
    //   yield put(actions.setInitPositionSuccess(false))

    //   return yield put(
    //     snackbarsActions.add({
    //       message: 'ETH wrapping failed. Please try again.',
    //       variant: 'error',
    //       persist: false,
    //       txid: initialTxid
    //     })
    //   )
    // }

    yield* call(sendAndConfirmRawTransaction, connection, createPoolSignedTx.serialize(), {
      skipPreflight: false
    })

    const createPositionTxid = yield* call(
      sendAndConfirmRawTransaction,
      connection,
      signedCombinedTransactionTx.serialize(),
      {
        skipPreflight: false
      }
    )

    if (!createPositionTxid.length) {
      yield put(actions.setInitPositionSuccess(false))

      closeSnackbar(loaderCreatePool)
      yield put(snackbarsActions.remove(loaderCreatePool))

      return yield put(
        snackbarsActions.add({
          message:
            // 'Position adding failed. Please unwrap wrapped ETH in your wallet and try again.',
            'Position adding failed. Please try again',
          variant: 'error',
          persist: false,
          txid: createPositionTxid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position added successfully',
          variant: 'success',
          persist: false,
          txid: createPositionTxid
        })
      )

      yield put(actions.getPositionsList())
    }

    // const unwrapTxid = yield* call(
    //   sendAndConfirmRawTransaction,
    //   connection,
    //   unwrapSignedTx.serialize(),
    //   {
    //     skipPreflight: false
    //   }
    // )

    yield put(actions.setInitPositionSuccess(true))

    // if (!unwrapTxid.length) {
    //   yield put(
    //     snackbarsActions.add({
    //       message: 'Wrapped ETH unwrap failed. Try to unwrap it in your wallet.',
    //       variant: 'warning',
    //       persist: false,
    //       txid: unwrapTxid
    //     })
    //   )
    // } else {
    //   yield put(
    //     snackbarsActions.add({
    //       message: 'ETH unwrapped successfully.',
    //       variant: 'success',
    //       persist: false,
    //       txid: unwrapTxid
    //     })
    //   )
    // }

    closeSnackbar(loaderCreatePool)
    yield put(snackbarsActions.remove(loaderCreatePool))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield put(actions.setInitPositionSuccess(false))

    closeSnackbar(loaderCreatePool)
    yield put(snackbarsActions.remove(loaderCreatePool))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )
      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

function* handleInitPositionWithETH(action: PayloadAction<InitPositionData>): Generator {
  const data = action.payload

  if (
    (data.tokenX.toString() === WRAPPED_ETH_ADDRESS && data.xAmount === 0) ||
    (data.tokenY.toString() === WRAPPED_ETH_ADDRESS && data.yAmount === 0)
  ) {
    return yield* call(handleInitPosition, action)
  }

  // To initialize both the pool and position, separate transactions are necessary, as a single transaction does not have enough space to accommodate all instructions for both pool and position creation with ETH.
  if (data.initPool) {
    return yield* call(handleInitPositionAndPoolWithETH, action)
  }

  const loaderCreatePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()
  try {
    yield put(
      snackbarsActions.add({
        message: 'Creating position...',
        variant: 'pending',
        persist: true,
        key: loaderCreatePosition
      })
    )

    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    marketProgram.setWallet({
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
      publicKey: wallet.publicKey
    } as IWallet)

    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)
    const allPools = yield* select(poolsArraySortedByFees)
    const ticks = yield* select(plotTicks)

    const pair = new Pair(data.tokenX, data.tokenY, {
      fee: data.fee,
      tickSpacing: data.tickSpacing
    })
    const userPositionList = yield* select(positionsList)

    const wrappedEthAccount = Keypair.generate()

    const net = networkTypetoProgramNetwork(networkType)

    const { createIx, initIx, transferIx, unwrapIx } = createNativeAtaWithTransferInstructions(
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      net,
      allTokens[data.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? data.xAmount
        : data.yAmount
    )

    let userTokenX =
      allTokens[data.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[data.tokenX.toString()]
          ? tokensAccounts[data.tokenX.toString()].address
          : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, data.tokenX)
    }

    let userTokenY =
      allTokens[data.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[data.tokenY.toString()]
          ? tokensAccounts[data.tokenY.toString()].address
          : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, data.tokenY)
    }

    const poolSigners: Keypair[] = []

    const combinedTransaction = new Transaction()

    combinedTransaction.add(createIx).add(transferIx).add(initIx)

    const upperTickExists =
      !ticks.hasError &&
      !ticks.loading &&
      ticks.rawTickIndexes.find(t => t === data.upperTick) !== undefined
        ? true
        : undefined
    const lowerTickExists =
      !ticks.hasError &&
      !ticks.loading &&
      ticks.rawTickIndexes.find(t => t === data.lowerTick) !== undefined
        ? true
        : undefined

    const initPositionTx = yield* call(
      [marketProgram, marketProgram.createPositionTx],
      {
        pair,
        userTokenX,
        userTokenY,
        lowerTick: data.lowerTick,
        upperTick: data.upperTick,
        liquidityDelta: data.liquidityDelta,
        owner: wallet.publicKey,
        slippage: data.slippage,
        knownPrice: data.knownPrice
      },
      {
        lowerTickExists,
        upperTickExists,
        pool: data.poolIndex !== null ? allPools[data.poolIndex] : undefined,
        tokenXProgramAddress: allTokens[data.tokenX.toString()].tokenProgram,
        tokenYProgramAddress: allTokens[data.tokenY.toString()].tokenProgram,
        positionsList: !userPositionList.loading ? userPositionList : undefined
      }
    )

    combinedTransaction.add(initPositionTx)
    combinedTransaction.add(unwrapIx)

    const blockhash = yield* call([connection, connection.getLatestBlockhash])
    combinedTransaction.recentBlockhash = blockhash.blockhash
    combinedTransaction.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = (yield* call(
      [wallet, wallet.signTransaction],
      combinedTransaction
    )) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))
    signedTx.partialSign(wrappedEthAccount)

    if (poolSigners.length) {
      signedTx.partialSign(...poolSigners)
    }

    const txId = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    if (!txId.length) {
      yield put(actions.setInitPositionSuccess(false))

      closeSnackbar(loaderCreatePosition)
      yield put(snackbarsActions.remove(loaderCreatePosition))

      return yield put(
        snackbarsActions.add({
          message: 'Position adding failed. Please try again',
          variant: 'error',
          persist: false,
          txid: txId
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position added successfully',
          variant: 'success',
          persist: false,
          txid: txId
        })
      )

      yield put(actions.getPositionsList())
    }

    yield put(actions.setInitPositionSuccess(true))

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield put(actions.setInitPositionSuccess(false))

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )
      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleInitPosition(action: PayloadAction<InitPositionData>): Generator {
  const loaderCreatePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const allTokens = yield* select(tokens)

    if (
      (allTokens[action.payload.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS &&
        action.payload.xAmount !== 0) ||
      (allTokens[action.payload.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS &&
        action.payload.yAmount !== 0)
    ) {
      return yield* call(handleInitPositionWithETH, action)
    }

    yield put(
      snackbarsActions.add({
        message: 'Creating position...',
        variant: 'pending',
        persist: true,
        key: loaderCreatePosition
      })
    )

    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)

    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    marketProgram.setWallet({
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
      publicKey: wallet.publicKey
    } as IWallet)

    const allPools = yield* select(poolsArraySortedByFees)
    const ticks = yield* select(plotTicks)
    const pair = new Pair(action.payload.tokenX, action.payload.tokenY, {
      fee: action.payload.fee,
      tickSpacing: action.payload.tickSpacing
    })

    const userPositionList = yield* select(positionsList)

    const tokensAccounts = yield* select(accounts)

    let userTokenX = tokensAccounts[action.payload.tokenX.toString()]
      ? tokensAccounts[action.payload.tokenX.toString()].address
      : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, action.payload.tokenX)
    }

    let userTokenY = tokensAccounts[action.payload.tokenY.toString()]
      ? tokensAccounts[action.payload.tokenY.toString()].address
      : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, action.payload.tokenY)
    }

    let tx: Transaction
    let createPoolTx: Transaction | null = null
    let poolSigners: Keypair[] = []

    if (action.payload.initPool) {
      const txs = yield* call(
        [marketProgram, marketProgram.createPoolWithSqrtPriceAndPositionTx],
        {
          pair,
          userTokenX,
          userTokenY,
          lowerTick: action.payload.lowerTick,
          upperTick: action.payload.upperTick,
          liquidityDelta: action.payload.liquidityDelta,
          owner: wallet.publicKey,
          slippage: action.payload.slippage,
          knownPrice: action.payload.knownPrice
        },
        undefined,
        {
          tokenXProgramAddress: allTokens[action.payload.tokenX.toString()].tokenProgram,
          tokenYProgramAddress: allTokens[action.payload.tokenY.toString()].tokenProgram,
          positionsList: !userPositionList.loading ? userPositionList : undefined
        }
      )
      tx = txs.createPositionTx
      createPoolTx = txs.createPoolTx
      poolSigners = txs.createPoolSigners
    } else {
      tx = yield* call(
        [marketProgram, marketProgram.createPositionTx],
        {
          pair,
          userTokenX,
          userTokenY,
          lowerTick: action.payload.lowerTick,
          upperTick: action.payload.upperTick,
          liquidityDelta: action.payload.liquidityDelta,
          owner: wallet.publicKey,
          slippage: action.payload.slippage,
          knownPrice: action.payload.knownPrice
        },
        {
          lowerTickExists:
            !ticks.hasError &&
            !ticks.loading &&
            ticks.rawTickIndexes.find(t => t === action.payload.lowerTick) !== undefined
              ? true
              : undefined,
          upperTickExists:
            !ticks.hasError &&
            !ticks.loading &&
            ticks.rawTickIndexes.find(t => t === action.payload.upperTick) !== undefined
              ? true
              : undefined,
          pool: action.payload.poolIndex !== null ? allPools[action.payload.poolIndex] : undefined,
          tokenXProgramAddress: allTokens[action.payload.tokenX.toString()].tokenProgram,
          tokenYProgramAddress: allTokens[action.payload.tokenY.toString()].tokenProgram,
          positionsList: !userPositionList.loading ? userPositionList : undefined
        }
      )
    }

    const blockhash = yield* call([connection, connection.getLatestBlockhash])
    tx.recentBlockhash = blockhash.blockhash
    tx.feePayer = wallet.publicKey

    if (createPoolTx) {
      createPoolTx.recentBlockhash = blockhash.blockhash
      createPoolTx.feePayer = wallet.publicKey
      yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

      const signedTx = (yield* call([wallet, wallet.signTransaction], createPoolTx)) as Transaction

      closeSnackbar(loaderSigningTx)

      yield put(snackbarsActions.remove(loaderSigningTx))
      signedTx.partialSign(...poolSigners)

      yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
        skipPreflight: false
      })
    }

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    yield put(actions.setInitPositionSuccess(!!txid.length))

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Position adding failed. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position added successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )

      yield put(actions.getPositionsList())
    }

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield put(actions.setInitPositionSuccess(false))

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )
      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleGetCurrentPlotTicks(action: PayloadAction<GetCurrentTicksData>): Generator {
  const allPools = yield* select(poolsArraySortedByFees)
  const allTokens = yield* select(tokens)

  const { poolIndex, isXtoY } = action.payload

  const xDecimal = allTokens[allPools[poolIndex].tokenX.toString()].decimals
  const yDecimal = allTokens[allPools[poolIndex].tokenY.toString()].decimals

  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const rawTicks = yield* call(
      [marketProgram, marketProgram.getAllTicks],
      new Pair(allPools[poolIndex].tokenX, allPools[poolIndex].tokenY, {
        fee: allPools[poolIndex].fee,
        tickSpacing: allPools[poolIndex].tickSpacing
      })
    )

    const { list } = yield* select(positionsList)
    const userTicks = getLiquidityTicksByPositionsList(
      allPools[poolIndex],
      list,
      isXtoY,
      xDecimal,
      yDecimal
    )

    const ticksData = createLiquidityPlot(
      rawTicks,
      allPools[poolIndex],
      action.payload.isXtoY,
      xDecimal,
      yDecimal
    )

    yield put(
      actions.setPlotTicks({
        allPlotTicks: ticksData,
        userPlotTicks: userTicks,
        rawTickIndexes: rawTicks.map(t => t.index)
      })
    )
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    const data = createPlaceholderLiquidityPlot(
      action.payload.isXtoY,
      10,
      allPools[poolIndex].tickSpacing,
      xDecimal,
      yDecimal
    )
    yield put(actions.setErrorPlotTicks(data))

    yield* call(handleRpcError, error.message)
  }
}

export function* handleGetPositionsList() {
  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const lockerProgram = yield* call(getLockerProgram, networkType, rpc, wallet as IWallet)

    if (!wallet) {
      yield* put(actions.setLockedPositionsList([]))
      yield* put(actions.setPositionsList([[], { head: 0, bump: 0 }, false]))
      return
    }

    const { head, bump } = yield* call(
      [marketProgram, marketProgram.getPositionList],
      wallet.publicKey
    )

    const { list, addresses } = yield* all({
      list: call(
        [marketProgram, marketProgram.getPositionsFromRange],
        wallet.publicKey,
        0,
        head - 1
      ),
      addresses: call(getPositionsAddressesFromRange, marketProgram, wallet.publicKey, 0, head - 1)
    })

    const pools = new Set(list.map(pos => pos.pool.toString()))

    const [lockerAuth] = lockerProgram.getUserLocksAddress(wallet.publicKey)

    let lockedPositions: (Position & { address: PublicKey })[] = []

    try {
      const { head: lockedHead } = yield* call(
        [marketProgram, marketProgram.getPositionList],
        lockerAuth
      )

      const { lockedList, lockedAddresses } = yield* all({
        lockedList: call(
          [marketProgram, marketProgram.getPositionsFromRange],
          lockerAuth,
          0,
          lockedHead - 1
        ),
        lockedAddresses: call(
          getPositionsAddressesFromRange,
          marketProgram,
          lockerAuth,
          0,
          lockedHead - 1
        )
      })

      lockedPositions = lockedList.map((position, index) => ({
        ...position,
        address: lockedAddresses[index]
      }))
    } catch (e: unknown) {
      const error = ensureError(e)
      console.log(error)

      lockedPositions = []
    }

    lockedPositions.forEach(lock => {
      pools.add(lock.pool.toString())
    })

    yield* put(
      poolsActions.getPoolsDataForList({
        addresses: Array.from(pools),
        listType: ListType.POSITIONS
      })
    )
    yield* take(poolsActions.addPoolsForList.type)

    const poolsList = yield* select(poolsArraySortedByFees)
    const positions = list.map((position, index) => {
      return {
        ...position,
        address: addresses[index]
      }
    })

    const positionsWithTicks: PositionWithAddress[] = []
    const tickAddresses = new Set<PublicKey>()

    const totalPositions = [...positions, ...lockedPositions]
    for (const position of totalPositions) {
      const pool = poolsList.find(pool => pool.address.toString() === position.pool.toString())

      if (!pool) {
        continue
      }

      const pair = new Pair(pool.tokenX, pool.tokenY, {
        fee: pool.fee,
        tickSpacing: pool.tickSpacing
      })

      const lowerTickAddress = marketProgram.getTickAddress(pair, position.lowerTickIndex)
      const upperTickAddress = marketProgram.getTickAddress(pair, position.upperTickIndex)

      tickAddresses.add(lowerTickAddress.tickAddress).add(upperTickAddress.tickAddress)
    }

    const ticks = yield* call(getTicksFromAddresses, marketProgram, [...tickAddresses])

    let offset = 0

    for (let i = 0; i < positions.length; i++) {
      if (!ticks[i] || !ticks[i + 1]) {
        continue
      }
      const lowerTick = parseTick(ticks[offset]!)
      const upperTick = parseTick(ticks[offset + 1]!)

      positionsWithTicks[i] = {
        ...positions[i],
        lowerTick: lowerTick,
        upperTick: upperTick,
        ticksLoading: false
      }
      offset += 2
    }
    const lockedPositionsWithTicks: PositionWithAddress[] = []

    for (let i = 0; i < lockedPositions.length; i++) {
      if (!ticks[i] || !ticks[i + 1]) {
        continue
      }

      const lowerTick = parseTick(ticks[offset]!)
      const upperTick = parseTick(ticks[offset + 1]!)

      lockedPositionsWithTicks[i] = {
        ...lockedPositions[i],
        lowerTick: lowerTick,
        upperTick: upperTick,
        ticksLoading: false
      }
      offset += 2
    }

    yield* put(
      poolsActions.getPoolsDataForList({
        addresses: Array.from(pools),
        listType: ListType.POSITIONS
      })
    )

    const pattern: GuardPredicate<PayloadAction<ListPoolsResponse>> = (
      action
    ): action is PayloadAction<ListPoolsResponse> => {
      return (
        typeof action?.payload?.listType !== 'undefined' &&
        action.payload.listType === ListType.POSITIONS
      )
    }

    yield* take(pattern)

    yield* put(actions.setLockedPositionsList(lockedPositionsWithTicks))
    yield* put(actions.setPositionsList([positionsWithTicks, { head, bump }, true]))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* put(actions.setLockedPositionsList([]))
    yield* put(actions.setPositionsList([[], { head: 0, bump: 0 }, false]))

    yield* call(handleRpcError, error.message)
  }
}

export function* handleClaimFeeWithETH({ index, isLocked }: { index: number; isLocked: boolean }) {
  const loaderClaimFee = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    yield put(
      snackbarsActions.add({
        message: 'Claiming fee...',
        variant: 'pending',
        persist: true,
        key: loaderClaimFee
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const lockerProgram = yield* call(getLockerProgram, networkType, rpc, wallet as IWallet)

    const data = isLocked ? lockedPositionsWithPoolsData : positionsWithPoolsData
    const allPositionsData = yield* select(data)
    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)

    const wrappedEthAccount = Keypair.generate()

    const net = networkTypetoProgramNetwork(networkType)

    const { createIx, initIx, unwrapIx } = createNativeAtaInstructions(
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      net
    )

    const poolForIndex = allPositionsData[index].poolData
    const position = allPositionsData[index]

    let userTokenX =
      allTokens[poolForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[poolForIndex.tokenX.toString()]
          ? tokensAccounts[poolForIndex.tokenX.toString()].address
          : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, poolForIndex.tokenX)
    }

    let userTokenY =
      allTokens[poolForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[poolForIndex.tokenY.toString()]
          ? tokensAccounts[poolForIndex.tokenY.toString()].address
          : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, poolForIndex.tokenY)
    }

    const tx = new Transaction().add(createIx).add(initIx)

    if (isLocked) {
      const ix = yield* call(
        [lockerProgram, lockerProgram.claimFeeIx],
        {
          authorityListIndex: index,
          market: marketProgram as any,
          pair: new Pair(poolForIndex.tokenX, poolForIndex.tokenY, {
            fee: poolForIndex.fee,
            tickSpacing: poolForIndex.tickSpacing
          }),
          userTokenX,
          userTokenY
        },
        wallet.publicKey
      )
      tx.add(...ix).add(unwrapIx)
    } else {
      const ix = yield* call(
        [marketProgram, marketProgram.claimFeeIx],
        {
          pair: new Pair(poolForIndex.tokenX, poolForIndex.tokenY, {
            fee: poolForIndex.fee,
            tickSpacing: poolForIndex.tickSpacing
          }),
          userTokenX,
          userTokenY,
          owner: wallet.publicKey,
          index: index
        },
        {
          position: position,
          pool: poolForIndex,
          tokenXProgram: allTokens[poolForIndex.tokenX.toString()].tokenProgram,
          tokenYProgram: allTokens[poolForIndex.tokenY.toString()].tokenProgram
        }
      )
      tx.add(ix).add(unwrapIx)
    }

    const blockhash = yield* call([connection, connection.getLatestBlockhash])
    tx.recentBlockhash = blockhash.blockhash
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))
    ;(signedTx as Transaction).partialSign(wrappedEthAccount)

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to claim fee. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(actions.getPositionsList())

      yield put(
        snackbarsActions.add({
          message: 'Fee claimed successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )
    }

    yield put(actions.getSinglePosition({ index, isLocked }))

    closeSnackbar(loaderClaimFee)
    yield put(snackbarsActions.remove(loaderClaimFee))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    closeSnackbar(loaderClaimFee)
    yield put(snackbarsActions.remove(loaderClaimFee))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )
      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleClaimFee(action: PayloadAction<{ index: number; isLocked: boolean }>) {
  const loaderClaimFee = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const allTokens = yield* select(tokens)
    const data = action.payload.isLocked ? lockedPositionsWithPoolsData : positionsWithPoolsData
    const allPositionsData = yield* select(data)
    const position = allPositionsData[action.payload.index]
    const poolForIndex = position.poolData

    if (
      allTokens[poolForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS ||
      allTokens[poolForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
    ) {
      return yield* call(handleClaimFeeWithETH, action.payload)
    }

    yield put(
      snackbarsActions.add({
        message: 'Claiming fee...',
        variant: 'pending',
        persist: true,
        key: loaderClaimFee
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const lockerProgram = yield* call(getLockerProgram, networkType, rpc, wallet as IWallet)

    const tokensAccounts = yield* select(accounts)

    let userTokenX = tokensAccounts[poolForIndex.tokenX.toString()]
      ? tokensAccounts[poolForIndex.tokenX.toString()].address
      : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, poolForIndex.tokenX)
    }

    let userTokenY = tokensAccounts[poolForIndex.tokenY.toString()]
      ? tokensAccounts[poolForIndex.tokenY.toString()].address
      : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, poolForIndex.tokenY)
    }

    const tx = new Transaction()

    if (action.payload.isLocked) {
      const ix = yield* call(
        [lockerProgram, lockerProgram.claimFeeIx],
        {
          authorityListIndex: action.payload.index,
          market: marketProgram as any,
          pair: new Pair(poolForIndex.tokenX, poolForIndex.tokenY, {
            fee: poolForIndex.fee,
            tickSpacing: poolForIndex.tickSpacing
          }),
          userTokenX,
          userTokenY
        },
        wallet.publicKey
      )
      tx.add(...ix)
    } else {
      const ix = yield* call(
        [marketProgram, marketProgram.claimFeeIx],
        {
          pair: new Pair(poolForIndex.tokenX, poolForIndex.tokenY, {
            fee: poolForIndex.fee,
            tickSpacing: poolForIndex.tickSpacing
          }),
          userTokenX,
          userTokenY,
          owner: wallet.publicKey,
          index: action.payload.index
        },
        {
          position: position,
          pool: poolForIndex,
          tokenXProgram: allTokens[poolForIndex.tokenX.toString()].tokenProgram,
          tokenYProgram: allTokens[poolForIndex.tokenY.toString()].tokenProgram
        }
      )
      tx.add(ix)
    }

    const blockhash = yield* call([connection, connection.getLatestBlockhash])
    tx.recentBlockhash = blockhash.blockhash
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to claim fee. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(actions.getPositionsList())

      yield put(
        snackbarsActions.add({
          message: 'Fee claimed successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )
    }

    yield put(actions.getSinglePosition(action.payload))

    closeSnackbar(loaderClaimFee)
    yield put(snackbarsActions.remove(loaderClaimFee))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    closeSnackbar(loaderClaimFee)
    yield put(snackbarsActions.remove(loaderClaimFee))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )

      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleClaimAllFees() {
  const loaderClaimAllFees = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const allPositionsData = yield* select(positionsWithPoolsData)
    const tokensAccounts = yield* select(accounts)

    if (allPositionsData.length === 0) {
      return
    }
    if (allPositionsData.length === 1) {
      const claimFeeAction = actions.claimFee({ index: 0, isLocked: false })
      return yield* call(handleClaimFee, claimFeeAction)
    }

    yield* put(actions.setAllClaimLoader(true))
    yield put(
      snackbarsActions.add({
        message: 'Claiming all fees',
        variant: 'pending',
        persist: true,
        key: loaderClaimAllFees
      })
    )

    for (const position of allPositionsData) {
      const pool = allPositionsData[position.positionIndex].poolData

      if (!tokensAccounts[pool.tokenX.toString()]) {
        yield* call(createAccount, pool.tokenX)
      }
      if (!tokensAccounts[pool.tokenY.toString()]) {
        yield* call(createAccount, pool.tokenY)
      }
    }

    const formattedPositions = allPositionsData.map(position => ({
      pair: new Pair(position.poolData.tokenX, position.poolData.tokenY, {
        fee: position.poolData.fee,
        tickSpacing: position.poolData.tickSpacing
      }),
      index: position.positionIndex,
      lowerTickIndex: position.lowerTickIndex,
      upperTickIndex: position.upperTickIndex
    }))

    const txs = yield* call([marketProgram, marketProgram.claimAllFeesTxs], {
      owner: wallet.publicKey,
      positions: formattedPositions
    } as ClaimAllFee)

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    for (const { tx, additionalSigner } of txs) {
      const blockhash = yield* call([connection, connection.getLatestBlockhash])
      tx.recentBlockhash = blockhash.blockhash
      tx.feePayer = wallet.publicKey

      let signedTx: Transaction
      if (additionalSigner) {
        const partiallySignedTx = yield* call([wallet, wallet.signTransaction], tx)
        partiallySignedTx.partialSign(additionalSigner)
        signedTx = partiallySignedTx
      } else {
        signedTx = yield* call([wallet, wallet.signTransaction], tx)
      }

      const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
        skipPreflight: false
      })

      if (!txid.length) {
        yield put(
          snackbarsActions.add({
            message: 'Failed to claim some fees. Please try again.',
            variant: 'error',
            persist: false,
            txid
          })
        )
      }
    }

    yield put(
      snackbarsActions.add({
        message: 'All fees claimed successfully.',
        variant: 'success',
        persist: false
      })
    )

    for (const position of formattedPositions) {
      yield put(actions.getSinglePosition({ index: position.index, isLocked: false }))
    }

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))
    closeSnackbar(loaderClaimAllFees)
    yield put(snackbarsActions.remove(loaderClaimAllFees))

    yield put(actions.getPositionsList())

    yield* put(actions.setAllClaimLoader(false))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* put(actions.setAllClaimLoader(false))

    closeSnackbar(loaderClaimAllFees)
    yield put(snackbarsActions.remove(loaderClaimAllFees))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )
      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to claim fees. Please try again.',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleClosePositionWithETH(data: ClosePositionData) {
  const loaderClosePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    yield put(
      snackbarsActions.add({
        message: 'Closing position...',
        variant: 'pending',
        persist: true,
        key: loaderClosePosition
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const allPositionsData = yield* select(positionsWithPoolsData)
    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)
    const userPositionList = yield* select(positionsList)

    const wrappedEthAccount = Keypair.generate()

    const net = networkTypetoProgramNetwork(networkType)

    const { createIx, initIx, unwrapIx } = createNativeAtaInstructions(
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      net
    )
    const position = allPositionsData[data.positionIndex]
    const poolForIndex = position.poolData

    let userTokenX =
      allTokens[poolForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[poolForIndex.tokenX.toString()]
          ? tokensAccounts[poolForIndex.tokenX.toString()].address
          : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, poolForIndex.tokenX)
    }

    let userTokenY =
      allTokens[poolForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[poolForIndex.tokenY.toString()]
          ? tokensAccounts[poolForIndex.tokenY.toString()].address
          : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, poolForIndex.tokenY)
    }

    const ix = yield* call(
      [marketProgram, marketProgram.removePositionIx],
      {
        pair: new Pair(poolForIndex.tokenX, poolForIndex.tokenY, {
          fee: poolForIndex.fee,
          tickSpacing: poolForIndex.tickSpacing
        }),
        owner: wallet.publicKey,
        index: data.positionIndex,
        userTokenX,
        userTokenY
      },
      {
        position: position,
        pool: poolForIndex,
        tokenXProgram: allTokens[poolForIndex.tokenX.toString()].tokenProgram,
        tokenYProgram: allTokens[poolForIndex.tokenY.toString()].tokenProgram,
        positionList: !userPositionList.loading ? userPositionList : undefined
      }
    )

    const tx: Transaction = new Transaction().add(createIx).add(initIx).add(ix).add(unwrapIx)

    const blockhash = yield* call([connection, connection.getLatestBlockhash])
    tx.recentBlockhash = blockhash.blockhash
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))
    ;(signedTx as Transaction).partialSign(wrappedEthAccount)

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    yield* call(sleep, 3000)

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to close position. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position closed successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )
    }

    yield put(actions.getPositionsList())

    data.onSuccess()

    closeSnackbar(loaderClosePosition)
    yield put(snackbarsActions.remove(loaderClosePosition))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    closeSnackbar(loaderClosePosition)
    yield put(snackbarsActions.remove(loaderClosePosition))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )
      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleClosePosition(action: PayloadAction<ClosePositionData>) {
  const loaderClosePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const allTokens = yield* select(tokens)
    const allPositionsData = yield* select(positionsWithPoolsData)
    const poolForIndex = allPositionsData[action.payload.positionIndex].poolData
    const position = allPositionsData[action.payload.positionIndex]

    if (
      allTokens[poolForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS ||
      allTokens[poolForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
    ) {
      return yield* call(handleClosePositionWithETH, action.payload)
    }

    yield put(
      snackbarsActions.add({
        message: 'Closing position...',
        variant: 'pending',
        persist: true,
        key: loaderClosePosition
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const tokensAccounts = yield* select(accounts)

    let userTokenX = tokensAccounts[poolForIndex.tokenX.toString()]
      ? tokensAccounts[poolForIndex.tokenX.toString()].address
      : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, poolForIndex.tokenX)
    }

    let userTokenY = tokensAccounts[poolForIndex.tokenY.toString()]
      ? tokensAccounts[poolForIndex.tokenY.toString()].address
      : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, poolForIndex.tokenY)
    }

    const ix = yield* call(
      [marketProgram, marketProgram.removePositionIx],
      {
        pair: new Pair(poolForIndex.tokenX, poolForIndex.tokenY, {
          fee: poolForIndex.fee,
          tickSpacing: poolForIndex.tickSpacing
        }),
        owner: wallet.publicKey,
        index: action.payload.positionIndex,
        userTokenX,
        userTokenY
      },
      {
        position,
        pool: poolForIndex,
        tokenXProgram: allTokens[poolForIndex.tokenX.toString()].tokenProgram,
        tokenYProgram: allTokens[poolForIndex.tokenY.toString()].tokenProgram
      }
    )

    const tx: Transaction = new Transaction().add(ix)

    const blockhash = yield* call([connection, connection.getLatestBlockhash])
    tx.recentBlockhash = blockhash.blockhash
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    yield* call(sleep, 3000)

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to close position. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position closed successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )
    }

    yield* put(actions.getPositionsList())

    action.payload.onSuccess()

    closeSnackbar(loaderClosePosition)
    yield put(snackbarsActions.remove(loaderClosePosition))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    closeSnackbar(loaderClosePosition)
    yield put(snackbarsActions.remove(loaderClosePosition))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )
      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleGetSinglePosition(
  action: PayloadAction<{ index: number; isLocked: boolean }>
) {
  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const lockerProgram = yield* call(getLockerProgram, networkType, rpc, wallet as IWallet)

    const [lockerAuth] = lockerProgram.getUserLocksAddress(wallet.publicKey)
    const poolsList = yield* select(poolsArraySortedByFees)

    const position = yield* call(
      [marketProgram, marketProgram.getPosition],
      action.payload.isLocked ? lockerAuth : wallet.publicKey,
      action.payload.index
    )

    const pool = poolsList.find(pool => pool.address.toString() === position.pool.toString())
    if (!pool) {
      return
    }

    const pair = new Pair(pool.tokenX, pool.tokenY, {
      fee: pool.fee,
      tickSpacing: pool.tickSpacing
    })

    yield put(poolsActions.getPoolData(pair))

    const { lowerTick, upperTick } = yield* all({
      lowerTick: call([marketProgram, marketProgram.getTick], pair, position.lowerTickIndex),
      upperTick: call([marketProgram, marketProgram.getTick], pair, position.upperTickIndex)
    })

    yield put(
      actions.setSinglePosition({
        index: action.payload.index,
        isLocked: action.payload.isLocked,
        position,
        lowerTick,
        upperTick
      })
    )
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* call(handleRpcError, error.message)
  }
}

export function* handleGetPosition(action: PayloadAction<string>) {
  try {
    const [id, poolAddress] = action.payload.split('_')

    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const position = yield* call(getPositionByIdAndPoolAddress, marketProgram, id, poolAddress)

    if (position) {
      yield* put(
        poolsActions.getPoolsDataForList({
          addresses: [position.pool.toString()],
          listType: ListType.POSITIONS
        })
      )
    }
    const poolsList = yield* select(poolsArraySortedByFees)

    const pool = poolsList.find(pool => pool.address.toString() === poolAddress.toString())
    if (!pool || !position) {
      return
    }

    const pair = new Pair(pool.tokenX, pool.tokenY, {
      fee: pool.fee,
      tickSpacing: pool.tickSpacing
    })

    const { lowerTick, upperTick } = yield* all({
      lowerTick: call([marketProgram, marketProgram.getTick], pair, position.lowerTickIndex),
      upperTick: call([marketProgram, marketProgram.getTick], pair, position.upperTickIndex)
    })

    yield* put(actions.setPosition({ ...position, lowerTick, upperTick, ticksLoading: false }))
  } catch {
    yield* put(actions.setPosition(null))
  }
}

export function* initPositionHandler(): Generator {
  yield* takeEvery(actions.initPosition, handleInitPosition)
}
export function* getCurrentPlotTicksHandler(): Generator {
  yield* takeLatest(actions.getCurrentPlotTicks, handleGetCurrentPlotTicks)
}
export function* getPositionsListHandler(): Generator {
  yield* takeLatest(actions.getPositionsList, handleGetPositionsList)
}
export function* claimFeeHandler(): Generator {
  yield* takeEvery(actions.claimFee, handleClaimFee)
}

export function* claimAllFeeHandler(): Generator {
  yield* takeEvery(actions.claimAllFee, handleClaimAllFees)
}

export function* closePositionHandler(): Generator {
  yield* takeEvery(actions.closePosition, handleClosePosition)
}
export function* getSinglePositionHandler(): Generator {
  yield* takeEvery(actions.getSinglePosition, handleGetSinglePosition)
}
export function* getPositionHandler(): Generator {
  yield* takeEvery(actions.getPosition, handleGetPosition)
}

export function* positionsSaga(): Generator {
  yield all(
    [
      initPositionHandler,
      getCurrentPlotTicksHandler,
      getPositionsListHandler,
      claimFeeHandler,
      claimAllFeeHandler,
      closePositionHandler,
      getSinglePositionHandler,
      getPositionHandler
    ].map(spawn)
  )
}
