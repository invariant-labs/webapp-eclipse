import { PayloadAction } from '@reduxjs/toolkit'
import { all, call, put, select, spawn, takeLatest } from 'typed-redux-saga'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getWallet } from './wallet'
import { getXInvtLockerProgram } from '@utils/web3/programs/amm'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { actions as RPCAction, RpcStatus } from '@store/reducers/solanaConnection'
import {
  APPROVAL_DENIED_MESSAGE,
  COMMON_ERROR_MESSAGE,
  ErrorCodeExtractionKeys,
  INVT_MAIN,
  SIGNING_SNACKBAR_CONFIG,
  TIMEOUT_ERROR_MESSAGE,
  xINVT_MAIN
} from '@store/consts/static'
import {
  sendAndConfirmRawTransaction,
  SendTransactionError,
  Transaction,
  TransactionExpiredTimeoutError
} from '@solana/web3.js'
import { getConnection, handleRpcError } from './connection'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import {
  createLoaderKey,
  ensureApprovalDenied,
  ensureError,
  extractErrorCode,
  extractRuntimeErrorCode,
  formatNumberWithoutSuffix,
  mapErrorCodeToMessage,
  printBN
} from '@utils/utils'
import { closeSnackbar } from 'notistack'
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { BN } from '@coral-xyz/anchor'
import { actions, LockLiquidityPayload } from '@store/reducers/xInvt'

export function* handleLock(action: PayloadAction<LockLiquidityPayload>) {
  const loaderLocking = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  const { amount: invtAmount } = action.payload

  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  const connection = yield* call(getConnection)
  const xInvtProgram = yield* call(getXInvtLockerProgram, networkType, rpc, wallet as IWallet)

  try {
    yield put(
      snackbarsActions.add({
        message: 'Locking INVT...',
        variant: 'pending',
        persist: true,
        key: loaderLocking
      })
    )

    const invtAta = getAssociatedTokenAddressSync(
      INVT_MAIN.address,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    )

    const xInvtAta = getAssociatedTokenAddressSync(
      xINVT_MAIN.address,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    )

    const mintIx = yield* call([xInvtProgram, xInvtProgram.mintIx], {
      amount: invtAmount,
      payer: wallet.publicKey,
      userTokenAccount: invtAta,
      userLockedTokenAccount: xInvtAta
    })

    const tx = new Transaction().add(mintIx)

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
      yield put(actions.setProgressState({ inProgress: false, success: false }))

      closeSnackbar(loaderLocking)
      yield put(snackbarsActions.remove(loaderLocking))
    } else {
      const txDetails = yield* call([connection, connection.getParsedTransaction], txid, {
        maxSupportedTransactionVersion: 0
      })

      if (txDetails) {
        if (txDetails.meta?.err) {
          if (txDetails.meta.logMessages) {
            const errorLog = txDetails.meta.logMessages.find(log =>
              log.includes(ErrorCodeExtractionKeys.ErrorNumber)
            )
            const errorCode = errorLog
              ?.split(ErrorCodeExtractionKeys.ErrorNumber)[1]
              .split(ErrorCodeExtractionKeys.Dot)[0]
              .trim()
            const message = mapErrorCodeToMessage(Number(errorCode))

            yield put(actions.setProgressState({ inProgress: false, success: false }))

            closeSnackbar(loaderLocking)
            yield put(snackbarsActions.remove(loaderLocking))
            closeSnackbar(loaderSigningTx)
            yield put(snackbarsActions.remove(loaderSigningTx))

            yield put(
              snackbarsActions.add({
                message,
                variant: 'error',
                persist: false
              })
            )
            return
          }
        }

        yield put(
          snackbarsActions.add({
            message: 'INVT locked successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )

        const meta = txDetails.meta

        if (meta?.preTokenBalances && meta.postTokenBalances) {
          const accountXPredicate = entry =>
            entry.mint === INVT_MAIN.address.toString() &&
            entry.owner === wallet.publicKey.toString()
          const accountYPredicate = entry =>
            entry.mint === xINVT_MAIN.address.toString() &&
            entry.owner === wallet.publicKey.toString()

          const preAccountX = meta.preTokenBalances.find(accountXPredicate)
          const postAccountX = meta.postTokenBalances.find(accountXPredicate)
          const preAccountY = meta.preTokenBalances.find(accountYPredicate)
          const postAccountY = meta.postTokenBalances.find(accountYPredicate)

          if (preAccountX && postAccountX && preAccountY && postAccountY) {
            const preAmountX = preAccountX.uiTokenAmount.amount
            const preAmountY = preAccountY.uiTokenAmount.amount
            const postAmountX = postAccountX.uiTokenAmount.amount
            const postAmountY = postAccountY.uiTokenAmount.amount

            const amountX = new BN(preAmountX).sub(new BN(postAmountX))
            const amountY = new BN(postAmountY).sub(new BN(preAmountY))

            try {
              yield put(
                snackbarsActions.add({
                  tokensDetails: {
                    ikonType: 'lock',
                    tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, INVT_MAIN.decimals)),
                    tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, xINVT_MAIN.decimals)),
                    tokenXIcon: INVT_MAIN.logoURI,
                    tokenYIcon: xINVT_MAIN.logoURI,
                    tokenXSymbol: INVT_MAIN.symbol ?? INVT_MAIN.address.toString(),
                    tokenYSymbol: xINVT_MAIN.symbol ?? xINVT_MAIN.address.toString()
                  },
                  persist: false
                })
              )
            } catch {}
          }
        }
      } else {
        yield put(
          snackbarsActions.add({
            message: 'INVT locked successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )
      }
    }

    yield put(actions.setProgressState({ inProgress: false, success: true }))

    closeSnackbar(loaderLocking)
    yield put(snackbarsActions.remove(loaderLocking))
  } catch (e: unknown) {
    yield put(actions.setProgressState({ inProgress: false, success: false }))

    const error = ensureError(e)
    console.log(error)

    let msg: string = ''
    if (error instanceof SendTransactionError) {
      const err = error.transactionError
      try {
        const errorCode = extractRuntimeErrorCode(err)
        msg = mapErrorCodeToMessage(errorCode)
      } catch {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      }
    } else {
      try {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      } catch (e: unknown) {
        const error = ensureError(e)
        msg = ensureApprovalDenied(error) ? APPROVAL_DENIED_MESSAGE : COMMON_ERROR_MESSAGE
      }
    }

    yield put(actions.setProgressState({ inProgress: false, success: false }))

    closeSnackbar(loaderLocking)
    yield put(snackbarsActions.remove(loaderLocking))
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
          message: msg,
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleUnlock(action: PayloadAction<LockLiquidityPayload>) {
  const loaderUnlocking = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  const { amount: xInvtAmount } = action.payload

  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  const connection = yield* call(getConnection)
  const xInvtProgram = yield* call(getXInvtLockerProgram, networkType, rpc, wallet as IWallet)

  try {
    yield put(
      snackbarsActions.add({
        message: 'Unlocking INVT...',
        variant: 'pending',
        persist: true,
        key: loaderUnlocking
      })
    )

    const invtAta = getAssociatedTokenAddressSync(
      INVT_MAIN.address,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    )

    const xInvtAta = getAssociatedTokenAddressSync(
      xINVT_MAIN.address,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    )

    const unstakeIx = yield* call([xInvtProgram, xInvtProgram.burnIx], {
      amount: xInvtAmount,
      payer: wallet.publicKey,
      userTokenAccount: invtAta,
      userLockedTokenAccount: xInvtAta
    })

    const tx = new Transaction().add(unstakeIx)

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
      yield put(actions.setProgressState({ inProgress: false, success: false }))

      closeSnackbar(loaderUnlocking)
      yield put(snackbarsActions.remove(loaderUnlocking))
    } else {
      const txDetails = yield* call([connection, connection.getParsedTransaction], txid, {
        maxSupportedTransactionVersion: 0
      })

      if (txDetails) {
        if (txDetails.meta?.err) {
          if (txDetails.meta.logMessages) {
            const errorLog = txDetails.meta.logMessages.find(log =>
              log.includes(ErrorCodeExtractionKeys.ErrorNumber)
            )
            const errorCode = errorLog
              ?.split(ErrorCodeExtractionKeys.ErrorNumber)[1]
              .split(ErrorCodeExtractionKeys.Dot)[0]
              .trim()
            const message = mapErrorCodeToMessage(Number(errorCode))

            yield put(actions.setProgressState({ inProgress: false, success: false }))

            closeSnackbar(loaderUnlocking)
            yield put(snackbarsActions.remove(loaderUnlocking))
            closeSnackbar(loaderSigningTx)
            yield put(snackbarsActions.remove(loaderSigningTx))

            yield put(
              snackbarsActions.add({
                message,
                variant: 'error',
                persist: false
              })
            )
            return
          }
        }

        yield put(
          snackbarsActions.add({
            message: 'INVT unlocked successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )

        const meta = txDetails.meta

        if (meta?.preTokenBalances && meta.postTokenBalances) {
          const accountXPredicate = entry =>
            entry.mint === xINVT_MAIN.address.toString() &&
            entry.owner === wallet.publicKey.toString()
          const accountYPredicate = entry =>
            entry.mint === INVT_MAIN.address.toString() &&
            entry.owner === wallet.publicKey.toString()

          const preAccountX = meta.preTokenBalances.find(accountXPredicate)
          const postAccountX = meta.postTokenBalances.find(accountXPredicate)
          const preAccountY = meta.preTokenBalances.find(accountYPredicate)
          const postAccountY = meta.postTokenBalances.find(accountYPredicate)

          if (preAccountX && postAccountX && preAccountY && postAccountY) {
            const preAmountX = preAccountX.uiTokenAmount.amount
            const preAmountY = preAccountY.uiTokenAmount.amount
            const postAmountX = postAccountX.uiTokenAmount.amount
            const postAmountY = postAccountY.uiTokenAmount.amount

            const amountX = new BN(preAmountX).sub(new BN(postAmountX))
            const amountY = new BN(postAmountY).sub(new BN(preAmountY))

            try {
              yield put(
                snackbarsActions.add({
                  tokensDetails: {
                    ikonType: 'unlock',
                    tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, xINVT_MAIN.decimals)),
                    tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, INVT_MAIN.decimals)),
                    tokenXIcon: xINVT_MAIN.logoURI,
                    tokenYIcon: INVT_MAIN.logoURI,
                    tokenXSymbol: xINVT_MAIN.symbol ?? xINVT_MAIN.address.toString(),
                    tokenYSymbol: INVT_MAIN.symbol ?? INVT_MAIN.address.toString()
                  },
                  persist: false
                })
              )
            } catch {}
          }
        }
      } else {
        yield put(
          snackbarsActions.add({
            message: 'INVT unlocked successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )
      }
    }

    yield put(actions.setProgressState({ inProgress: false, success: true }))

    closeSnackbar(loaderUnlocking)
    yield put(snackbarsActions.remove(loaderUnlocking))
  } catch (e: unknown) {
    yield put(actions.setProgressState({ inProgress: false, success: false }))

    const error = ensureError(e)
    console.log(error)

    let msg: string = ''
    if (error instanceof SendTransactionError) {
      const err = error.transactionError
      try {
        const errorCode = extractRuntimeErrorCode(err)
        msg = mapErrorCodeToMessage(errorCode)
      } catch {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      }
    } else {
      try {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      } catch (e: unknown) {
        const error = ensureError(e)
        msg = ensureApprovalDenied(error) ? APPROVAL_DENIED_MESSAGE : COMMON_ERROR_MESSAGE
      }
    }

    yield put(actions.setProgressState({ inProgress: false, success: false }))

    closeSnackbar(loaderUnlocking)
    yield put(snackbarsActions.remove(loaderUnlocking))
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
          message: msg,
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* getInvtStats() {
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  // const connection = yield* call(getConnection)
  const xInvtProgram = yield* call(getXInvtLockerProgram, networkType, rpc, wallet as IWallet)
  try {
    const invtState = yield* call([xInvtProgram, xInvtProgram.getState])

    // const stateAddress = xInvtProgram.getStateAddress()

    // console.log(stateAddress)

    // const tokenAccounts = yield* call(
    //   [connection, connection.getTokenAccountsByOwner],
    //   new PublicKey(BITZ_TOKENS_ADDR),
    //   {
    //     mint: BITZ_MAIN.address
    //   }
    // )

    // let totalBalance = 0n
    // for (const { account } of tokenAccounts.value) {
    //   const data = AccountLayout.decode(account.data)
    //   totalBalance += BigInt(data.amount.toString())
    // }

    // const stakedTokenSupplyAmount = +printBN(stakedTokenSupply, BITZ_MAIN.decimals)
    // const sBitzAmount = +printBN(stakedAmount, BITZ_MAIN.decimals)
    // const totalBitzSupply = +printBN(new BN(totalBalance), BITZ_MAIN.decimals)
    // const bitzSupplyAmount = +printBN(bitzSupply, BITZ_MAIN.decimals)
    // const response = yield* call(fetchMarketBitzStats)
    // const holders = response.data[sBITZ_MAIN.address.toString()].holders

    // const bitzAmount = totalBitzSupply - sBitzAmount

    // const marketCapSBitz = (Number(price) ?? 0) * stakedTokenSupplyAmount

    yield* put(
      actions.setCurrentStats({
        totalXInvt: +printBN(invtState.lockedInvt, xINVT_MAIN.decimals)
      })
    )
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* put(actions.setLoadingStats(false))

    yield* call(handleRpcError, error.message)
  }
}

export function* stakeHandler(): Generator {
  yield* takeLatest(actions.lock, handleLock)
}

export function* unstakeHandler(): Generator {
  yield* takeLatest(actions.unlock, handleUnlock)
}

export function* getInvtStatsHandler(): Generator {
  yield* takeLatest(actions.getCurrentStats, getInvtStats)
}

export function* xInvtSaga(): Generator {
  yield all([stakeHandler, unstakeHandler, getInvtStatsHandler].map(spawn))
}
