import { Grid } from '@mui/material'
import useStyles from './style'

export interface ILiquidityStaking {}

export const LiquidityStaking: React.FC<ILiquidityStaking> = ({}) => {
  const { classes } = useStyles()

  return (
    <Grid container className={classes.wrapper} alignItems='center'>
      stake
    </Grid>
  )
}

export default LiquidityStaking
