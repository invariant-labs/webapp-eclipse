import { PayloadAction } from '@reduxjs/toolkit'
import { actions, StakeLiquidityPayload } from '@store/reducers/sBitz'
import { all, call, put, select, spawn, takeLatest } from 'typed-redux-saga'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getWallet } from './wallet'
import { getStakingProgram } from '@utils/web3/programs/amm'
import { computeUnitsInstruction, IWallet } from '@invariant-labs/sdk-eclipse'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { actions as RPCAction, RpcStatus } from '@store/reducers/solanaConnection'
import {
  APPROVAL_DENIED_MESSAGE,
  BITZ_MAIN,
  COMMON_ERROR_MESSAGE,
  sBITZ_MAIN,
  SIGNING_SNACKBAR_CONFIG,
  TIMEOUT_ERROR_MESSAGE
} from '@store/consts/static'
import {
  Keypair,
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
  mapErrorCodeToMessage
} from '@utils/utils'
import { closeSnackbar } from 'notistack'
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { accounts } from '@store/selectors/solanaWallet'

export function* handleStake(action: PayloadAction<StakeLiquidityPayload>) {
  const loaderStaking = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  const { amount: bitzAmount } = action.payload

  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const walletAccounts = yield* select(accounts)
  const wallet = yield* call(getWallet)
  const connection = yield* call(getConnection)
  const stakingProgram = yield* call(getStakingProgram, networkType, rpc, wallet as IWallet)

  console.log(bitzAmount.toString())
  console.log(stakingProgram)

  try {
    yield put(
      snackbarsActions.add({
        message: 'Staking BITZ...',
        variant: 'pending',
        persist: true,
        key: loaderStaking
      })
    )

    const setCuIx = computeUnitsInstruction(1_700_000, wallet.publicKey)

    const ata = getAssociatedTokenAddressSync(
      BITZ_MAIN.address,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    )

    const stakeIx = yield* call([stakingProgram, stakingProgram.stakeIx], {
      amount: bitzAmount,
      mint: BITZ_MAIN.address,
      stakedMint: sBITZ_MAIN.address,
      createStakedATA: !walletAccounts[ata.toString()]
    })
    console.log(!walletAccounts[ata.toString()])

    const tx = new Transaction().add(setCuIx).add(...stakeIx)

    const { blockhash, lastValidBlockHeight } = yield* call([
      connection,
      connection.getLatestBlockhash
    ])
    tx.recentBlockhash = blockhash
    tx.lastValidBlockHeight = lastValidBlockHeight
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    console.log(stakeIx)

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    console.log(signedTx)
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    let txid: string
    txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })
    console.log(txid)

    const stakePda = yield* call([stakingProgram, stakingProgram.getStake], BITZ_MAIN.address)
    console.log(stakePda)

    if (!txid.length) {
      // yield put(action.setSwapSuccess(false))

      closeSnackbar(loaderStaking)
      yield put(snackbarsActions.remove(loaderStaking))

      return yield put(
        snackbarsActions.add({
          message: 'ETH wrapping failed. Please try again',
          variant: 'error',
          persist: false,
          txid: txid
        })
      )
    } else {
      const txDetails = yield* call([connection, connection.getParsedTransaction], txid, {
        maxSupportedTransactionVersion: 0
      })
      console.log(txDetails)
      // if (txDetails) {
      //   if (txDetails.meta?.err) {
      //     if (txDetails.meta.logMessages) {
      //       const errorLog = txDetails.meta.logMessages.find(log =>
      //         log.includes(ErrorCodeExtractionKeys.ErrorNumber)
      //       )
      //       const errorCode = errorLog
      //         ?.split(ErrorCodeExtractionKeys.ErrorNumber)[1]
      //         .split(ErrorCodeExtractionKeys.Dot)[0]
      //         .trim()
      //       const message = mapErrorCodeToMessage(Number(errorCode))
      //       // yield put(swapActions.setSwapSuccess(false))

      //       closeSnackbar(loaderStaking)
      //       yield put(snackbarsActions.remove(loaderStaking))
      //       closeSnackbar(loaderSigningTx)
      //       yield put(snackbarsActions.remove(loaderSigningTx))

      //       yield put(
      //         snackbarsActions.add({
      //           message,
      //           variant: 'error',
      //           persist: false
      //         })
      //       )
      //       return
      //     }
      //   }

      //   yield put(
      //     snackbarsActions.add({
      //       message: 'BITZ staked successfully',
      //       variant: 'success',
      //       persist: false,
      //       txid
      //     })
      //   )

      //   const meta = txDetails.meta
      //   if (meta?.preTokenBalances && meta.postTokenBalances) {
      //     // yield put(
      //     //   snackbarsActions.add({
      //     //     tokensDetails: {
      //     //       ikonType: 'swap',
      //     //       tokenXAmount: formatNumberWithoutSuffix(printBN(amountIn, tokenIn.decimals)),
      //     //       tokenYAmount: formatNumberWithoutSuffix(printBN(amountOut, tokenOut.decimals)),
      //     //       tokenXIcon: tokenIn.logoURI,
      //     //       tokenYIcon: tokenOut.logoURI,
      //     //       tokenXSymbol: tokenIn.symbol ?? tokenIn.address.toString(),
      //     //       tokenYSymbol: tokenOut.symbol ?? tokenOut.address.toString(),
      //     //       earnedPoints: points.eqn(0)
      //     //         ? undefined
      //     //         : formatNumberWithoutSuffix(printBN(points, LEADERBOARD_DECIMAL))
      //     //     },
      //     //     persist: false
      //     //   })
      //     // )
      //   }
      // } else {
      //   yield put(
      //     snackbarsActions.add({
      //       message: 'BITZ staked successfully',
      //       variant: 'success',
      //       persist: false,
      //       txid
      //     })
      //   )
      // }
    }

    closeSnackbar(loaderStaking)
    yield put(snackbarsActions.remove(loaderStaking))
  } catch (e: unknown) {
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

    // yield put(swapActions.setSwapSuccess(false))

    closeSnackbar(loaderStaking)
    yield put(snackbarsActions.remove(loaderStaking))
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

export function* stakeHandler(): Generator {
  yield* takeLatest(actions.stake, handleStake)
}

export function* stakeSaga(): Generator {
  yield all([stakeHandler].map(spawn))
}
