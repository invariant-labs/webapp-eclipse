import { DEFAULT_PUBLICKEY, NetworkType } from '@consts/static'
import { FormData } from '../pages/SolanaCreator/utils/solanaCreatorUtils'
import { getCurrentSolanaConnection, getHeliusConnection } from './connection'
import { getSolanaWallet } from './wallet'
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction
} from '@solana/web3.js'
import BaseWebIrys from '@irys/web-upload/dist/types/base'
import { WebSolana } from '@irys/web-upload-solana'
import { WebUploader } from '@irys/web-upload'
// import {
//   createCreateMetadataAccountV3Instruction,
//   PROGRAM_ID
// } from '@metaplex-foundation/mpl-token-metadata'

import * as spl18 from '@solana/spl-token'
import { TOKEN_2022_PROGRAM_ID } from '@invariant-labs/sdk-eclipse'

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
  const connection = getHeliusConnection(network)
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
  console.log(connection.rpcEndpoint)
  const mintKeypair = Keypair.generate()
  const mintAuthority = wallet.publicKey
  const updateAuthority = wallet.publicKey
  const mint = mintKeypair.publicKey
  const decimals = Number(decimalsAsString)
  const supply = Number(supplyAsString) * Math.pow(10, decimals)
  // let imageUri: string = ''

  // if (image.length > 0) {
  //   const fileToUpload = stringToFile(image)
  //   const imageTags = [{ name: 'Content-Type', value: fileToUpload.type }]
  //   try {
  //     const receipt = await irysUploader.uploadFile(fileToUpload, {
  //       tags: imageTags
  //     })
  //     imageUri = `https://gateway.irys.xyz/${receipt.id}`
  //   } catch (e) {
  //     console.log('Error when uploading image', e)
  //     return false
  //   }
  // }

  // const links: [string, string][] = [
  //   ['website', website],
  //   ['twitter', twitter],
  //   ['telegram', telegram],
  //   ['discord', discord]
  // ].filter(item => item[1].length > 0) as [string, string][]

  // const metaDataToUpload = {
  //   updateAuthority: updateAuthority.toString(),
  //   mint: mint.toString(),
  //   name: name,
  //   symbol: symbol,
  //   image: imageUri,
  //   description: description,
  //   links
  // }

  // let metaDataUri: string

  // const metaDataTags = [{ name: 'Content-Type', value: 'application/json' }]
  // try {
  //   const receipt = await irysUploader.upload(JSON.stringify(metaDataToUpload), {
  //     tags: metaDataTags
  //   })
  //   metaDataUri = `https://gateway.irys.xyz/${receipt.id}`
  // } catch (e) {
  //   console.log('Error when uploading metadata', e)
  //   return false
  // }

  // const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
  //   {
  //     metadata: PublicKey.findProgramAddressSync(
  //       [Buffer.from('metadata'), PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],
  //       PROGRAM_ID
  //     )[0],
  //     mint: mintKeypair.publicKey,
  //     mintAuthority,
  //     payer: wallet.publicKey,
  //     updateAuthority
  //   },
  //   {
  //     createMetadataAccountArgsV3: {
  //       data: {
  //         name: name,
  //         symbol: symbol,
  //         uri: '',
  //         creators: null,
  //         sellerFeeBasisPoints: 0,
  //         uses: null,
  //         collection: null
  //       },
  //       isMutable: false,
  //       collectionDetails: null
  //     }
  //   }
  // )

  const lamports = await spl18.Token.getMinBalanceRentForExemptMint(connection)

  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: mint,
    space: spl18.MintLayout.span,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID
  })

  const initializeMintInstruction = spl18.Token.createInitMintInstruction(
    TOKEN_2022_PROGRAM_ID,
    mint,
    decimals,
    mintAuthority,
    null
  )

  const tokenATA = await spl18.Token.getAssociatedTokenAddress(
    spl18.ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_2022_PROGRAM_ID,
    mintKeypair.publicKey,
    wallet.publicKey
  )

  const associatedTokenAccountInstruction = spl18.Token.createAssociatedTokenAccountInstruction(
    spl18.ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_2022_PROGRAM_ID,
    mintKeypair.publicKey,
    tokenATA,
    wallet.publicKey,
    wallet.publicKey
  )

  const mintToInstruction = spl18.Token.createMintToInstruction(
    TOKEN_2022_PROGRAM_ID,
    mintKeypair.publicKey,
    tokenATA,
    wallet.publicKey,
    [],
    supply
  )

  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeMintInstruction,
    associatedTokenAccountInstruction,
    mintToInstruction
    //createMetadataInstruction
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
