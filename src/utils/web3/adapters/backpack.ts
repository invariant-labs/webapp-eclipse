import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { WalletAdapter } from './types'
import { DEFAULT_PUBLICKEY } from '@store/consts/static'
import { ensureError } from '@utils/utils'

interface BackpackProvider {
  publicKey: PublicKey
  isConnected: boolean
  signTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<Transaction | VersionedTransaction>
  signAllTransactions: (
    transactions: Transaction[] | VersionedTransaction[]
  ) => Promise<Transaction[] | VersionedTransaction[]>
  signMessage: (message: Uint8Array) => Promise<any>
  sendMessage: (message: Uint8Array) => Promise<any>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}
export class BackpackWalletAdapter implements WalletAdapter {
  _backpackProvider: BackpackProvider | undefined
  constructor() {
    this.connect = this.connect.bind(this)
  }
  get connected() {
    return this._backpackProvider?.isConnected || false
  }

  signAllTransactions = async (
    transactions: Transaction[] | VersionedTransaction[]
  ): Promise<Transaction[] | VersionedTransaction[]> => {
    if (!this._backpackProvider) {
      return transactions
    }
    return await this._backpackProvider.signAllTransactions(transactions)
  }
  get publicKey() {
    return this._backpackProvider?.publicKey
      ? new PublicKey(this._backpackProvider?.publicKey?.toString())
      : DEFAULT_PUBLICKEY
  }

  signTransaction = async (transaction: Transaction | VersionedTransaction) => {
    if (!this._backpackProvider) {
      return transaction
    }
    return await this._backpackProvider.signTransaction(transaction)
  }

  sendMessage = async (message: Uint8Array) => {
    if (!this._backpackProvider) {
      throw new Error('Backpack Wallet not connected' + message)
    }
    return await this._backpackProvider.sendMessage(message)
  }

  signMessage = async (message: Uint8Array) => {
    if (!this._backpackProvider) {
      throw new Error('Backpack Wallet not connected')
    }

    if (!(message instanceof Uint8Array)) {
      throw new TypeError('Expected message to be a Uint8Array')
    }

    const signedMessage = await this._backpackProvider.signMessage(message)

    return new Uint8Array(signedMessage.signature as ArrayBuffer)
  }

  connect = async () => {
    if (this._backpackProvider) {
      return
    }
    let provider: BackpackProvider
    if ((window as any)?.backpack) {
      provider = (window as any).backpack.solana
    } else {
      window.open('https://backpack.app/', '_blank')
      return
    }
    if (!provider.isConnected) {
      await provider.connect()
    }
    this._backpackProvider = provider
  }
  disconnect = async () => {
    if (this._backpackProvider) {
      try {
        await this._backpackProvider.disconnect()
        this._backpackProvider = undefined
      } catch (e: unknown) {
        const error = ensureError(e)
        console.log(error)
      }
    }
  }
}
