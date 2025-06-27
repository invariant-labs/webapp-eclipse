import { Box, Typography } from '@mui/material'
import useStyles from './style'

interface StepInterface {
  number: string
  children: string
  hasHiglight?: boolean
}

export const Step: React.FC<StepInterface> = ({ number, children, hasHiglight = false }) => {
  const { classes, cx } = useStyles()

  return (
    <Box className={classes.container}>
      <Box className={classes.numberContainer}>
        <Box className={cx(classes.box, { [classes.boxHighlighted]: hasHiglight })}></Box>
        <Typography className={classes.number}>{number}</Typography>
      </Box>
      <Typography className={classes.content}>{children}</Typography>
    </Box>
  )
}
