import { NightlyConnectAdapter } from '@nightlylabs/wallet-selector-solana'
import { ensureError } from '@utils/utils'
import { WalletAdapter } from './adapters/types'

export interface MergedWalletAdapter extends WalletAdapter {
  canEagerConnect: () => Promise<boolean>
}

export const nightlyConnectAdapter: MergedWalletAdapter = (await NightlyConnectAdapter.build(
  {
    appMetadata: {
      name: 'Invariant',
      description: 'Invariant - AMM DEX provided concentrated liquidity',
      icon: 'https://invariant.app/favicon-192x192.png'
    },
    url: 'https://nc2.nightly.app'
  },
  { initOnConnect: true }
)) as MergedWalletAdapter

export const openWalletSelectorModal = async () => {
  try {
    if (nightlyConnectAdapter.connected) {
      return
    }
    await nightlyConnectAdapter.connect()
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
  }
}
