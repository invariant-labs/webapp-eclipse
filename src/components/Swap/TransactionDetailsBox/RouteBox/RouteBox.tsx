import { Box, Grid, Typography } from '@mui/material'
import { useStyles } from './styles'
import routeArrow1 from '@static/svg/routeArrow1.svg'
import routeArrow2 from '@static/svg/routeArrow2.svg'
import tokenImg from '@static/svg/unknownToken.svg'
const RouteBox = () => {
  const mockedData = {
    mockedFee: 0.01,
    mockedTicker: 'ETH',
    mockedAmont: 3203,
    useTwoPools: true,
    amountPrecent: 100
  }
  const { useTwoPools } = mockedData
  const { classes } = useStyles({ useTwoPools })

  return (
    <Grid
      container
      justifyContent='space-around'
      alignItems='center'
      className={classes.swapFlowContainer}>
      <Box>
        <img src={tokenImg} />
        <Typography className={classes.tokenLabel}>{mockedData.mockedTicker}</Typography>
      </Box>
      <Box className={classes.arrowContainer}>
        <Typography className={classes.routeLabel}>{mockedData.mockedFee}% fee</Typography>
        <img
          className={classes.routeIcon}
          src={mockedData.useTwoPools ? routeArrow1 : routeArrow2}
          alt='route arrow'
        />

        <Typography className={classes.routeLabel}>
          {' '}
          {useTwoPools
            ? `${mockedData.mockedAmont} ${mockedData.mockedTicker}`
            : `${mockedData.amountPrecent}%`}
        </Typography>
      </Box>
      {useTwoPools && (
        <>
          <Box>
            <img src={tokenImg} />
            <Typography className={classes.tokenLabel}>{mockedData.mockedTicker}</Typography>
          </Box>
          <Box className={classes.arrowContainer}>
            <Typography className={classes.routeLabel}>{mockedData.mockedFee}% fee</Typography>
            <img className={classes.routeIcon} src={routeArrow1} alt='route arrow' />
            <Typography className={classes.routeLabel}>
              {mockedData.mockedAmont} {mockedData.mockedTicker}
            </Typography>
          </Box>
        </>
      )}
      <Box>
        <img src={tokenImg} />
        <Typography className={classes.tokenLabel}>{mockedData.mockedTicker}</Typography>
      </Box>
    </Grid>
  )
}

export default RouteBox
