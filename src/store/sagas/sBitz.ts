import { PayloadAction } from '@reduxjs/toolkit'
import { actions, StakeLiquidityPayload } from '@store/reducers/sBitz'
import { all, call, put, select, spawn, takeLatest } from 'typed-redux-saga'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getWallet } from './wallet'
import { getStakingProgram } from '@utils/web3/programs/amm'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { actions as RPCAction, RpcStatus } from '@store/reducers/solanaConnection'
import {
  APPROVAL_DENIED_MESSAGE,
  BITZ_MAIN,
  COMMON_ERROR_MESSAGE,
  ErrorCodeExtractionKeys,
  sBITZ_MAIN,
  SIGNING_SNACKBAR_CONFIG,
  TIMEOUT_ERROR_MESSAGE
} from '@store/consts/static'
import {
  PublicKey,
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
  getTokenPrice,
  mapErrorCodeToMessage,
  printBN
} from '@utils/utils'
import { closeSnackbar } from 'notistack'
import {
  AccountLayout,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { accounts } from '@store/selectors/solanaWallet'
import { BN } from '@coral-xyz/anchor'
import { getBitzSupply } from '@invariant-labs/sbitz'
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

  try {
    yield put(
      snackbarsActions.add({
        message: 'Staking BITZ...',
        variant: 'pending',
        persist: true,
        key: loaderStaking
      })
    )

    const ata = getAssociatedTokenAddressSync(
      sBITZ_MAIN.address,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    )

    const stakeIx = yield* call(
      [stakingProgram, stakingProgram.stakeIx],
      {
        amount: bitzAmount,
        mint: BITZ_MAIN.address,
        stakedMint: sBITZ_MAIN.address,
        createStakedATA: !walletAccounts[ata.toString()]
      },
      wallet.publicKey
    )

    const tx = new Transaction().add(...stakeIx)

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

      closeSnackbar(loaderStaking)
      yield put(snackbarsActions.remove(loaderStaking))
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

            closeSnackbar(loaderStaking)
            yield put(snackbarsActions.remove(loaderStaking))
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
            message: 'BITZ staked successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )

        const meta = txDetails.meta

        if (meta?.preTokenBalances && meta.postTokenBalances) {
          const accountXPredicate = entry =>
            entry.mint === BITZ_MAIN.address.toString() &&
            entry.owner === wallet.publicKey.toString()
          const accountYPredicate = entry =>
            entry.mint === sBITZ_MAIN.address.toString() &&
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
                    ikonType: 'stake',
                    tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, BITZ_MAIN.decimals)),
                    tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, sBITZ_MAIN.decimals)),
                    tokenXIcon: BITZ_MAIN.logoURI,
                    tokenYIcon: sBITZ_MAIN.logoURI,
                    tokenXSymbol: BITZ_MAIN.symbol ?? BITZ_MAIN.address.toString(),
                    tokenYSymbol: sBITZ_MAIN.symbol ?? sBITZ_MAIN.address.toString()
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
            message: 'BITZ staked successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )
      }
    }

    yield put(actions.setProgressState({ inProgress: false, success: true }))

    closeSnackbar(loaderStaking)
    yield put(snackbarsActions.remove(loaderStaking))
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

export function* handleUnstake(action: PayloadAction<StakeLiquidityPayload>) {
  const loaderUnstaking = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  const { amount: sbitzAmount } = action.payload

  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const walletAccounts = yield* select(accounts)
  const wallet = yield* call(getWallet)
  const connection = yield* call(getConnection)
  const stakingProgram = yield* call(getStakingProgram, networkType, rpc, wallet as IWallet)
  try {
    yield put(
      snackbarsActions.add({
        message: 'Unstaking sBITZ...',
        variant: 'pending',
        persist: true,
        key: loaderUnstaking
      })
    )

    const ata = getAssociatedTokenAddressSync(
      BITZ_MAIN.address,
      wallet.publicKey,
      false,
      TOKEN_PROGRAM_ID
    )

    const unstakeIx = yield* call(
      [stakingProgram, stakingProgram.unstakeIx],
      {
        amount: sbitzAmount,
        mint: BITZ_MAIN.address,
        stakedMint: sBITZ_MAIN.address,
        createAta: !walletAccounts[ata.toString()]
      },
      wallet.publicKey
    )

    const tx = new Transaction().add(...unstakeIx)

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

      closeSnackbar(loaderUnstaking)
      yield put(snackbarsActions.remove(loaderUnstaking))
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

            closeSnackbar(loaderUnstaking)
            yield put(snackbarsActions.remove(loaderUnstaking))
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
            message: 'sBITZ unstaked successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )

        const meta = txDetails.meta

        if (meta?.preTokenBalances && meta.postTokenBalances) {
          const accountXPredicate = entry =>
            entry.mint === sBITZ_MAIN.address.toString() &&
            entry.owner === wallet.publicKey.toString()
          const accountYPredicate = entry =>
            entry.mint === BITZ_MAIN.address.toString() &&
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
                    ikonType: 'unstake',
                    tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, sBITZ_MAIN.decimals)),
                    tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, BITZ_MAIN.decimals)),
                    tokenXIcon: sBITZ_MAIN.logoURI,
                    tokenYIcon: BITZ_MAIN.logoURI,
                    tokenXSymbol: sBITZ_MAIN.symbol ?? sBITZ_MAIN.address.toString(),
                    tokenYSymbol: BITZ_MAIN.symbol ?? BITZ_MAIN.address.toString()
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
            message: 'sBITZ unstaked successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )
      }
    }

    yield put(actions.setProgressState({ inProgress: false, success: true }))

    closeSnackbar(loaderUnstaking)
    yield put(snackbarsActions.remove(loaderUnstaking))
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

    closeSnackbar(loaderUnstaking)
    yield put(snackbarsActions.remove(loaderUnstaking))
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

export function* handleGetStakedAmountAndBalance() {
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  const connection = yield* call(getConnection)

  const stakingProgram = yield* call(getStakingProgram, networkType, rpc, wallet as IWallet)
  try {
    const { stakedAmount, stakedTokenSupply } = yield* call([
      stakingProgram,
      stakingProgram.getStakedAmountAndStakedTokenSupply
    ])

    const [boost] = stakingProgram.getBoostAddressAndBump(BITZ_MAIN.address)
    const ata = getAssociatedTokenAddressSync(BITZ_MAIN.address, boost, true)
    const bitzAccountAmountInfo = yield* call([connection, connection.getTokenAccountBalance], ata)

    yield put(
      actions.setStakedAmountAndBalance({
        stakedAmount,
        stakedTokenSupply,
        bitzTotalBalance: bitzAccountAmountInfo.value.amount
      })
    )
  } catch (error: any) {
    console.error('Failed to get staked amount and balance:', error)
    yield put(
      actions.setStakedAmountAndBalance({
        stakedAmount: null,
        stakedTokenSupply: null,
        bitzTotalBalance: null
      })
    )
  }
}

export function* getMarketBitzStats(): Generator {
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  const connection = yield* call(getConnection)
  const price = yield* call(getTokenPrice, sBITZ_MAIN.address.toString(), networkType)
  const stakingProgram = yield* call(getStakingProgram, networkType, rpc, wallet as IWallet)
  const { holders } = yield* select(s => s.sBitz.bitzMarketData)
  try {
    const { stakedAmount, stakedTokenSupply } = yield* call([
      stakingProgram,
      stakingProgram.getStakedAmountAndStakedTokenSupply
    ])

    const bitzSupply = yield* call(getBitzSupply, connection)

    const programAddress = new PublicKey('5FgZ9W81khmNXG8i96HSsG7oJiwwpKnVzmHgn9ZnqQja')

    const tokenAccounts = yield* call(
      [connection, connection.getTokenAccountsByOwner],
      programAddress,
      {
        mint: BITZ_MAIN.address
      }
    )

    let totalBalance = 0n
    for (const { account } of tokenAccounts.value) {
      const data = AccountLayout.decode(account.data)
      totalBalance += BigInt(data.amount.toString())
    }

    const stakedTokenSupplyAmount = +printBN(stakedTokenSupply, BITZ_MAIN.decimals)
    const sBitzAmount = +printBN(stakedAmount, BITZ_MAIN.decimals)
    const totalBitzSupply = +printBN(totalBalance, BITZ_MAIN.decimals)
    const bitzSupplyAmount = +printBN(bitzSupply, BITZ_MAIN.decimals)
    // const { holders, accountSBitz, accountBitz ,totalBitzSupply  } =
    //   yield* call(fetchMarketBitzStats)

    // const bitzAmount = totalBitzSupply.data.tokens[0].balance - sBitzAmount
    const bitzAmount = totalBitzSupply - sBitzAmount

    // const supplySBitz = printBN(
    //   accountSBitz.data.tokenInfo.supply,
    //   accountSBitz.data.tokenInfo.decimals
    // )
    // const supplyBitz = printBN(
    //   accountBitz.data.tokenInfo.supply,
    //   accountBitz.data.tokenInfo.decimals
    // )
    // const marketCapSBitz =
    //   accountSBitz.metadata.tokens.sBTZcSwRZhRq3JcjFh1xwxgCxmsN7MreyU3Zx8dA8uF.price_usdt *
    //   Number(supplySBitz)

    const marketCapSBitz = (price ?? 0) * stakedTokenSupplyAmount

    yield* put(
      actions.setCurrentStats({
        bitzAmount,
        marketCap: marketCapSBitz,
        sBitzSupply: stakedTokenSupplyAmount,
        holders,
        totalSupply: bitzSupplyAmount,
        sBitzAmount
      })
    )
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* put(actions.setLoadingStats(false))

    yield* call(handleRpcError, error.message)
  }
}

export function* marketBitzStatsHandler(): Generator {
  yield* takeLatest(actions.getCurrentStats, getMarketBitzStats)
}

export function* stakeHandler(): Generator {
  yield* takeLatest(actions.stake, handleStake)
}

export function* unstakeHandler(): Generator {
  yield* takeLatest(actions.unstake, handleUnstake)
}

export function* stakedAmountAndBalanceHandler(): Generator {
  yield* takeLatest(actions.getStakedAmountAndBalance, handleGetStakedAmountAndBalance)
}

export function* stakeSaga(): Generator {
  yield all(
    [stakeHandler, unstakeHandler, stakedAmountAndBalanceHandler, marketBitzStatsHandler].map(spawn)
  )
}
