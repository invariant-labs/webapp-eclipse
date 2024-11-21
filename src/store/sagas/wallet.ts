import {
  all,
  call,
  delay,
  put,
  SagaGenerator,
  select,
  spawn,
  takeLatest,
  takeLeading
} from 'typed-redux-saga'
import {
  airdropQuantities,
  airdropTokens,
  NetworkType,
  WETH_MIN_FAUCET_FEE_MAIN,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import { Token as StoreToken } from '@store/consts/types'
import { BN } from '@coral-xyz/anchor'
import { actions as poolsActions } from '@store/reducers/pools'
import { actions as positionsActions } from '@store/reducers/positions'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions, ITokenAccount, Status } from '@store/reducers/solanaWallet'
import { tokens } from '@store/selectors/pools'
import { network } from '@store/selectors/solanaConnection'
import { accounts, balance, status } from '@store/selectors/solanaWallet'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import {
  ParsedAccountData,
  PublicKey,
  sendAndConfirmRawTransaction,
  Signer,
  SystemProgram,
  Transaction,
  AccountInfo,
  TransactionInstruction
} from '@solana/web3.js'
import { closeSnackbar } from 'notistack'
import { getConnection, handleRpcError } from './connection'
import { getTokenDetails } from './token'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { disconnectWallet, getSolanaWallet } from '@utils/web3/wallet'
import { WalletAdapter } from '@utils/web3/adapters/types'
import airdropAdmin from '@store/consts/airdropAdmin'
import { createLoaderKey, getTokenMetadata, getTokenProgramId } from '@utils/utils'
import { openWalletSelectorModal } from '@utils/web3/selector'
// import { actions as farmsActions } from '@reducers/farms'
// import { actions as bondsActions } from '@reducers/bonds'

export function* getWallet(): SagaGenerator<WalletAdapter> {
  const wallet = yield* call(getSolanaWallet)
  return wallet
}
export function* getBalance(pubKey: PublicKey): SagaGenerator<BN> {
  const connection = yield* call(getConnection)
  const balance = yield* call([connection, connection.getBalance], pubKey)
  return new BN(balance)
}

export function* handleBalance(): Generator {
  const wallet = yield* call(getWallet)
  yield* put(actions.setAddress(wallet.publicKey))
  yield* put(actions.setIsBalanceLoading(true))
  const balance = yield* call(getBalance, wallet.publicKey)
  yield* put(actions.setBalance(balance))
  yield* call(fetchTokensAccounts)
  yield* put(actions.setIsBalanceLoading(false))
}

interface IparsedTokenInfo {
  mint: string
  owner: string
  tokenAmount: {
    amount: string
    decimals: number
    uiAmount: number
  }
}
interface TokenAccountInfo {
  pubkey: PublicKey
  account: AccountInfo<ParsedAccountData>
}

export function* fetchTokensAccounts(): Generator {
  const connection = yield* call(getConnection)
  const wallet = yield* call(getWallet)

  const { splTokensAccounts, token2022TokensAccounts } = yield* all({
    splTokensAccounts: call(
      [connection, connection.getParsedTokenAccountsByOwner],
      wallet.publicKey,
      {
        programId: TOKEN_PROGRAM_ID
      }
    ),
    token2022TokensAccounts: call(
      [connection, connection.getParsedTokenAccountsByOwner],
      wallet.publicKey,
      {
        programId: TOKEN_2022_PROGRAM_ID
      }
    )
  })

  const mergedAccounts: TokenAccountInfo[] = [
    ...splTokensAccounts.value,
    ...token2022TokensAccounts.value
  ]

  const allTokens = yield* select(tokens)
  const newAccounts: ITokenAccount[] = []
  const unknownTokens: Record<string, StoreToken> = {}
  for (const account of mergedAccounts) {
    const info: IparsedTokenInfo = account.account.data.parsed.info
    console.log(info)
    newAccounts.push({
      programId: new PublicKey(info.mint),
      balance: new BN(info.tokenAmount.amount),
      address: account.pubkey,
      decimals: info.tokenAmount.decimals
    })

    if (!allTokens[info.mint]) {
      console.log('fetching', info)
      unknownTokens[info.mint] = yield* call(
        getTokenMetadata,
        connection,
        info.mint,
        info.tokenAmount.decimals
      )
    }
  }

  yield* put(actions.setTokenAccounts(newAccounts))
  yield* put(poolsActions.addTokens(unknownTokens))
}

// export function* getToken(tokenAddress: PublicKey): SagaGenerator<Mint> {
//   const connection = yield* call(getConnection)
//   const programId = yield* call(getTokenProgramId, connection, new PublicKey(tokenAddress))

//   const token = yield* call(getTokenMetadata, connection, tokenAddress, undefined, programId)
//   return token
// }

export function* handleAirdrop(): Generator {
  const walletStatus = yield* select(status)
  if (walletStatus !== Status.Initialized) {
    yield put(
      snackbarsActions.add({
        message: 'Connect your wallet first',
        variant: 'warning',
        persist: false
      })
    )
    return
  }

  const loaderKey = createLoaderKey()

  const connection = yield* call(getConnection)
  const networkType = yield* select(network)
  const wallet = yield* call(getWallet)
  const ethBalance = yield* select(balance)

  try {
    if (networkType === NetworkType.Testnet) {
      yield* put(actions.showThankYouModal(true))
      yield put(
        snackbarsActions.add({
          message: 'Airdrop in progress',
          variant: 'pending',
          persist: true,
          key: loaderKey
        })
      )

      // transfer sol
      // yield* call([connection, connection.requestAirdrop], airdropAdmin.publicKey, 1 * 1e9)
      // yield* call(transferAirdropSOL)
      yield* call(
        getCollateralTokenAirdrop,
        airdropTokens[networkType],
        airdropQuantities[networkType]
      )

      yield put(
        snackbarsActions.add({
          message: 'You will soon receive airdrop of tokens',
          variant: 'success',
          persist: false
        })
      )
    } else if (networkType === NetworkType.Mainnet) {
      if (ethBalance.lt(WETH_MIN_FAUCET_FEE_MAIN)) {
        yield put(
          snackbarsActions.add({
            message: 'Do not have enough ETH to get faucet',
            variant: 'error',
            persist: false
          })
        )
        return
      }
      yield put(
        snackbarsActions.add({
          message: 'Airdrop in progress',
          variant: 'pending',
          persist: true,
          key: loaderKey
        })
      )

      yield* call(
        getCollateralTokenAirdrop,
        airdropTokens[networkType],
        airdropQuantities[networkType]
      )

      yield put(
        snackbarsActions.add({
          message: 'You will soon receive airdrop of tokens',
          variant: 'success',
          persist: false
        })
      )
      yield* put(actions.showThankYouModal(true))
    } else {
      yield* call([connection, connection.requestAirdrop], wallet.publicKey, 1 * 1e9)

      yield* call(
        getCollateralTokenAirdrop,
        airdropTokens[networkType],
        airdropQuantities[networkType]
      )
      yield put(
        snackbarsActions.add({
          message: 'You will soon receive airdrop',
          variant: 'success',
          persist: false
        })
      )
    }

    closeSnackbar(loaderKey)
    yield put(snackbarsActions.remove(loaderKey))
  } catch (error) {
    console.log(error)
    closeSnackbar(loaderKey)
    yield put(snackbarsActions.remove(loaderKey))

    yield put(
      snackbarsActions.add({
        message: 'Failed to get a faucet',
        variant: 'error',
        persist: false
      })
    )
  }
}

export function* setEmptyAccounts(collateralsAddresses: PublicKey[]): Generator {
  const tokensAccounts = yield* select(accounts)
  const acc: PublicKey[] = []
  for (const collateral of collateralsAddresses) {
    const accountAddress = tokensAccounts[collateral.toString()]
      ? tokensAccounts[collateral.toString()].address
      : null
    if (accountAddress == null) {
      acc.push(new PublicKey(collateralsAddresses))
    }
  }
  if (acc.length !== 0) {
    yield* call(createMultipleAccounts, acc)
  }
}

export function* transferAirdropSOL(): Generator {
  const wallet = yield* call(getWallet)
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: airdropAdmin.publicKey,
      toPubkey: wallet.publicKey,
      lamports: 50000
    })
  )
  const connection = yield* call(getConnection)
  const blockhash = yield* call([connection, connection.getLatestBlockhash])
  tx.feePayer = airdropAdmin.publicKey
  tx.recentBlockhash = blockhash.blockhash
  tx.setSigners(airdropAdmin.publicKey)
  tx.partialSign(airdropAdmin as Signer)

  const txid = yield* call(sendAndConfirmRawTransaction, connection, tx.serialize(), {
    skipPreflight: false
  })

  if (!txid.length) {
    yield put(
      snackbarsActions.add({
        message: 'Failed to airdrop testnet ETH. Please try again.',
        variant: 'error',
        persist: false,
        txid
      })
    )
  } else {
    yield put(
      snackbarsActions.add({
        message: 'Testnet ETH airdrop successfully.',
        variant: 'success',
        persist: false,
        txid
      })
    )
  }
}

export function* getCollateralTokenAirdrop(
  collateralsAddresses: PublicKey[],
  collateralsQuantities: number[]
): Generator {
  const wallet = yield* call(getWallet)
  const instructions: TransactionInstruction[] = []
  yield* call(setEmptyAccounts, collateralsAddresses)
  const tokensAccounts = yield* select(accounts)
  for (const [index, collateral] of collateralsAddresses.entries()) {
    instructions.push(
      createMintToInstruction(
        collateral,
        tokensAccounts[collateral.toString()].address,
        airdropAdmin.publicKey,
        collateralsQuantities[index],
        [],
        TOKEN_PROGRAM_ID
      )
    )
  }
  const tx = instructions.reduce((tx, ix) => tx.add(ix), new Transaction())
  const connection = yield* call(getConnection)
  const blockhash = yield* call([connection, connection.getLatestBlockhash])
  tx.feePayer = wallet.publicKey
  tx.recentBlockhash = blockhash.blockhash
  tx.partialSign(airdropAdmin)

  const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

  yield* call([connection, connection.sendRawTransaction], signedTx.serialize(), {
    skipPreflight: true
  })
}
// export function* getTokenProgram(pubKey: PublicKey): SagaGenerator<number> {
//   const connection = yield* call(getConnection)
//   const balance = yield* call(, pubKey)
//   return balance
// }

export function* signAndSend(wallet: WalletAdapter, tx: Transaction): SagaGenerator<string> {
  const connection = yield* call(getConnection)
  const blockhash = yield* call([connection, connection.getLatestBlockhash])
  tx.feePayer = wallet.publicKey
  tx.recentBlockhash = blockhash.blockhash
  const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction
  const signature = yield* call([connection, connection.sendRawTransaction], signedTx.serialize())
  return signature
}

export function* createAccount(tokenAddress: PublicKey): SagaGenerator<PublicKey> {
  const wallet = yield* call(getWallet)
  const connection = yield* call(getConnection)
  const programId = yield* call(getTokenProgramId, connection, new PublicKey(tokenAddress))
  const associatedAccount = yield* call(
    getAssociatedTokenAddress,
    tokenAddress,
    wallet.publicKey,
    false,
    programId,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  const ix = createAssociatedTokenAccountInstruction(
    wallet.publicKey,
    associatedAccount,
    wallet.publicKey,
    tokenAddress,
    programId,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  yield* call(signAndSend, wallet, new Transaction().add(ix))
  const token = yield* call(getTokenDetails, tokenAddress.toString())
  yield* put(
    actions.addTokenAccount({
      programId: tokenAddress,
      balance: new BN(0),
      address: associatedAccount,
      decimals: token.decimals
    })
  )
  const allTokens = yield* select(tokens)
  if (!allTokens[tokenAddress.toString()]) {
    yield* put(
      poolsActions.addTokens({
        [tokenAddress.toString()]: {
          name: tokenAddress.toString(),
          symbol: `${tokenAddress.toString().slice(0, 4)}...${tokenAddress.toString().slice(-4)}`,
          decimals: token.decimals,
          address: tokenAddress,
          logoURI: '/unknownToken.svg',
          isUnknown: true
        }
      })
    )
  }
  yield* call(sleep, 1000) // Give time to subscribe to new token
  return associatedAccount
}

export function* createMultipleAccounts(tokenAddress: PublicKey[]): SagaGenerator<PublicKey[]> {
  const wallet = yield* call(getWallet)
  const connection = yield* call(getConnection)
  const ixs: TransactionInstruction[] = []
  const associatedAccs: PublicKey[] = []

  for (const address of tokenAddress) {
    const programId = yield* call(getTokenProgramId, connection, address)
    const associatedAccount = yield* call(
      getAssociatedTokenAddress,
      address,
      wallet.publicKey,
      false,
      programId,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
    associatedAccs.push(associatedAccount)
    const ix = createAssociatedTokenAccountInstruction(
      associatedAccount,
      wallet.publicKey,
      wallet.publicKey,
      address,
      programId,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
    ixs.push(ix)
  }
  yield* call(
    signAndSend,
    wallet,
    ixs.reduce((tx, ix) => tx.add(ix), new Transaction())
  )
  const allTokens = yield* select(tokens)
  const unknownTokens: Record<string, StoreToken> = {}
  for (const [index, address] of tokenAddress.entries()) {
    const token = yield* call(getTokenDetails, tokenAddress[index].toString())
    yield* put(
      actions.addTokenAccount({
        programId: address,
        balance: new BN(0),
        address: associatedAccs[index],
        decimals: token.decimals
      })
    )
    // Give time to subscribe to new token
    yield* call(sleep, 1000)

    if (!allTokens[tokenAddress[index].toString()]) {
      unknownTokens[tokenAddress[index].toString()] = {
        name: tokenAddress[index].toString(),
        symbol: `${tokenAddress[index].toString().slice(0, 4)}...${tokenAddress[index]
          .toString()
          .slice(-4)}`,
        decimals: token.decimals,
        address: tokenAddress[index],
        logoURI: '/unknownToken.svg',
        isUnknown: true
      }
    }
  }

  yield* put(poolsActions.addTokens(unknownTokens))

  return associatedAccs
}

export function* init(): Generator {
  yield* put(actions.setStatus(Status.Init))
  yield* call(handleBalance)
  yield* put(actions.setStatus(Status.Initialized))
}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
export function* sendSol(amount: BN, recipient: PublicKey): SagaGenerator<string> {
  const wallet = yield* call(getWallet)
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: recipient,
      lamports: amount.toNumber()
    })
  )

  const txid = yield* call(signAndSend, wallet, transaction)
  return txid
}

export function* handleConnect(): Generator {
  try {
    const walletStatus = yield* select(status)
    if (walletStatus === Status.Initialized) {
      yield* put(
        snackbarsActions.add({
          message: 'Wallet already connected.',
          variant: 'info',
          persist: false
        })
      )
      return
    }
    yield* call(init)
  } catch (error) {
    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* handleDisconnect(): Generator {
  try {
    yield* call(disconnectWallet)
    yield* put(actions.resetState())
    yield* put(positionsActions.setPositionsList([]))
    // yield* put(farmsActions.setUserStakes({}))
    yield* put(
      positionsActions.setCurrentPositionRangeTicks({
        lowerTick: undefined,
        upperTick: undefined
      })
    )
    // yield* put(bondsActions.setUserVested({}))
  } catch (error) {
    console.log(error)

    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* handleReconnect(): Generator {
  yield* call(handleDisconnect)
  yield* delay(100)
  yield* call(openWalletSelectorModal)
}

export function* handleUnwrapWETH(): Generator {
  const wallet = yield* call(getWallet)
  const connection = yield* call(getConnection)
  const allAccounts = yield* select(accounts)

  const loaderUnwrapWETH = createLoaderKey()

  const wrappedEthAccountPublicKeys: PublicKey[] = []
  Object.entries(allAccounts).map(([address, token]) => {
    if (
      address === WRAPPED_ETH_ADDRESS &&
      token.balance.gt(new BN(0) && wrappedEthAccountPublicKeys.length < 10)
    ) {
      wrappedEthAccountPublicKeys.push(token.address)
    }
  })

  if (!wrappedEthAccountPublicKeys) {
    return
  }

  try {
    yield put(
      snackbarsActions.add({
        message: 'Unwraping Wrapped ETH...',
        variant: 'pending',
        persist: true,
        key: loaderUnwrapWETH
      })
    )

    const unwrapTx = new Transaction()

    wrappedEthAccountPublicKeys.forEach(wrappedEthAccountPublicKey => {
      const unwrapIx = createCloseAccountInstruction(
        wrappedEthAccountPublicKey,
        wallet.publicKey,
        wallet.publicKey,
        [],
        TOKEN_PROGRAM_ID
      )

      unwrapTx.add(unwrapIx)
    })

    const unwrapBlockhash = yield* call([connection, connection.getLatestBlockhash])
    unwrapTx.recentBlockhash = unwrapBlockhash.blockhash
    unwrapTx.feePayer = wallet.publicKey

    const unwrapSignedTx = (yield* call([wallet, wallet.signTransaction], unwrapTx)) as Transaction

    const unwrapTxid = yield* call(
      sendAndConfirmRawTransaction,
      connection,
      unwrapSignedTx.serialize(),
      {
        skipPreflight: false
      }
    )

    if (!unwrapTxid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Wrapped ETH unwrap failed. Try to unwrap it in your wallet.',
          variant: 'warning',
          persist: false,
          txid: unwrapTxid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'ETH unwrapped successfully.',
          variant: 'success',
          persist: false,
          txid: unwrapTxid
        })
      )
    }

    yield* put(actions.getBalance())
  } catch (e) {
    console.log(e)

    yield* call(handleRpcError, (e as Error).message)
  }

  closeSnackbar(loaderUnwrapWETH)
  yield put(snackbarsActions.remove(loaderUnwrapWETH))
}

export function* connectHandler(): Generator {
  yield takeLatest(actions.connect, handleConnect)
}

export function* disconnectHandler(): Generator {
  yield takeLatest(actions.disconnect, handleDisconnect)
}

export function* airdropSaga(): Generator {
  yield takeLeading(actions.airdrop, handleAirdrop)
}

export function* initSaga(): Generator {
  yield takeLeading(actions.initWallet, init)
}

export function* handleBalanceSaga(): Generator {
  yield takeLeading(actions.getBalance, handleBalance)
}

export function* reconnectHandler(): Generator {
  yield takeLatest(actions.reconnect, handleReconnect)
}

export function* unwrapWETHHandler(): Generator {
  yield takeLeading(actions.unwrapWETH, handleUnwrapWETH)
}

export function* walletSaga(): Generator {
  yield all(
    [
      initSaga,
      airdropSaga,
      connectHandler,
      disconnectHandler,
      handleBalanceSaga,
      reconnectHandler,
      unwrapWETHHandler
    ].map(spawn)
  )
}
