import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'

export interface WalletAdapter {
  publicKey: PublicKey
  connected: boolean
  signTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<Transaction | VersionedTransaction>
  signAllTransactions: (
    transaction: Transaction[] | VersionedTransaction[]
  ) => Promise<Transaction[] | VersionedTransaction[]>
  signMessage: (message: any) => Promise<any>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}
