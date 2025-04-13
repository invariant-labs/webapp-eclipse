import { Box, Typography } from '@mui/material'
import loadingAnimation from '@static/gif/loading.gif'
import useStyles from './style'

const TransactionRouteLoader = () => {
  const { classes } = useStyles()

  return (
    <Box className={classes.loaderContainer}>
      <img src={loadingAnimation} alt='Loading animation' className={classes.animationImage} />
      <Typography className={classes.pleaseWaitText}>Please Wait!</Typography>
      <Typography className={classes.lookingForRouteText}>
        We are looking for the best route!
      </Typography>
    </Box>
  )
}

export default TransactionRouteLoader
