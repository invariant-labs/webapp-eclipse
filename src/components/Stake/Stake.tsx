import { Grid } from '@mui/material'
import useStyles from './style'
import LiquidityStaking from './LiquidityStaking/LiquidityStaking'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import { StakeLiquidityPayload } from '@store/reducers/sBitz'
import { NetworkType } from '@store/consts/static'

export interface IStake {
  walletStatus: Status
  tokens: Record<string, SwapToken>
  handleStake: (props: StakeLiquidityPayload) => void
  handleUnstake: (props: StakeLiquidityPayload) => void
  inProgress: boolean
  success: boolean
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  networkType: NetworkType
}

export enum StakeChartSwitcher {
  Stake = 'Stake',
  Stats = 'Stats'
}

export const Stake: React.FC<IStake> = ({
  walletStatus,
  tokens,
  handleStake,
  handleUnstake,
  inProgress,
  success,
  onConnectWallet,
  onDisconnectWallet,
  networkType
}) => {
  const { classes } = useStyles()

  return (
    <Grid container className={classes.wrapper} alignItems='center'>
      <LiquidityStaking
        walletStatus={walletStatus}
        tokens={tokens}
        handleStake={handleStake}
        handleUnstake={handleUnstake}
        inProgress={inProgress}
        success={success}
        onConnectWallet={onConnectWallet}
        onDisconnectWallet={onDisconnectWallet}
        networkType={networkType}
      />
    </Grid>
  )
}

export default Stake
