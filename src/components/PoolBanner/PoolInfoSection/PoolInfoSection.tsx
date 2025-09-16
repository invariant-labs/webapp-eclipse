import { Box, Grid, Typography } from '@mui/material'
import { star, starFill } from '@static/icons'
import { USDC_MAIN, xINVT_MAIN } from '@store/consts/static'
import useStyles from './style'

const PoolInfoSection = () => {
  const { classes } = useStyles()

  const isFavorite = false
  return (
    <Grid className={classes.poolInfoWrapper}>
      <Grid className={classes.titleWrapper}>
        <Box className={classes.tokenWrapper}>
          <img alt='token logo' width={32} src={xINVT_MAIN.logoURI} />
          <img alt='token logo' width={32} src={USDC_MAIN.logoURI} />
          <Typography component='h1'>xINVT - USDC POOL</Typography>
        </Box>
        <img alt='star icon' className={classes.starIcon} src={isFavorite ? starFill : star} />
      </Grid>
      <Grid className={classes.poolDistributeWapper}>
        <Grid className={classes.poolDistributeTitle}>
          <img alt='token logo' src={xINVT_MAIN.logoURI} height={16} width={16} />
          <Grid className={classes.textWrapper}>
            <Typography component='h4'>Pool distribute</Typography>
            <Typography component='h5'>(24h)</Typography>
          </Grid>
        </Grid>
        <Grid className={classes.poolDistributeValueWrapper}>
          <img src={xINVT_MAIN.logoURI} width={16} height={16} alt='xinvt logo' />
          <Typography>$123,123.123</Typography>
        </Grid>
      </Grid>
      <Grid className={classes.yourEarnWapper}>
        <Grid className={classes.yourEarnTitle}>
          <img alt='token logo' src={xINVT_MAIN.logoURI} height={16} width={16} />
          <Typography component='h4'>Your earn (24h)</Typography>
        </Grid>
        <Grid className={classes.poolDistributeValueWrapper}>
          <img src={xINVT_MAIN.logoURI} width={16} height={16} alt='xinvt logo' />
          <Typography>$123,123.123</Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PoolInfoSection
