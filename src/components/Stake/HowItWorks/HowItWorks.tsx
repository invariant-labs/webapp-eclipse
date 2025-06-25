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
          <Step number='01'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla a.</Step>
          <Step number='02' hasHiglight>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla a.
          </Step>
          <Step number='03'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla a.</Step>
          <Step number='04'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Step>
        </Box>
      </Box>
    </Box>
  )
}
