import { Grid } from '@mui/material'
import useStyles from './style'
import LiquidityStaking from './LiquidityStaking/LiquidityStaking'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import { StakeLiquidityPayload } from '@store/reducers/sBitz'
import { FAQSection } from './FAQSection/FAQSection'

export interface IStake {
  walletStatus: Status
  tokens: Record<string, SwapToken>
  handleStake: (props: StakeLiquidityPayload) => void
  inProgress: boolean
  success: boolean
}

export const Stake: React.FC<IStake> = ({
  walletStatus,
  tokens,
  handleStake,
  inProgress,
  success
}) => {
  const { classes } = useStyles()

  return (
    <Grid container className={classes.wrapper} alignItems='center'>
      <LiquidityStaking
        walletStatus={walletStatus}
        tokens={tokens}
        handleStake={handleStake}
        inProgress={inProgress}
        success={success}
      />
      <FAQSection />
    </Grid>
  )
}

export default Stake
