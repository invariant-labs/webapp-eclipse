import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'

export interface WalletAdapter {
  publicKey: PublicKey
  connected: boolean
  signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>
  signAllTransactions: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  connect: () => any
  disconnect: () => any
}
