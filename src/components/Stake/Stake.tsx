import { Grid } from '@mui/material'
import useStyles from './style'
import LiquidityStaking from './LiquidityStaking/LiquidityStaking'

export interface ILiquidityStaking {}

export const Stake: React.FC<ILiquidityStaking> = ({}) => {
  const { classes } = useStyles()

  return (
    <Grid container className={classes.wrapper} alignItems='center'>
      <LiquidityStaking />
    </Grid>
  )
}

export default Stake
