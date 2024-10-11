import { DEFAULT_PUBLICKEY, NetworkType } from '@consts/static'
import { FormData } from '../pages/SolanaCreator/utils/solanaCreatorUtils'
import { getCurrentSolanaConnection } from './connection'
import { getSolanaWallet } from './wallet'
import { WebUploader } from '@irys/web-upload'
import { WebSolana } from '@irys/web-upload-solana'
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js'
import { createInitializeInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata'
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE
} from '@solana/spl-token'
import BaseWebIrys from '@irys/web-upload/dist/types/base'

export const stringToFile = (dataUrl: string) => {
  const base64Data = dataUrl.split(',')[1]
  const typeArr = dataUrl.split(',')[0].match(/:(.*?);/)
  const fileType = (typeArr && typeArr[1]) || 'image/png'
  const fileName = `logo.${fileType.split('/')[1]}`
  const byteString = atob(base64Data)
  const byteArray = Uint8Array.from(Array.from(byteString, char => char.charCodeAt(0)))
  const blob = new Blob([byteArray], { type: fileType })
  const file = new File([blob], fileName, { type: fileType })
  return file
}

export const createToken = async (data: FormData, network: NetworkType) => {
  const wallet = getSolanaWallet()
  const connection = getCurrentSolanaConnection()

  if (wallet.publicKey.toBase58() === DEFAULT_PUBLICKEY.toBase58() || !connection) return false

  let irysUploader: BaseWebIrys

  if ((network = NetworkType.MAINNET)) {
    irysUploader = await WebUploader(WebSolana).withProvider(wallet)
  } else {
    irysUploader = await WebUploader(WebSolana).withProvider(wallet).devnet()
  }

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

  const mintKeypair = Keypair.generate()
  const mintAuthority = wallet.publicKey
  const updateAuthority = wallet.publicKey
  const mint = mintKeypair.publicKey
  const decimals = Number(decimalsAsString)
  const supply = BigInt(Number(supplyAsString) * Math.pow(10, decimals))

  let imageUri: string = ''

  if (image.length > 0) {
    const fileToUpload = stringToFile(image)
    const imageTags = [{ name: 'Content-Type', value: fileToUpload.type }]
    try {
      const receipt = await irysUploader.uploadFile(fileToUpload, {
        tags: imageTags
      })
      imageUri = `https://gateway.irys.xyz/${receipt.id}`
    } catch (e) {
      console.log('Error when uploading image', e)
      return false
    }
  }

  const links: [string, string][] = [
    ['website', website],
    ['twitter', twitter],
    ['telegram', telegram],
    ['discord', discord]
  ].filter(item => item[1].length > 0) as [string, string][]

  const metaDataToUpload = {
    updateAuthority: updateAuthority.toString(),
    mint: mint.toString(),
    name: name,
    symbol: symbol,
    image: imageUri,
    description: description,
    links
  }

  let metaDataUri: string

  const metaDataTags = [{ name: 'Content-Type', value: 'application/json' }]
  try {
    const receipt = await irysUploader.upload(JSON.stringify(metaDataToUpload), {
      tags: metaDataTags
    })
    metaDataUri = `https://gateway.irys.xyz/${receipt.id}`
  } catch (e) {
    console.log('Error when uploading metadata', e)
    return false
  }

  const metaData: TokenMetadata = {
    updateAuthority: updateAuthority,
    mint: mint,
    name: metaDataToUpload.name,
    symbol: metaDataToUpload.symbol,
    uri: metaDataUri,
    additionalMetadata: [...links]
  }

  const metadataExtension = TYPE_SIZE + LENGTH_SIZE
  const metadataLen = pack(metaData).length
  const mintLen = getMintLen([ExtensionType.MetadataPointer])

  const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataExtension + metadataLen
  )

  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: mint,
    space: mintLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID
  })

  const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
    mint,
    updateAuthority,
    mint,
    TOKEN_2022_PROGRAM_ID
  )

  const initializeMintInstruction = createInitializeMintInstruction(
    mint,
    decimals,
    mintAuthority,
    null,
    TOKEN_2022_PROGRAM_ID
  )

  const initializeMetadataInstruction = createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    metadata: mint,
    updateAuthority: updateAuthority,
    mint: mint,
    mintAuthority: mintAuthority,
    name: metaData.name,
    symbol: metaData.symbol,
    uri: metaData.uri
  })

  const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, wallet.publicKey)

  const associatedTokenAccountInstruction = createAssociatedTokenAccountInstruction(
    wallet.publicKey,
    tokenATA,
    wallet.publicKey,
    mintKeypair.publicKey
  )

  const mintToInstruction = createMintToInstruction(
    mintKeypair.publicKey,
    tokenATA,
    wallet.publicKey,
    supply
  )

  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeMetadataPointerInstruction,
    initializeMintInstruction,
    initializeMetadataInstruction,
    associatedTokenAccountInstruction,
    mintToInstruction
  )

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.partialSign(mintKeypair)

  const signedTx = await wallet.signTransaction(transaction)

  const signatureTx = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false
  })

  console.log('signature:', signatureTx)

  const confirmedTx = await connection.confirmTransaction({
    blockhash: blockhash,
    lastValidBlockHeight: lastValidBlockHeight,
    signature: signatureTx
  })

  if (confirmedTx.value.err === null) {
    return true
  }
  return false
}
