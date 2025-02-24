import { useStyles } from './style'
import icons from '@static/icons'
// import { Switch } from '@components/Switch/Switch'
import { SelectNetworkAndRPC } from './SelectNetworkAndRPC/SelectNetworkAndRPC'
import { NetworkType } from '@store/consts/static'
import { ISelectNetwork } from '@store/consts/types'
import { Modal } from '../Modal/Modal'
import { FaucetButton } from './FaucetButton/FaucetButton'

type Props = {
  rpcs: ISelectNetwork[]
  activeNetwork: NetworkType
  activeRPC: string
  onNetworkChange: (network: NetworkType, rpc: string) => void
  onFaucet: () => void
}

export const SettingsModal = ({
  rpcs,
  activeNetwork,
  activeRPC,
  onNetworkChange,
  onFaucet
}: Props) => {
  const { classes } = useStyles()

  return (
    <Modal
      icon={<img className={classes.barButtonIcon} src={icons.settings2} alt='Settings icon' />}
      title='Settings'
      showTitle>
      {/* <Switch items={['RPC', 'Priority Fee']} /> */}
      <SelectNetworkAndRPC
        rpcs={rpcs}
        activeNetwork={activeNetwork}
        activeRPC={activeRPC}
        onNetworkChange={onNetworkChange}
      />
      {activeNetwork === NetworkType.Testnet && <FaucetButton onFaucet={onFaucet} />}
    </Modal>
  )
}
