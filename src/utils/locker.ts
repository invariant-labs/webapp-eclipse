import { AnchorProvider, BN, Program } from '@coral-xyz/anchor'
import {
  BlockheightBasedTransactionConfirmationStrategy,
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
  VersionedTransaction
} from '@solana/web3.js'

import { Locker as ILocker } from './idl/locker'
import * as IDL from './idl/locker.json'
import { Market, Pair } from '@invariant-labs/sdk-eclipse'
import { getAssociatedTokenAddressSync, NATIVE_MINT } from '@solana/spl-token'
import { createNativeAtaInstructions } from '@invariant-labs/sdk-eclipse/lib/utils'
export const signAndSend = async (
  tx: Transaction,
  signers: Keypair[],
  connection: Connection,
  opts?: ConfirmOptions
): Promise<TransactionSignature> => {
  tx.feePayer ??= signers[0].publicKey
  const latestBlockhash = await connection.getLatestBlockhash(
    opts?.commitment ?? AnchorProvider.defaultOptions().commitment
  )
  tx.recentBlockhash = latestBlockhash.blockhash
  tx.partialSign(...signers)

  const signature = await connection.sendRawTransaction(
    tx.serialize(),
    opts ?? AnchorProvider.defaultOptions()
  )

  const confirmStrategy: BlockheightBasedTransactionConfirmationStrategy = {
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    signature
  }
  await connection.confirmTransaction(confirmStrategy)

  return signature
}

export interface IWallet {
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>
  publicKey: PublicKey
}

export const getTokenProgramAddress = async (
  connection: Connection,
  mint: PublicKey
): Promise<PublicKey> => {
  const info = await connection.getAccountInfo(mint)
  if (!info) {
    throw new Error("Couldn't retrieve token program address")
  }
  return info.owner
}

export const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
export const MAX_NATIVE_POSITION_FOR_CLAIM_ALL = 1
export const MAX_SPL_POSITION_FOR_CLAIM_ALL = 1
export enum Network {
  LOCAL,
  DEV,
  TEST,
  MAIN
}

export const getLockerAddress = (network: Network) => {
  switch (network) {
    case Network.LOCAL:
      return 'LockDkUjGpMHewP4cbP7XRpiiC4ciQaPALbwUALCEJp'
    case Network.TEST:
      return 'LockDkUjGpMHewP4cbP7XRpiiC4ciQaPALbwUALCEJp'
    case Network.DEV:
      return 'LockDkUjGpMHewP4cbP7XRpiiC4ciQaPALbwUALCEJp'
    case Network.MAIN:
      return 'LockDkUjGpMHewP4cbP7XRpiiC4ciQaPALbwUALCEJp'
    default:
      throw new Error('Unknown network')
  }
}

export class Locker {
  public connection: Connection
  public wallet: IWallet
  public program: Program<ILocker>
  public network: Network

  private constructor(
    network: Network,
    wallet: IWallet,
    connection: Connection,
    _programId?: PublicKey
  ) {
    this.connection = connection
    this.wallet = wallet
    const programAddress = new PublicKey(getLockerAddress(network))
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())
    this.network = network

    this.program = new Program<ILocker>(IDL as unknown as ILocker, programAddress, provider)
  }

  public static async buildWithoutProvider(
    network: Network,
    connection: Connection,
    programId?: PublicKey
  ) {
    const instance = new Locker(
      network,
      {
        publicKey: PublicKey.default,
        signTransaction: async tx => {
          return tx
        },
        signAllTransactions: async txs => {
          return txs
        }
      },
      connection,
      programId
    )

    return instance
  }

  public static build(
    network: Network,
    wallet: IWallet,
    connection: Connection,
    programId?: PublicKey
  ): Locker {
    const instance = new Locker(network, wallet, connection, programId)

    return instance
  }

  async sendTx(ix: TransactionInstruction[], signers: Keypair[]) {
    const tx = new Transaction().add(...ix)
    return await signAndSend(tx, signers, this.connection)
  }

  async initializeUserLocksIx(feePayer?: PublicKey): Promise<TransactionInstruction> {
    feePayer ??= this.wallet.publicKey
    const [locks] = this.getUserLocksAddress(feePayer)
    return await this.program.methods
      .initializeUserLocks()
      .accounts({
        owner: feePayer,
        locks,
        systemProgram: SystemProgram.programId
      })
      .instruction()
  }

  async claimFee(params: IClaimFee) {
    const ixs = await this.claimFeeIx(params, params.payer.publicKey)
    return await this.sendTx(ixs, [params.payer])
  }
  async claimFeeIx(
    { authorityListIndex, market, pair, userTokenX, userTokenY }: IClaimFeeIx,
    feePayer?: PublicKey
  ) {
    feePayer ??= this.wallet.publicKey
    const [locks] = this.getUserLocksAddress(feePayer)

    const pool = pair.getAddress(market.program.programId)

    const [
      poolState,
      positionState,
      tokenXProgram,
      tokenYProgram,
      authorityPositionList,
      ownerPositionList
    ] = await Promise.all([
      market.getPool(pair),
      market.getPosition(locks, authorityListIndex),
      getTokenProgramAddress(this.connection, pair.tokenX),
      getTokenProgramAddress(this.connection, pair.tokenY),
      market.getPositionList(locks),
      market.getPositionList(feePayer)
    ])

    const { tickAddress: lowerTick } = market.getTickAddress(pair, positionState.lowerTickIndex)
    const { tickAddress: upperTick } = market.getTickAddress(pair, positionState.upperTickIndex)
    const { positionListAddress: authorityList } = market.getPositionListAddress(locks)
    const { positionListAddress: positionList } = market.getPositionListAddress(feePayer)

    const authorityListHead = authorityPositionList?.head ?? 0
    const ownerListHead = ownerPositionList?.head ?? 0

    const { positionAddress: position } = market.getPositionAddress(locks, authorityListIndex)
    const { positionAddress: transferredPosition } = market.getPositionAddress(
      feePayer,
      ownerListHead
    )
    const { positionAddress: lastPosition } = market.getPositionAddress(
      locks,
      authorityListHead - 1
    )

    const { address: state } = market.getStateAddress()

    const claimFeeIx = await this.program.methods
      .claimFee(authorityListIndex, positionState.lowerTickIndex, positionState.upperTickIndex)
      .accounts({
        owner: feePayer,
        locks,
        authorityList,
        invProgram: market.program.programId,
        invState: state,
        invProgramAuthority: market.programAuthority.address,
        position,
        pool,
        lowerTick,
        upperTick,
        positionList,
        transferredPosition,
        lastPosition,
        accountX: userTokenX,
        accountY: userTokenY,
        tokenX: pair.tokenX,
        tokenY: pair.tokenY,
        invReserveX: poolState.tokenXReserve,
        invReserveY: poolState.tokenYReserve,
        tokenXProgram,
        tokenYProgram,
        systemProgram: SystemProgram.programId
      })
      .instruction()

    return [claimFeeIx]
  }

  async claimAllFeesTxs({
    owner,
    positions,
    market
  }: IClaimAllFee): Promise<{ tx: Transaction; additionalSigner?: Keypair }[]> {
    owner ??= this.wallet.publicKey

    const pools: Record<string, PoolStructure> = {}
    const ixs: TransactionInstruction[] = []
    const nativeIxs: TransactionInstruction[] = []
    const splPositions: IClaimAllFeePosition[] = []
    const nativePositions: IClaimAllFeePosition[] = []
    const atas: {
      keypair: Keypair
      createIx: TransactionInstruction
      initIx: TransactionInstruction
      unwrapIx: TransactionInstruction
    }[] = []

    const tokenPubkeys: PublicKey[] = Array.from(
      new Set(positions.map(p => [p.pair.tokenX, p.pair.tokenY]).flat())
    )
    const pairs: Pair[] = Array.from(new Set(positions.map(p => p.pair)))

    const promisedTokenPorgrams = await market.connection.getMultipleAccountsInfo(tokenPubkeys)

    const tokenPrograms: Record<string, PublicKey> = promisedTokenPorgrams.reduce(
      (acc: Record<string, PublicKey>, cur: any, idx: number) => {
        acc[tokenPubkeys[idx].toBase58()] = cur?.owner ?? TOKEN_2022_PROGRAM_ID
        return acc
      },
      {}
    )

    const poolStructures: [PublicKey, PoolStructure][] = await Promise.all([
      ...pairs.map(pair => {
        return new Promise(res => {
          ;(async () => {
            res([pair.getAddress(market.program.programId), await market.getPool(pair)])
          })()
        }) as Promise<[PublicKey, PoolStructure]>
      })
    ])

    poolStructures.forEach((p: [PublicKey, PoolStructure]) => (pools[p[0].toBase58()] = p[1]))

    for (const position of positions) {
      if (position.pair.tokenX.equals(NATIVE_MINT) || position.pair.tokenY.equals(NATIVE_MINT)) {
        nativePositions.push(position)
      } else {
        splPositions.push(position)
      }
    }

    if (nativePositions.length != 0) {
      const requiredAtas = Math.ceil(nativePositions.length / MAX_NATIVE_POSITION_FOR_CLAIM_ALL)

      for (let i = 0; i < requiredAtas; i++) {
        const nativeAta = Keypair.generate()
        const { createIx, initIx, unwrapIx } = createNativeAtaInstructions(
          nativeAta.publicKey,
          owner,
          this.network
        )
        atas.push({
          keypair: nativeAta,
          createIx,
          initIx,
          unwrapIx
        })
      }

      for (const [n, { index, pair }] of nativePositions.entries()) {
        const idx = Math.floor(n / MAX_NATIVE_POSITION_FOR_CLAIM_ALL)

        const userTokenX = pair.tokenX.equals(NATIVE_MINT)
          ? atas[idx].keypair.publicKey
          : getAssociatedTokenAddressSync(
              pair.tokenX,
              owner,
              false,
              tokenPrograms[pair.tokenX.toBase58()]
            )
        const userTokenY = pair.tokenY.equals(NATIVE_MINT)
          ? atas[idx].keypair.publicKey
          : getAssociatedTokenAddressSync(
              pair.tokenY,
              owner,
              false,
              tokenPrograms[pair.tokenY.toBase58()]
            )

        const claimIx = await this.claimFeeIx(
          {
            authorityListIndex: index,
            pair,
            userTokenX,
            userTokenY,
            market
          },
          owner
        )

        nativeIxs.push(...claimIx)
      }
    }

    if (splPositions.length != 0) {
      for (const position of splPositions) {
        const { pair, index } = position

        const userTokenX = getAssociatedTokenAddressSync(
          pair.tokenX,
          owner,
          false,
          tokenPrograms[pair.tokenX.toBase58()]
        )
        const userTokenY = getAssociatedTokenAddressSync(
          pair.tokenY,
          owner,
          false,
          tokenPrograms[pair.tokenY.toBase58()]
        )

        const claimIx = await this.claimFeeIx(
          {
            authorityListIndex: index,
            pair,
            userTokenX,
            userTokenY,
            market
          },
          owner
        )

        ixs.push(...claimIx)
      }
    }

    const txs: { tx: Transaction; additionalSigner?: Keypair }[] = []

    for (let i = 0; i < ixs.length; i += MAX_SPL_POSITION_FOR_CLAIM_ALL) {
      txs.push({ tx: new Transaction().add(...ixs.slice(i, i + MAX_SPL_POSITION_FOR_CLAIM_ALL)) })
    }

    for (let i = 0; i < nativeIxs.length; i += MAX_NATIVE_POSITION_FOR_CLAIM_ALL) {
      const idx = i === 0 ? 0 : Math.floor(i / MAX_SPL_POSITION_FOR_CLAIM_ALL)
      txs.push({
        tx: new Transaction()
          .add(atas[idx].createIx)
          .add(atas[idx].initIx)
          .add(...nativeIxs.slice(i, i + MAX_NATIVE_POSITION_FOR_CLAIM_ALL))
          .add(atas[idx].unwrapIx),
        additionalSigner: atas[idx].keypair
      })
    }

    return txs
  }

  getUserLocksAddress(owner: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('Locks'), owner.toBuffer()],
      this.program.programId
    )
  }

  setWallet(wallet: IWallet) {
    this.wallet = wallet
  }

  async getUserLocks(owner: PublicKey) {
    const [locks] = this.getUserLocksAddress(owner)
    return await this.program.account.locks.fetch(locks)
  }

  async getAllLockedPositions(market: Market) {
    const authorities = (await this.program.account.locks.all()).map(a => a.publicKey)
    const promises = authorities.map(authority => market.getAllUserLockedPositions(authority))
    const lockedPositions = await Promise.all(promises)
    return lockedPositions.flat()
  }

  async getUserLockedPositions(market: Market, owner: PublicKey) {
    const [authority] = this.getUserLocksAddress(owner)

    const lockedPositions = await market.getAllUserLockedPositions(authority)

    return lockedPositions
  }

  async initLocksIfNeededIx(feePayer?: PublicKey): Promise<TransactionInstruction[]> {
    feePayer ??= this.wallet.publicKey

    try {
      await this.getUserLocks(feePayer)
      return []
    } catch (e) {
      return [await this.initializeUserLocksIx(feePayer)]
    }
  }

  satisfyDecimal(v: BN): { v: any } {
    return { v }
  }
}

export interface IInitializeUserAuthority extends IInitializeUserAuthorityIx {
  payer: Keypair
}

export interface IInitializeUserAuthorityIx {
  market: PublicKey
  positionList: PublicKey
}

export interface ILockPosition extends ILockPositionIx {
  payer: Keypair
}
export interface ILockPositionIx {
  lockDuration: BN
  market: Market
  index: number
}

export interface IUnlockPosition extends IUnlockPositionIx {
  payer: Keypair
}

export interface IUnlockPositionIx {
  authorityListIndex: number
  market: Market
}

export interface IClaimFee extends IClaimFeeIx {
  payer: Keypair
}

export interface IClaimFeeIx {
  authorityListIndex: number
  userTokenX: PublicKey
  userTokenY: PublicKey
  market: Market
  pair: Pair
}

export interface IClaimAllFee {
  market: Market
  positions: IClaimAllFeePosition[]
  owner?: PublicKey
}

export interface IClaimAllFeePosition {
  pair: Pair
  index: number
  lowerTickIndex: number
  upperTickIndex: number
}
export interface PoolStructure {
  tokenX: PublicKey
  tokenY: PublicKey
  tokenXReserve: PublicKey
  tokenYReserve: PublicKey
  positionIterator: BN
  tickSpacing: number
  fee: BN
  protocolFee: BN
  liquidity: BN
  sqrtPrice: BN
  currentTickIndex: number
  tickmap: PublicKey
  feeGrowthGlobalX: BN
  feeGrowthGlobalY: BN
  feeProtocolTokenX: BN
  feeProtocolTokenY: BN
  secondsPerLiquidityGlobal: BN
  startTimestamp: BN
  lastTimestamp: BN
  feeReceiver: PublicKey
  oracleAddress: PublicKey
  oracleInitialized: boolean
  bump: number
}
