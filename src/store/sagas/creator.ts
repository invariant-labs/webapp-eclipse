import { PayloadAction } from '@reduxjs/toolkit'
import { actions, CreateTokenPayload } from '@store/reducers/creator'
import { all, call, put, spawn, takeLatest } from 'typed-redux-saga'
import { getWallet } from './wallet'
import { DEFAULT_PUBLICKEY, SIGNING_SNACKBAR_CONFIG } from '@store/consts/static'
import { WebUploader } from '@irys/web-upload'
import WebSolana from '@irys/web-upload-solana'
import {
  Keypair,
  PublicKey,
  sendAndConfirmRawTransaction,
  SystemProgram,
  Transaction
} from '@solana/web3.js'
import { getFileFromInput } from '@utils/web3/createToken'
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata'
import * as spl18 from '@solana/spl-token'
import { createLoaderKey, ensureError } from '@utils/utils'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { closeSnackbar } from 'notistack'
import { getCurrentSolanaConnection } from '@utils/web3/connection'

export function* handleCreateToken(action: PayloadAction<CreateTokenPayload>) {
  const { data } = action.payload

  const {
    name,
    symbol,
    decimals: decimalsAsString,
    supply: supplyAsString,
    description,
    website,
    twitter,
    telegram,
    discord,
    image
  } = data

  const loaderCreateToken = createLoaderKey()
  const loaderSigningTx = createLoaderKey()
  try {
    const wallet = yield* call(getWallet)
    const connection = getCurrentSolanaConnection()

    if (wallet.publicKey.toBase58() === DEFAULT_PUBLICKEY.toBase58() || !connection) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to create a token',
          variant: 'error',
          persist: false
        })
      )
      throw new Error('Wallet not connected')
    }
    yield put(
      snackbarsActions.add({
        message: 'Creating token...',
        variant: 'pending',
        persist: true,
        key: loaderCreateToken
      })
    )

    const irysUploader = yield* call(
      async () => await WebUploader(WebSolana).withProvider(wallet).withRpc(connection.rpcEndpoint)
    )

    const mintKeypair = Keypair.generate()
    const mintAuthority = wallet.publicKey
    const updateAuthority = wallet.publicKey
    const mint = mintKeypair.publicKey
    const decimals = Number(decimalsAsString)
    const supply = Number(supplyAsString) * Math.pow(10, decimals)

    let imageUri: string = ''

    if (image.length > 0) {
      try {
        const fileToUpload = yield* call(getFileFromInput, image)
        const imageTags = [{ name: 'Content-Type', value: fileToUpload.type }]

        const receipt = yield* call([irysUploader, irysUploader.uploadFile], fileToUpload, {
          tags: imageTags
        })

        imageUri = `https://gateway.irys.xyz/${receipt.id}`
      } catch (e: unknown) {
        const error = ensureError(e)
        console.log('Error when uploading image', error)
        throw new Error('Error when uploading image')
      }
    }

    const links: { [key: string]: string } = [
      ['website', website],
      ['twitter', twitter],
      ['telegram', telegram],
      ['discord', discord]
    ].reduce(
      (acc, [key, value]) => {
        if (value.length > 0) {
          acc[key] = value
        }
        return acc
      },
      {} as { [key: string]: string }
    )

    const metaDataToUpload = {
      updateAuthority: updateAuthority.toString(),
      mint: mint.toString(),
      name: name,
      symbol: symbol,
      image: imageUri,
      description: description,
      ...links
    }

    let metaDataUri: string

    const metaDataTags = [{ name: 'Content-Type', value: 'application/json' }]

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))
    try {
      const receipt = yield call(
        [irysUploader, irysUploader.upload],
        JSON.stringify(metaDataToUpload),
        { tags: metaDataTags }
      )
      metaDataUri = `https://gateway.irys.xyz/${receipt.id}`
    } catch (e: unknown) {
      const error = ensureError(e)
      console.log('Error when uploading metadata', error)

      throw new Error('Error when uploading metadata')
    }

    const metadataPDA = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],
      PROGRAM_ID
    )[0]

    const lamports = yield* call(spl18.getMinimumBalanceForRentExemptAccount, connection)

    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mint,
      space: spl18.MintLayout.span,
      lamports,
      programId: spl18.TOKEN_PROGRAM_ID
    })

    const initializeMintInstruction = spl18.createInitializeMintInstruction(
      mint,
      decimals,
      mintAuthority,
      null,
      spl18.TOKEN_PROGRAM_ID
    )

    const tokenATA = yield* call(
      spl18.getAssociatedTokenAddress,
      mintKeypair.publicKey,
      wallet.publicKey,
      undefined,
      spl18.TOKEN_PROGRAM_ID,
      spl18.ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const associatedTokenAccountInstruction = spl18.createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      tokenATA,
      wallet.publicKey,
      mintKeypair.publicKey,
      spl18.TOKEN_PROGRAM_ID,
      spl18.ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const mintToInstruction = spl18.createMintToInstruction(
      mintKeypair.publicKey,
      tokenATA,
      wallet.publicKey,
      BigInt(supply),
      [],
      spl18.TOKEN_PROGRAM_ID
    )
    console.log('keypair', mintKeypair.publicKey)
    const createMetadataAccountInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: mintKeypair.publicKey,
        mintAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        updateAuthority: wallet.publicKey,
        systemProgram: SystemProgram.programId
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name,
            symbol,
            uri: metaDataUri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null
          },
          isMutable: true,
          collectionDetails: null
        }
      }
    )

    const transaction = new Transaction().add(
      createAccountInstruction,
      initializeMintInstruction,
      associatedTokenAccountInstruction,
      mintToInstruction,
      createMetadataAccountInstruction
    )

    const { blockhash, lastValidBlockHeight } = yield* call([
      connection,
      connection.getLatestBlockhash
    ])

    transaction.feePayer = wallet.publicKey
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight

    transaction.partialSign(mintKeypair)

    const signedTx = (yield* call([wallet, wallet.signTransaction], transaction)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const signatureTx = yield* call(
      sendAndConfirmRawTransaction,
      connection,
      signedTx.serialize(),
      {
        skipPreflight: false
      }
    )

    console.log(signatureTx)

    const confirmedTx = yield* call([connection, connection.confirmTransaction], {
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
      signature: signatureTx
    })

    closeSnackbar(loaderCreateToken)
    yield put(snackbarsActions.remove(loaderCreateToken))

    if (confirmedTx.value.err === null) {
      console.log('Token has been created')
      yield* put(actions.setCreateSuccess(true))

      yield put(
        snackbarsActions.add({
          message: 'Token created successfully',
          variant: 'success',
          persist: false,
          txid: signatureTx
        })
      )
      return
    }
    console.log('Failed to create a Token', false)
    yield put(actions.setCreateSuccess(false))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
    yield put(actions.setCreateSuccess(false))

    closeSnackbar(loaderCreateToken)
    yield put(snackbarsActions.remove(loaderCreateToken))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))
  }
}

export function* createTokenHandler(): Generator {
  yield* takeLatest(actions.createToken, handleCreateToken)
}

export function* creatorSaga(): Generator {
  yield all([createTokenHandler].map(spawn))
}
