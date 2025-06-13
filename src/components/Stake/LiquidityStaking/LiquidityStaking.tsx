import { Grid } from '@mui/material'
import useStyles from './style'
import Switcher, { StakeSwitch } from './Switcher/Switcher'
import { useState } from 'react'

export interface ILiquidityStaking {}

export const LiquidityStaking: React.FC<ILiquidityStaking> = ({}) => {
  const { classes } = useStyles()

  const [switchTab, setSwitchTab] = useState<StakeSwitch>(StakeSwitch.Stake)

  return (
    <Grid container className={classes.wrapper} alignItems='center'>
      <Switcher switchTab={switchTab} setSwitchTab={setSwitchTab} />
    </Grid>
  )
}

export default LiquidityStaking
