import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { WalletAdapter } from './types'
import { DEFAULT_PUBLICKEY } from '@store/consts/static'
import { ensureError } from '@utils/utils'

interface NightlyProvider {
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
export class NightlyAdapter implements WalletAdapter {
  _nightlyProvider: NightlyProvider | undefined
  constructor() {
    this.connect = this.connect.bind(this)
  }
  get connected() {
    return this._nightlyProvider?.isConnected || false
  }

  signAllTransactions = async (
    transactions: Transaction[] | VersionedTransaction[]
  ): Promise<Transaction[] | VersionedTransaction[]> => {
    if (!this._nightlyProvider) {
      return transactions
    }
    return await this._nightlyProvider.signAllTransactions(transactions)
  }
  get publicKey() {
    return this._nightlyProvider?.publicKey
      ? new PublicKey(this._nightlyProvider?.publicKey?.toString())
      : DEFAULT_PUBLICKEY
  }

  signTransaction = async (transaction: Transaction | VersionedTransaction) => {
    if (!this._nightlyProvider) {
      return transaction
    }
    return await this._nightlyProvider.signTransaction(transaction)
  }

  sendMessage = async (message: Uint8Array) => {
    if (!this._nightlyProvider) {
      throw new Error('Nightly Wallet not connected' + message)
    }
    return await this._nightlyProvider.sendMessage(message)
  }

  signMessage = async (message: Uint8Array) => {
    if (!this._nightlyProvider) {
      throw new Error('Nightly Wallet not connected')
    }

    if (!(message instanceof Uint8Array)) {
      throw new TypeError('Expected message to be a Uint8Array')
    }

    const signedMessage = await this._nightlyProvider.signMessage(message)

    return new Uint8Array(signedMessage.signature as ArrayBuffer)
  }

  connect = async () => {
    if (this._nightlyProvider) {
      return
    }
    let provider: NightlyProvider
    if ((window as any)?.nightly) {
      provider = (window as any).nightly.solana
    } else {
      window.open('https://nightly.app/', '_blank')
      return
    }
    if (!provider.isConnected) {
      await provider.connect()
    }
    this._nightlyProvider = provider
  }
  disconnect = async () => {
    if (this._nightlyProvider) {
      try {
        await this._nightlyProvider.disconnect()
        this._nightlyProvider = undefined
      } catch (e: unknown) {
        const error = ensureError(e)
        console.log(error)
      }
    }
  }
}
