import { PublicKey, Transaction } from '@solana/web3.js'
import { WalletAdapter } from './types'
import { DEFAULT_PUBLICKEY } from '@store/consts/static'

type SalmonEvent = 'disconnect' | 'connect'
type SalmonRequestMethod = 'connect' | 'disconnect' | 'signTransaction' | 'signAllTransactions'

interface SalmonProvider {
  publicKey?: PublicKey
  isConnected?: boolean
  autoApprove?: boolean
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  on: (event: SalmonEvent, handler: (args: any) => void) => void
  request: (method: SalmonRequestMethod, params: any) => Promise<any>
}

export class SalmonWalletAdapter implements WalletAdapter {
  _salmonProvider: SalmonProvider | undefined
  constructor() {
    this.connect = this.connect.bind(this)
  }

  get connected() {
    return this._salmonProvider?.isConnected || false
  }

  get autoApprove() {
    return this._salmonProvider?.autoApprove || false
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this._salmonProvider) {
      return transactions
    }

    return await this._salmonProvider.signAllTransactions(transactions)
  }

  get publicKey() {
    return this._salmonProvider?.publicKey
      ? new PublicKey(this._salmonProvider?.publicKey?.toString())
      : DEFAULT_PUBLICKEY
  }

  async signTransaction(transaction: Transaction) {
    if (!this._salmonProvider) {
      return transaction
    }

    return await this._salmonProvider.signTransaction(transaction)
  }

  connect = async () => {
    if (this._salmonProvider) {
      return
    }
    let provider: SalmonProvider

    if ((window as any)?.salmon) {
      provider = (window as any).salmon
    } else {
      window.open('https://salmonwallet.io/', '_blank')
      return
    }

    if (!provider.isConnected) {
      await provider.connect()
    }
    this._salmonProvider = provider
  }

  disconnect = async () => {
    if (this._salmonProvider) {
      await this._salmonProvider.disconnect()
      this._salmonProvider = undefined
    }
  }
}
