import { call, put, takeEvery, take, select, all, spawn, takeLatest } from 'typed-redux-saga'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions as poolsActions, ListPoolsResponse, ListType } from '@store/reducers/pools'
import { createAccount, getWallet, sleep } from './wallet'
import { getConnection, handleRpcError } from './connection'
import {
  actions,
  ClosePositionData,
  GetCurrentTicksData,
  InitPositionData
} from '@store/reducers/positions'
import { PayloadAction } from '@reduxjs/toolkit'
import { poolsArraySortedByFees, tokens } from '@store/selectors/pools'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { accounts } from '@store/selectors/solanaWallet'
import {
  Transaction,
  sendAndConfirmRawTransaction,
  Keypair,
  SystemProgram,
  TransactionExpiredTimeoutError
} from '@solana/web3.js'
import { NATIVE_MINT, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  SIGNING_SNACKBAR_CONFIG,
  TIMEOUT_ERROR_MESSAGE,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import {
  positionsList,
  positionsWithPoolsData,
  singlePositionData
} from '@store/selectors/positions'
import { GuardPredicate } from '@redux-saga/types'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { closeSnackbar } from 'notistack'
import { getMarketProgram } from '@utils/web3/programs/amm'
import {
  createLiquidityPlot,
  createLoaderKey,
  createPlaceholderLiquidityPlot,
  getLiquidityTicksByPositionsList,
  getPositionsAddressesFromRange
} from '@utils/utils'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
// import { createClaimAllPositionRewardsTx } from './farms'
// import { actions as farmsActions } from '@reducers/farms'
// import { stakesForPosition } from '@selectors/farms'
// import { getStakerProgram } from '@web3/programs/staker'
// import { Staker } from '@invariant-labs/staker-sdk'

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
        message: 'Creating pool',
        variant: 'pending',
        persist: true,
        key: loaderCreatePool
      })
    )

    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)

    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)

    const wrappedEthAccount = Keypair.generate()

    const createIx = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: wrappedEthAccount.publicKey,
      lamports: yield* call(Token.getMinBalanceRentForExemptAccount, connection),
      space: 165,
      programId: TOKEN_PROGRAM_ID
    })

    const transferIx = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: wrappedEthAccount.publicKey,
      lamports:
        allTokens[data.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
          ? data.xAmount
          : data.yAmount
    })

    const initIx = Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      NATIVE_MINT,
      wrappedEthAccount.publicKey,
      wallet.publicKey
    )

    const unwrapIx = Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      wallet.publicKey,
      []
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

    const { initPoolTx, initPoolSigners, initPositionTx } = yield* call(
      [marketProgram, marketProgram.initPoolAndPositionTx],
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
      }
    )

    combinedTransaction.add(createIx).add(transferIx).add(initIx).add(initPositionTx).add(unwrapIx)

    // const initialBlockhash = yield* call([connection, connection.getRecentBlockhash])
    // initialTx.recentBlockhash = initialBlockhash.blockhash
    // initialTx.feePayer = wallet.publicKey

    const initPoolBlockhash = yield* call([connection, connection.getRecentBlockhash])
    console.log(initPoolBlockhash)
    initPoolTx.recentBlockhash = initPoolBlockhash.blockhash
    initPoolTx.feePayer = wallet.publicKey

    const initPositionBlockhash = yield* call([connection, connection.getRecentBlockhash])
    console.log(initPositionBlockhash)
    combinedTransaction.recentBlockhash = initPositionBlockhash.blockhash
    combinedTransaction.feePayer = wallet.publicKey

    // const unwrapTx = new Transaction().add(unwrapIx)
    // const unwrapBlockhash = yield* call([connection, connection.getRecentBlockhash])
    // unwrapTx.recentBlockhash = unwrapBlockhash.blockhash
    // unwrapTx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const [signedCombinedTransactionTx, initPoolSignedTx] = yield* call(
      [wallet, wallet.signAllTransactions],
      // [initialTx, initPositionTx, unwrapTx, initPoolTx]
      [combinedTransaction, initPoolTx]
    )

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    // initialSignedTx.partialSign(wrappedEthAccount)
    signedCombinedTransactionTx.partialSign(wrappedEthAccount)

    if (initPoolSigners.length) {
      initPoolSignedTx.partialSign(...initPoolSigners)
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

    yield* call(sendAndConfirmRawTransaction, connection, initPoolSignedTx.serialize(), {
      skipPreflight: false
    })

    const initPositionTxid = yield* call(
      sendAndConfirmRawTransaction,
      connection,
      signedCombinedTransactionTx.serialize(),
      {
        skipPreflight: false
      }
    )

    if (!initPositionTxid.length) {
      yield put(actions.setInitPositionSuccess(false))

      closeSnackbar(loaderCreatePool)
      yield put(snackbarsActions.remove(loaderCreatePool))

      return yield put(
        snackbarsActions.add({
          message:
            // 'Position adding failed. Please unwrap wrapped ETH in your wallet and try again.',
            'Position adding failed. Please try again.',
          variant: 'error',
          persist: false,
          txid: initPositionTxid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position added successfully.',
          variant: 'success',
          persist: false,
          txid: initPositionTxid
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
  } catch (error) {
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
    } else {
      yield put(
        snackbarsActions.add({
          message:
            'Failed to send. Please unwrap wrapped SOL in your wallet if you have any and try again.',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, (error as Error).message)
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
        message: 'Creating position',
        variant: 'pending',
        persist: true,
        key: loaderCreatePosition
      })
    )

    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)

    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)

    const wrappedEthAccount = Keypair.generate()

    const createIx = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: wrappedEthAccount.publicKey,
      lamports: yield* call(Token.getMinBalanceRentForExemptAccount, connection),
      space: 165,
      programId: TOKEN_PROGRAM_ID
    })

    const transferIx = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: wrappedEthAccount.publicKey,
      lamports:
        allTokens[data.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
          ? data.xAmount
          : data.yAmount
    })

    const initIx = Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      NATIVE_MINT,
      wrappedEthAccount.publicKey,
      wallet.publicKey
    )

    const unwrapIx = Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      wallet.publicKey,
      []
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

    const initPositionTx = yield* call([marketProgram, marketProgram.initPositionTx], {
      pair: new Pair(data.tokenX, data.tokenY, { fee: data.fee, tickSpacing: data.tickSpacing }),
      userTokenX,
      userTokenY,
      lowerTick: data.lowerTick,
      upperTick: data.upperTick,
      liquidityDelta: data.liquidityDelta,
      owner: wallet.publicKey,
      slippage: data.slippage,
      knownPrice: data.knownPrice
    })

    combinedTransaction.add(initPositionTx)
    combinedTransaction.add(unwrapIx)

    const blockhash = yield* call([connection, connection.getRecentBlockhash])
    combinedTransaction.recentBlockhash = blockhash.blockhash
    combinedTransaction.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = yield* call([wallet, wallet.signTransaction], combinedTransaction)

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
          message: 'Position adding failed. Please try again.',
          variant: 'error',
          persist: false,
          txid: txId
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position added successfully.',
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
  } catch (error) {
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
    } else {
      yield put(
        snackbarsActions.add({
          message:
            'Failed to send. Please unwrap wrapped SOL in your wallet if you have any and try again.',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, (error as Error).message)
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
        message: 'Creating position',
        variant: 'pending',
        persist: true,
        key: loaderCreatePosition
      })
    )

    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)

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
    let initPoolTx: Transaction | null = null
    let poolSigners: Keypair[] = []

    if (action.payload.initPool) {
      const txs = yield* call([marketProgram, marketProgram.initPoolAndPositionTx], {
        pair: new Pair(action.payload.tokenX, action.payload.tokenY, {
          fee: action.payload.fee,
          tickSpacing: action.payload.tickSpacing
        }),
        userTokenX,
        userTokenY,
        lowerTick: action.payload.lowerTick,
        upperTick: action.payload.upperTick,
        liquidityDelta: action.payload.liquidityDelta,
        owner: wallet.publicKey,
        initTick: action.payload.initTick,
        slippage: action.payload.slippage,
        knownPrice: action.payload.knownPrice
      })
      tx = txs.initPositionTx
      initPoolTx = txs.initPoolTx
      poolSigners = txs.initPoolSigners
    } else {
      tx = yield* call([marketProgram, marketProgram.initPositionTx], {
        pair: new Pair(action.payload.tokenX, action.payload.tokenY, {
          fee: action.payload.fee,
          tickSpacing: action.payload.tickSpacing
        }),
        userTokenX,
        userTokenY,
        lowerTick: action.payload.lowerTick,
        upperTick: action.payload.upperTick,
        liquidityDelta: action.payload.liquidityDelta,
        owner: wallet.publicKey,
        slippage: action.payload.slippage,
        knownPrice: action.payload.knownPrice
      })
    }

    const blockhash = yield* call([connection, connection.getRecentBlockhash])
    tx.recentBlockhash = blockhash.blockhash
    tx.feePayer = wallet.publicKey

    if (initPoolTx) {
      initPoolTx.recentBlockhash = blockhash.blockhash
      initPoolTx.feePayer = wallet.publicKey

      yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

      const signedTx = yield* call([wallet, wallet.signTransaction], initPoolTx)

      closeSnackbar(loaderSigningTx)

      yield put(snackbarsActions.remove(loaderSigningTx))
      signedTx.partialSign(...poolSigners)

      yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
        skipPreflight: false
      })
    }

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = yield* call([wallet, wallet.signTransaction], tx)

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    yield put(actions.setInitPositionSuccess(!!txid.length))

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Position adding failed. Please try again.',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position added successfully.',
          variant: 'success',
          persist: false,
          txid
        })
      )

      yield put(actions.getPositionsList())
    }

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
  } catch (error) {
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
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again.',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, (error as Error).message)
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
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)

    const rawTicks = yield* call(
      [marketProgram, marketProgram.getAllTicks],
      new Pair(allPools[poolIndex].tokenX, allPools[poolIndex].tokenY, {
        fee: allPools[poolIndex].fee.v,
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

    yield put(actions.setPlotTicks({ allPlotTicks: ticksData, userPlotTicks: userTicks }))
  } catch (error) {
    console.log(error)
    const data = createPlaceholderLiquidityPlot(
      action.payload.isXtoY,
      10,
      allPools[poolIndex].tickSpacing,
      xDecimal,
      yDecimal
    )
    yield put(actions.setErrorPlotTicks(data))

    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* handleGetPositionsList() {
  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)
    const wallet = yield* call(getWallet)

    const { head } = yield* call([marketProgram, marketProgram.getPositionList], wallet.publicKey)

    const list = yield* call(
      [marketProgram, marketProgram.getPositionsFromRange],
      wallet.publicKey,
      0,
      head - 1
    )

    const addresses = yield* call(
      getPositionsAddressesFromRange,
      marketProgram,
      wallet.publicKey,
      0,
      head - 1
    )

    const positions = list.map((position, index) => ({
      ...position,
      address: addresses[index]
    }))

    const pools = new Set(list.map(pos => pos.pool.toString()))

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

    yield* put(actions.setPositionsList(positions))
  } catch (error) {
    yield* put(actions.setPositionsList([]))

    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* handleClaimFeeWithETH(positionIndex: number) {
  const loaderClaimFee = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    yield put(
      snackbarsActions.add({
        message: 'Claiming fee',
        variant: 'pending',
        persist: true,
        key: loaderClaimFee
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)
    const wallet = yield* call(getWallet)

    const allPositionsData = yield* select(positionsWithPoolsData)
    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)

    const wrappedEthAccount = Keypair.generate()

    const createIx = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: wrappedEthAccount.publicKey,
      lamports: yield* call(Token.getMinBalanceRentForExemptAccount, connection),
      space: 165,
      programId: TOKEN_PROGRAM_ID
    })

    const initIx = Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      NATIVE_MINT,
      wrappedEthAccount.publicKey,
      wallet.publicKey
    )

    const unwrapIx = Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      wallet.publicKey,
      []
    )

    const positionForIndex = allPositionsData[positionIndex].poolData

    let userTokenX =
      allTokens[positionForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[positionForIndex.tokenX.toString()]
          ? tokensAccounts[positionForIndex.tokenX.toString()].address
          : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, positionForIndex.tokenX)
    }

    let userTokenY =
      allTokens[positionForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[positionForIndex.tokenY.toString()]
          ? tokensAccounts[positionForIndex.tokenY.toString()].address
          : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, positionForIndex.tokenY)
    }

    const ix = yield* call([marketProgram, marketProgram.claimFeeInstruction], {
      pair: new Pair(positionForIndex.tokenX, positionForIndex.tokenY, {
        fee: positionForIndex.fee.v,
        tickSpacing: positionForIndex.tickSpacing
      }),
      userTokenX,
      userTokenY,
      owner: wallet.publicKey,
      index: positionIndex
    })

    const tx = new Transaction().add(createIx).add(initIx).add(ix).add(unwrapIx)

    const blockhash = yield* call([connection, connection.getRecentBlockhash])
    tx.recentBlockhash = blockhash.blockhash
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = yield* call([wallet, wallet.signTransaction], tx)

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    signedTx.partialSign(wrappedEthAccount)

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to claim fee. Please try again.',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Fee claimed successfully.',
          variant: 'success',
          persist: false,
          txid
        })
      )
    }

    yield put(actions.getSinglePosition(positionIndex))

    closeSnackbar(loaderClaimFee)
    yield put(snackbarsActions.remove(loaderClaimFee))
  } catch (error) {
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
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again.',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* handleClaimFee(action: PayloadAction<number>) {
  const loaderClaimFee = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const allTokens = yield* select(tokens)
    const allPositionsData = yield* select(positionsWithPoolsData)
    const positionForIndex = allPositionsData[action.payload].poolData

    if (
      allTokens[positionForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS ||
      allTokens[positionForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
    ) {
      return yield* call(handleClaimFeeWithETH, action.payload)
    }

    yield put(
      snackbarsActions.add({
        message: 'Claiming fee',
        variant: 'pending',
        persist: true,
        key: loaderClaimFee
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)
    const wallet = yield* call(getWallet)

    const tokensAccounts = yield* select(accounts)

    let userTokenX = tokensAccounts[positionForIndex.tokenX.toString()]
      ? tokensAccounts[positionForIndex.tokenX.toString()].address
      : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, positionForIndex.tokenX)
    }

    let userTokenY = tokensAccounts[positionForIndex.tokenY.toString()]
      ? tokensAccounts[positionForIndex.tokenY.toString()].address
      : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, positionForIndex.tokenY)
    }

    const ix = yield* call([marketProgram, marketProgram.claimFeeInstruction], {
      pair: new Pair(positionForIndex.tokenX, positionForIndex.tokenY, {
        fee: positionForIndex.fee.v,
        tickSpacing: positionForIndex.tickSpacing
      }),
      userTokenX,
      userTokenY,
      owner: wallet.publicKey,
      index: action.payload
    })

    const tx = new Transaction().add(ix)

    const blockhash = yield* call([connection, connection.getRecentBlockhash])
    tx.recentBlockhash = blockhash.blockhash
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = yield* call([wallet, wallet.signTransaction], tx)

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to claim fee. Please try again.',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Fee claimed successfully.',
          variant: 'success',
          persist: false,
          txid
        })
      )
    }

    yield put(actions.getSinglePosition(action.payload))

    closeSnackbar(loaderClaimFee)
    yield put(snackbarsActions.remove(loaderClaimFee))
  } catch (error) {
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
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again.',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* handleClosePositionWithETH(data: ClosePositionData) {
  const loaderClosePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    yield put(
      snackbarsActions.add({
        message: 'Closing position',
        variant: 'pending',
        persist: true,
        key: loaderClosePosition
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)
    const wallet = yield* call(getWallet)

    const allPositionsData = yield* select(positionsWithPoolsData)
    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)

    const wrappedEthAccount = Keypair.generate()

    const createIx = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: wrappedEthAccount.publicKey,
      lamports: yield* call(Token.getMinBalanceRentForExemptAccount, connection),
      space: 165,
      programId: TOKEN_PROGRAM_ID
    })

    const initIx = Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      NATIVE_MINT,
      wrappedEthAccount.publicKey,
      wallet.publicKey
    )

    const unwrapIx = Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      wallet.publicKey,
      []
    )

    const positionForIndex = allPositionsData[data.positionIndex].poolData

    let userTokenX =
      allTokens[positionForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[positionForIndex.tokenX.toString()]
          ? tokensAccounts[positionForIndex.tokenX.toString()].address
          : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, positionForIndex.tokenX)
    }

    let userTokenY =
      allTokens[positionForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[positionForIndex.tokenY.toString()]
          ? tokensAccounts[positionForIndex.tokenY.toString()].address
          : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, positionForIndex.tokenY)
    }

    // const positionStakes = yield* select(
    //   stakesForPosition(allPositionsData[data.positionIndex].address)
    // )
    // const stakerProgram = yield* call(getStakerProgram, networkType, rpc)
    // for (const stake of positionStakes) {
    //   yield* call(unsub, stakerProgram, stake.address)
    // }

    const ix = yield* call([marketProgram, marketProgram.removePositionInstruction], {
      pair: new Pair(positionForIndex.tokenX, positionForIndex.tokenY, {
        fee: positionForIndex.fee.v,
        tickSpacing: positionForIndex.tickSpacing
      }),
      owner: wallet.publicKey,
      index: data.positionIndex,
      userTokenX,
      userTokenY
    })

    // let tx: Transaction

    // if (data.claimFarmRewards) {
    //   const claimTx = yield* call(createClaimAllPositionRewardsTx, data.positionIndex)

    //   tx = claimTx.add(createIx).add(initIx).add(ix).add(unwrapIx)
    // } else {
    const tx: Transaction = new Transaction().add(createIx).add(initIx).add(ix).add(unwrapIx)
    // }

    const blockhash = yield* call([connection, connection.getRecentBlockhash])
    tx.recentBlockhash = blockhash.blockhash
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = yield* call([wallet, wallet.signTransaction], tx)

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    signedTx.partialSign(wrappedEthAccount)

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    yield* call(sleep, 3000)

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to close position. Please try again.',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position closed successfully.',
          variant: 'success',
          persist: false,
          txid
        })
      )
    }

    yield put(actions.getPositionsList())
    // yield* put(farmsActions.getUserStakes())

    data.onSuccess()

    closeSnackbar(loaderClosePosition)
    yield put(snackbarsActions.remove(loaderClosePosition))
  } catch (error) {
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
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again.',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, (error as Error).message)
  }
}

// const unsub = async (stakerProgram: Staker, key: PublicKey) => {
//   try {
//     await stakerProgram.program.account.userStake.unsubscribe(key)
//   } catch (error) {
//     console.log(error)
//   }
// }

export function* handleClosePosition(action: PayloadAction<ClosePositionData>) {
  const loaderClosePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const allTokens = yield* select(tokens)
    const allPositionsData = yield* select(positionsWithPoolsData)
    const positionForIndex = allPositionsData[action.payload.positionIndex].poolData

    if (
      allTokens[positionForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS ||
      allTokens[positionForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
    ) {
      return yield* call(handleClosePositionWithETH, action.payload)
    }

    yield put(
      snackbarsActions.add({
        message: 'Closing position',
        variant: 'pending',
        persist: true,
        key: loaderClosePosition
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)
    const wallet = yield* call(getWallet)

    const tokensAccounts = yield* select(accounts)

    let userTokenX = tokensAccounts[positionForIndex.tokenX.toString()]
      ? tokensAccounts[positionForIndex.tokenX.toString()].address
      : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, positionForIndex.tokenX)
    }

    let userTokenY = tokensAccounts[positionForIndex.tokenY.toString()]
      ? tokensAccounts[positionForIndex.tokenY.toString()].address
      : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, positionForIndex.tokenY)
    }

    // const positionStakes = yield* select(
    //   stakesForPosition(allPositionsData[action.payload.positionIndex].address)
    // )
    // const stakerProgram = yield* call(getStakerProgram, networkType, rpc)

    // for (const stake of positionStakes) {
    //   yield* call(unsub, stakerProgram, stake.address)
    // }

    const ix = yield* call([marketProgram, marketProgram.removePositionInstruction], {
      pair: new Pair(positionForIndex.tokenX, positionForIndex.tokenY, {
        fee: positionForIndex.fee.v,
        tickSpacing: positionForIndex.tickSpacing
      }),
      owner: wallet.publicKey,
      index: action.payload.positionIndex,
      userTokenX,
      userTokenY
    })

    // let tx: Transaction

    // if (action.payload.claimFarmRewards) {
    //   const claimTx = yield* call(createClaimAllPositionRewardsTx, action.payload.positionIndex)

    //   tx = claimTx.add(ix)
    // } else {
    const tx: Transaction = new Transaction().add(ix)
    // }

    const blockhash = yield* call([connection, connection.getRecentBlockhash])
    tx.recentBlockhash = blockhash.blockhash
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = yield* call([wallet, wallet.signTransaction], tx)

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    yield* call(sleep, 3000)

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to close position. Please try again.',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position closed successfully.',
          variant: 'success',
          persist: false,
          txid
        })
      )
    }

    yield* put(actions.getPositionsList())
    // yield* put(farmsActions.getUserStakes())

    action.payload.onSuccess()

    closeSnackbar(loaderClosePosition)
    yield put(snackbarsActions.remove(loaderClosePosition))
  } catch (error) {
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
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again.',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* handleGetSinglePosition(action: PayloadAction<number>) {
  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)
    const wallet = yield* call(getWallet)

    const position = yield* call(
      [marketProgram, marketProgram.getPosition],
      wallet.publicKey,
      action.payload
    )

    yield put(
      actions.setSinglePosition({
        index: action.payload,
        position
      })
    )

    yield put(actions.getCurrentPositionRangeTicks(position.id.toString()))
  } catch (error) {
    console.log(error)

    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* handleGetCurrentPositionRangeTicks(action: PayloadAction<string>) {
  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)

    const positionData = yield* select(singlePositionData(action.payload))

    if (typeof positionData === 'undefined') {
      return
    }

    const pair = new Pair(positionData.poolData.tokenX, positionData.poolData.tokenY, {
      fee: positionData.poolData.fee.v,
      tickSpacing: positionData.poolData.tickSpacing
    })

    const lowerTick = yield* call(
      [marketProgram, marketProgram.getTick],
      pair,
      positionData.lowerTickIndex
    )

    const upperTick = yield* call(
      [marketProgram, marketProgram.getTick],
      pair,
      positionData.upperTickIndex
    )

    yield put(
      actions.setCurrentPositionRangeTicks({
        lowerTick,
        upperTick
      })
    )
  } catch (error) {
    console.log(error)

    yield* call(handleRpcError, (error as Error).message)
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
export function* closePositionHandler(): Generator {
  yield* takeEvery(actions.closePosition, handleClosePosition)
}
export function* getSinglePositionHandler(): Generator {
  yield* takeEvery(actions.getSinglePosition, handleGetSinglePosition)
}
export function* getCurrentPositionRangeTicksHandler(): Generator {
  yield* takeEvery(actions.getCurrentPositionRangeTicks, handleGetCurrentPositionRangeTicks)
}

export function* positionsSaga(): Generator {
  yield all(
    [
      initPositionHandler,
      getCurrentPlotTicksHandler,
      getPositionsListHandler,
      claimFeeHandler,
      closePositionHandler,
      getSinglePositionHandler,
      getCurrentPositionRangeTicksHandler
    ].map(spawn)
  )
}
