import { Box, Typography } from '@mui/material'
import useStyles from './style'
import howItWorksImage from '@static/png/how-it-works.png'
import { Step } from './Step/Step'

export const HowItWorks = () => {
  const { classes } = useStyles()

  return (
    <Box className={classes.container}>
      <Typography className={classes.title}>How it works</Typography>
      <Box className={classes.innerContainer}>
        <img className={classes.image} src={howItWorksImage} alt='how it works' />
        <Box className={classes.stepsContainer}>
          <Step number='01'>
            Staking BITZ with Invariant issues sBITZ, a LST that continuously accrues staking
            rewards. It replicates the benefits of traditional staking while preserving full
            liquidity.
          </Step>
          <Step number='02' hasHiglight>
            The value of sBITZ increases over time relative to BITZ, as staking rewards are
            automatically reflected in its exchange rate.
          </Step>
          <Step number='03'>
            Compounding every 5 minutes drastically improves staking efficiency compared to standard
            setups that compound once or twice a day. This results in higher APY and faster value
            growth.
          </Step>
          <Step number='04'>
            When unstaking, users receive more BITZ than initially deposited, since the value of
            sBITZ appreciates over time through continuous rewards compounding.
          </Step>
        </Box>
      </Box>
    </Box>
  )
}
