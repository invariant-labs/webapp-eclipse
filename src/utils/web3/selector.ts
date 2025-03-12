import { NightlyConnectAdapter } from '@nightlylabs/wallet-selector-solana'
import { ensureError } from '@utils/utils'

export const nightlyConnectAdapter: NightlyConnectAdapter = await NightlyConnectAdapter.build(
  {
    appMetadata: {
      name: 'Invariant',
      description: 'Invariant - AMM DEX provided concentrated liquidity',
      icon: 'https://invariant.app/favicon-192x192.png'
    },
    url: 'https://nc2.nightly.app'
  },
  { initOnConnect: true }
)

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
