import { SettingsModal } from './SettingsModal/SettingsModal'
import Box from '@mui/material/Box'
import { useStyles } from './style'
import { ChainModal } from './ChainModal/ChainModal'
import { NetworkType } from '@store/consts/static'
import { ISelectChain, ISelectNetwork } from '@store/consts/types'
import { Separator } from '@common/Separator/Separator'

type Props = {
  rpcs: ISelectNetwork[]
  activeNetwork: NetworkType
  activeRPC: string
  onNetworkChange: (network: NetworkType, rpc: string) => void
  onChainChange: (chain: ISelectChain) => void
  onFaucet: () => void
}

export const Bar = ({
  rpcs,
  activeNetwork,
  activeRPC,
  onNetworkChange,
  onChainChange,
  onFaucet
}: Props) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.buttonContainer}>
      <SettingsModal
        rpcs={rpcs}
        activeNetwork={activeNetwork}
        activeRPC={activeRPC}
        onNetworkChange={onNetworkChange}
        onFaucet={onFaucet}
      />
      <Separator size={32} />
      <ChainModal onChainChange={onChainChange} />
    </Box>
  )
}
