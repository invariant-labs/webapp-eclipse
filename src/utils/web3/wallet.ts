import { WalletAdapter } from './adapters/types'
import { NightlyWalletAdapter } from './adapters/nightly'
import { SalmonWalletAdapter } from './adapters/salmon'
import { BackpackWalletAdapter } from './adapters/backpack'
import { WalletType } from '@store/consts/types'
import { sleep } from '@invariant-labs/sdk-eclipse'

let _wallet: WalletAdapter

const getEclipseWallet = (): WalletAdapter => {
  return _wallet
}

const disconnectWallet = async () => {
  await _wallet.disconnect()
}

const connectStaticWallet = async (wallet: WalletType) => {
  switch (wallet) {
    case WalletType.BACKPACK:
      _wallet = new BackpackWalletAdapter()
      break
    case WalletType.SALMON:
      _wallet = new SalmonWalletAdapter()
      break
    default:
      _wallet = new BackpackWalletAdapter()
      break
  }

  await sleep(300)
  await _wallet.connect()
}

const changeToNightlyAdapter = () => {
  _wallet = new NightlyWalletAdapter()
}

export { getEclipseWallet, disconnectWallet, connectStaticWallet, changeToNightlyAdapter }
