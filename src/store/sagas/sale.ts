import { call, put, all, spawn, takeLatest, select } from 'typed-redux-saga'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import { PayloadAction } from '@reduxjs/toolkit'
import {
  sendAndConfirmRawTransaction,
  Transaction,
  TransactionExpiredTimeoutError
} from '@solana/web3.js'
import { handleRpcError } from './connection'
import { getWallet } from './wallet'
import { actions, IDepositSale, ISaleStats, IUserStats } from '@store/reducers/sale'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getSaleProgram } from '@utils/web3/programs/sale'
import { getSolanaConnection } from '@utils/web3/connection'
import {
  createLoaderKey,
  ensureError,
  fetchProofOfInclusion,
  formatNumberWithoutSuffix,
  printBN
} from '@utils/utils'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import {
  DEFAULT_PUBLICKEY,
  PROOF_OF_INCLUSION_CACHE_KEY,
  PROOF_OF_INCLUSION_CACHE_TTL,
  SIGNING_SNACKBAR_CONFIG,
  TIMEOUT_ERROR_MESSAGE,
  USDC_MAIN
} from '@store/consts/static'
import { closeSnackbar } from 'notistack'
import { actions as connectionActions, RpcStatus } from '@store/reducers/solanaConnection'
import { REWARD_SCALE } from '@invariant-labs/sale-sdk'
import { BN } from '@coral-xyz/anchor'

export function* fetchUserStats() {
  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    if (!wallet || !wallet.publicKey || wallet.publicKey.equals(DEFAULT_PUBLICKEY)) {
      yield* put(
        actions.setUserStats({
          deposited: new BN(0),
          received: new BN(0)
        })
      )
      return
    }
    const sale = yield* call(getSaleProgram, networkType, rpc, wallet as IWallet)

    const userBalance = yield* call([sale, sale.getUserBalance], wallet.publicKey)
    const userStats: IUserStats = {
      deposited: userBalance.deposited,
      received: userBalance.received
    }

    yield* put(actions.setUserStats({ ...userStats }))
  } catch (error) {
    yield* put(actions.setSaleStats(null))
    yield* put(
      actions.setUserStats({
        deposited: new BN(0),
        received: new BN(0)
      })
    )
    console.log(error)
    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* fetchSaleStats() {
  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const sale = yield* call(getSaleProgram, networkType, rpc, wallet as IWallet)

    const saleState = yield* call([sale, sale.getSale])
    const saleStats: ISaleStats = {
      whitelistWalletLimit: saleState.whitelistWalletLimit,
      currentAmount: saleState.currentAmount,
      targetAmount: saleState.targetAmount,
      startTimestamp: saleState.startTimestamp,
      duration: saleState.duration,
      mint: saleState.mint
    }

    yield* put(actions.setSaleStats({ saleStats }))
  } catch (error) {
    yield* put(actions.setSaleStats(null))
    console.log(error)
    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* depositSale(action: PayloadAction<IDepositSale>) {
  const loaderDepositSale = createLoaderKey()
  const loaderSigningTx = createLoaderKey()
  try {
    yield put(
      snackbarsActions.add({
        message: 'Depositing to sale...',
        variant: 'pending',
        persist: true,
        key: loaderDepositSale
      })
    )

    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const connection = getSolanaConnection(rpc)
    const wallet = yield* call(getWallet)
    const sale = yield* call(getSaleProgram, networkType, rpc, wallet as IWallet)
    const { amount, mint, proofOfInclusion } = action.payload

    const ix = yield* call(
      [sale, sale.depositIx],
      { amount, mint, proofOfInclusion: Uint8Array.from(proofOfInclusion!) },
      wallet.publicKey
    )
    const tx = new Transaction().add(ix)
    const { blockhash, lastValidBlockHeight } = yield* call([
      connection,
      connection.getLatestBlockhash
    ])
    tx.recentBlockhash = blockhash
    tx.lastValidBlockHeight = lastValidBlockHeight
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
          message: 'Failed to deposit to sale',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          tokensDetails: {
            ikonType: 'deposit',
            tokenXAmount: formatNumberWithoutSuffix(printBN(amount, REWARD_SCALE)),
            tokenXIcon: USDC_MAIN.logoURI,
            tokenXSymbol: USDC_MAIN.symbol
          },
          persist: false,
          txid
        })
      )
    }
    yield* put(actions.getSaleStats())
    yield* put(actions.getUserStats())
    yield* put(actions.setDepositSuccess(true))
    closeSnackbar(loaderDepositSale)
    yield put(snackbarsActions.remove(loaderDepositSale))
  } catch (e) {
    yield* put(actions.getSaleStats())
    yield* put(actions.getUserStats())
    yield* put(actions.setDepositSuccess(false))
    const error = ensureError(e)
    closeSnackbar(loaderDepositSale)
    yield put(snackbarsActions.remove(loaderDepositSale))
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
      yield put(connectionActions.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Failed to send. Please try again',
          variant: 'error',
          persist: false
        })
      )
    }
    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* getProof(): Generator {
  const wallet = yield* call(getWallet)
  const address = wallet.publicKey.toBase58()

  const lsKey = `${PROOF_OF_INCLUSION_CACHE_KEY}-${address}`
  const currentTimestamp = +Date.now()

  try {
    const cachedProof = localStorage.getItem(lsKey)
    const cachedTimestamp = localStorage.getItem(`${lsKey}-timestamp`)

    if (cachedTimestamp && +cachedTimestamp > currentTimestamp - PROOF_OF_INCLUSION_CACHE_TTL) {
      const proof = Array.from(new Uint8Array(JSON.parse(cachedProof!)))
      yield* put(actions.setProofOfInclusion(proof))
      return
    }
  } catch {
    // Fallback to fetching proof if localStorage read fails
  }

  const proof = yield* call(fetchProofOfInclusion, wallet.publicKey.toBase58())

  try {
    localStorage.setItem(lsKey, JSON.stringify(Array.from(proof)))
    localStorage.setItem(`${lsKey}-timestamp`, currentTimestamp.toString())
  } catch {
    // Fallback to not caching proof if localStorage write fails
  }

  yield* put(actions.setProofOfInclusion(Array.from(proof)))
}

export function* getProofHandler(): Generator {
  yield* takeLatest(actions.getProof, getProof)
}
export function* getUsetStatsHandler(): Generator {
  yield* takeLatest(actions.getUserStats, fetchUserStats)
}

export function* getSaleStatsHandler(): Generator {
  yield* takeLatest(actions.getSaleStats, fetchSaleStats)
}

export function* depositSaleHandler(): Generator {
  yield* takeLatest(actions.depositSale, depositSale)
}

export function* saleSaga(): Generator {
  yield all(
    [getUsetStatsHandler, getSaleStatsHandler, depositSaleHandler, getProofHandler].map(spawn)
  )
}
