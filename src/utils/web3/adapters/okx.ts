import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { WalletAdapter } from './types'
import { DEFAULT_PUBLICKEY } from '@store/consts/static'

type OkxEvent = 'disconnect' | 'connect'
type OkxRequestMethod = 'connect' | 'disconnect' | 'signTransaction' | 'signAllTransactions'

interface OkxProvider {
  publicKey?: PublicKey
  isConnected?: boolean
  signTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<Transaction | VersionedTransaction>
  signAllTransactions: (
    transactions: Transaction[] | VersionedTransaction[]
  ) => Promise<Transaction[] | VersionedTransaction[]>
  signMessage: (message: Uint8Array) => Promise<any>
  sendMessage: (message: Uint8Array) => Promise<Uint8Array>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  on: (event: OkxEvent, handler: (args: any) => void) => void
  request: (method: OkxRequestMethod, params: any) => Promise<any>
}

export class OkxWalletAdapter implements WalletAdapter {
  _okxProvider: OkxProvider | undefined
  constructor() {
    this.connect = this.connect.bind(this)
  }

  get connected() {
    return this._okxProvider?.isConnected || false
  }

  signAllTransactions = async (
    transactions: Transaction[] | VersionedTransaction[]
  ): Promise<Transaction[] | VersionedTransaction[]> => {
    if (!this._okxProvider) {
      return transactions
    }

    return await this._okxProvider.signAllTransactions(transactions)
  }

  get publicKey() {
    return this._okxProvider?.publicKey
      ? new PublicKey(this._okxProvider?.publicKey?.toString())
      : DEFAULT_PUBLICKEY
  }

  signTransaction = async (transaction: Transaction | VersionedTransaction) => {
    if (!this._okxProvider) {
      return transaction
    }

    return await this._okxProvider.signTransaction(transaction)
  }

  sendMessage = async (message: Uint8Array) => {
    if (!this._okxProvider) {
      throw new Error('Salmon Wallet not connected' + message)
    }
    return await this._okxProvider.sendMessage(message)
  }

  signMessage = async (message: Uint8Array) => {
    if (!this._okxProvider) {
      throw new Error('Salmon Wallet not connected')
    }

    if (!(message instanceof Uint8Array)) {
      throw new TypeError('Expected message to be a Uint8Array')
    }

    const signedMessage = await this._okxProvider.signMessage(message)

    return new Uint8Array(signedMessage.signature as ArrayBuffer)
  }

  connect = async () => {
    if (this._okxProvider) {
      return
    }
    let provider: OkxProvider

    if ((window as any)?.okxwallet) {
      provider = (window as any).okxwallet.solana
    } else {
      window.open('https://www.okx.com/download', '_blank')
      return
    }

    if (!provider.isConnected) {
      await provider.connect()
    }
    this._okxProvider = provider
  }

  disconnect = async () => {
    if (this._okxProvider) {
      await this._okxProvider.disconnect()
      this._okxProvider = undefined
    }
  }
}
