import { DEFAULT_PUBLICKEY, NetworkType } from '../../store/consts/static'
import { FormData } from '../../pages/SolanaCreator/utils/solanaCreatorUtils'
import { getCurrentSolanaConnection } from './connection'
import { getSolanaWallet } from './wallet'
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { WebSolana } from '@irys/web-upload-solana'
import { WebUploader } from '@irys/web-upload'
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata'
import * as spl18 from '@solana/spl-token'

async function getFileFromInput(inputString: string) {
  function isBase64(str: string) {
    return str.startsWith('data:image/')
  }

  if (isBase64(inputString)) {
    return stringToFile(inputString)
  }

  const response = await fetch(inputString)
  const blob = await response.blob()

  const fileName = inputString.split('/').pop()
  const file = new File([blob], fileName || 'logo', { type: blob.type })

  return file
}

export const stringToFile = (dataUrl: string) => {
  const base64Data = dataUrl.split(',')[1]
  const typeArr = dataUrl.split(',')[0].match(/:(.*?);/)
  const fileType = typeArr?.[1] ?? 'image/png'
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

  const irysUploader =
    network === NetworkType.Mainnet
      ? await WebUploader(WebSolana).withProvider(wallet).withRpc(connection.rpcEndpoint)
      : await WebUploader(WebSolana).withProvider(wallet).withRpc(connection.rpcEndpoint).devnet()

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
  const supply = Number(supplyAsString) * Math.pow(10, decimals)

  let imageUri: string = ''

  if (image.length > 0) {
    const fileToUpload = await getFileFromInput(image)
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

  const links: Array<[string, string]> = [
    ['website', website],
    ['twitter', twitter],
    ['telegram', telegram],
    ['discord', discord]
  ].filter(item => item[1].length > 0) as Array<[string, string]>

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

  const metadataPDA = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],
    PROGRAM_ID
  )[0]
  const lamports = await spl18.Token.getMinBalanceRentForExemptMint(connection)

  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: mint,
    space: spl18.MintLayout.span,
    lamports,
    programId: spl18.TOKEN_PROGRAM_ID
  })

  const initializeMintInstruction = spl18.Token.createInitMintInstruction(
    spl18.TOKEN_PROGRAM_ID,
    mint,
    decimals,
    mintAuthority,
    null
  )

  const tokenATA = await spl18.Token.getAssociatedTokenAddress(
    spl18.ASSOCIATED_TOKEN_PROGRAM_ID,
    spl18.TOKEN_PROGRAM_ID,
    mintKeypair.publicKey,
    wallet.publicKey
  )

  const associatedTokenAccountInstruction = spl18.Token.createAssociatedTokenAccountInstruction(
    spl18.ASSOCIATED_TOKEN_PROGRAM_ID,
    spl18.TOKEN_PROGRAM_ID,
    mintKeypair.publicKey,
    tokenATA,
    wallet.publicKey,
    wallet.publicKey
  )

  const mintToInstruction = spl18.Token.createMintToInstruction(
    spl18.TOKEN_PROGRAM_ID,
    mintKeypair.publicKey,
    tokenATA,
    wallet.publicKey,
    [],
    supply
  )

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

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.partialSign(mintKeypair)

  const signedTx = await wallet.signTransaction(transaction)

  const signatureTx = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false
  })
  console.log(signatureTx)
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
