import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { WalletAdapter } from './types'
import { nightlyConnectAdapter } from '../selector'
import { DEFAULT_PUBLICKEY } from '@store/consts/static'
import { ensureError } from '@utils/utils'

export class NightlyWalletAdapter implements WalletAdapter {
  constructor() {
    this.connect = this.connect.bind(this)
  }

  get connected() {
    return nightlyConnectAdapter.connected
  }

  signAllTransactions = async (
    transactions: Transaction[] | VersionedTransaction[]
  ): Promise<Transaction[] | VersionedTransaction[]> => {
    return await nightlyConnectAdapter.signAllTransactions(transactions)
  }

  get publicKey() {
    return nightlyConnectAdapter.publicKey ?? DEFAULT_PUBLICKEY
  }

  signTransaction = async (transaction: Transaction | VersionedTransaction) => {
    return await nightlyConnectAdapter.signTransaction(transaction)
  }

  signMessage = async (message: Uint8Array) => {
    return await nightlyConnectAdapter.signMessage(message)
  }

  connect = async () => {
    if (!nightlyConnectAdapter.connected) {
      try {
        await nightlyConnectAdapter.connect()
      } catch (e: unknown) {
        const error = ensureError(e)
        console.log(error)
      }
    }
  }

  disconnect = async () => {
    if (nightlyConnectAdapter) {
      try {
        await nightlyConnectAdapter.disconnect()
      } catch (e: unknown) {
        const error = ensureError(e)
        console.log(error)
      }
    }
  }
}
