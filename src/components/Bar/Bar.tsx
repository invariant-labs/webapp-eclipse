import { SettingsModal } from './SettingsModal/SettingsModal'
import Box from '@mui/material/Box'
import { useStyles } from './style'
import { ChainModal } from './ChainModal/ChainModal'
import { NetworkType } from '@store/consts/static'
import { ISelectChain, ISelectNetwork } from '@store/consts/types'
import { Separator } from '@common/Separator/Separator'
import { Button, Grid, useMediaQuery } from '@mui/material'
import { theme } from '@static/theme'
import GradientBorder from '@common/GradientBorder/GradientBorder'

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
  const isSmDown = useMediaQuery(theme.breakpoints.down(400))

  return (
    <Grid display={'flex'} alignItems={'center'} gap={isSmDown ? 1 : 2}>
      <Box>
        <GradientBorder borderRadius={14} borderWidth={1}>
          <Button className={classes.claimBtn}>
            <a href={'https://claims.invariant.app/claim'} target='_blank' className={classes.link}>
              Claim
            </a>
          </Button>
        </GradientBorder>
      </Box>
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
      </Box>{' '}
    </Grid>
  )
}
