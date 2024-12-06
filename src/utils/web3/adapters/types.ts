import { PublicKey, Transaction } from '@solana/web3.js'

export interface WalletAdapter {
  publicKey: PublicKey
  connected: boolean
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>
  signMessage: (message: any) => Promise<any>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}
