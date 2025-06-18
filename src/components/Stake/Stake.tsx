import { Grid } from '@mui/material'
import useStyles from './style'
import LiquidityStaking from './LiquidityStaking/LiquidityStaking'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import { FAQSection } from './FAQSection/FAQSection'

export interface IStake {
  walletStatus: Status
  tokens: Record<string, SwapToken>
}

export const Stake: React.FC<IStake> = ({ walletStatus, tokens }) => {
  const { classes } = useStyles()

  return (
    <Grid container className={classes.wrapper} alignItems='center'>
      <LiquidityStaking walletStatus={walletStatus} tokens={tokens} />
      <FAQSection />
    </Grid>
  )
}

export default Stake
