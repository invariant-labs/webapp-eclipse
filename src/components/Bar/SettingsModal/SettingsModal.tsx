import { useStyles } from './style'
import icons from '@static/icons'
import { Switch } from '@components/Switch/Switch'
import { SelectNetworkAndRPC } from './SelectNetworkAndRPC/SelectNetworkAndRPC'
import { NetworkType } from '@store/consts/static'
import { ISelectNetwork } from '@store/consts/types'
import { Modal } from '../Modal/Modal'

type Props = {
  rpcs: ISelectNetwork[]
  activeNetwork: NetworkType
  activeRPC: string
  onNetworkChange: (network: NetworkType, rpc: string) => void
}

export const SettingsModal = ({ rpcs, activeNetwork, activeRPC, onNetworkChange }: Props) => {
  const { classes } = useStyles()

  return (
    <Modal
      icon={<img className={classes.barButtonIcon} src={icons.settings2} alt='Settings icon' />}
      title='Settings'>
      <Switch items={['RPC', 'Priority Fee']} />
      <SelectNetworkAndRPC
        rpcs={rpcs}
        activeNetwork={activeNetwork}
        activeRPC={activeRPC}
        onNetworkChange={onNetworkChange}
      />
    </Modal>
  )
}
