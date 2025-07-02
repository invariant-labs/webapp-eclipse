import { Box, Typography } from '@mui/material'
import howItWorksImage from '@static/png/how-it-works.png'
import { Step } from './Step/Step'
import useStyles from './style'

export const HowItWorks = () => {
  const { classes } = useStyles()

  return (
    <Box className={classes.container}>
      <Typography className={classes.title}>How it works</Typography>
      <Box className={classes.innerContainer}>
        <img className={classes.image} src={howItWorksImage} alt='how it works' />
        <Box className={classes.stepsContainer}>
          <Step number='01'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis tincidunt gravida mi, vel
            sollicitudin purus.
          </Step>
          <Step number='02' hasHiglight>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent nibh libero, laoreet
            vitae imperdiet a, vestibulum et odio. Curabitur iaculis.
          </Step>
          <Step number='03'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam nec tortor ipsum. Phasellus
            sodales ipsum.
          </Step>
          <Step number='04'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent nibh libero, laoreet
            vitae imperdiet a, vestibulum et odio. Curabitur iaculis.
          </Step>
        </Box>
      </Box>
    </Box>
  )
}
