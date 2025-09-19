import { Box, Grid, Typography } from '@mui/material'
import { star, starFill } from '@static/icons'
import { USDC_MAIN, xINVT_MAIN } from '@store/consts/static'
import useStyles from './style'
import { PoolBannerItem } from '@store/consts/types'

interface IProps {
  pool: PoolBannerItem
  switchFavouritePool: () => void
}
export const PoolInfoSection: React.FC<IProps> = ({ pool, switchFavouritePool }) => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.poolInfoWrapper}>
      <Grid className={classes.titleWrapper}>
        <Box className={classes.tokenWrapper}>
          <img alt='token logo' width={32} src={xINVT_MAIN.logoURI} />
          <img alt='token logo' width={32} src={USDC_MAIN.logoURI} />
          <Typography component='h1'>
            {pool.tokenX.symbol} - {pool.tokenY.symbol} POOL
          </Typography>
        </Box>
        <img
          alt='star icon'
          className={classes.starIcon}
          src={pool.isFavourite ? starFill : star}
          onClick={switchFavouritePool}
        />
      </Grid>
      <Grid className={classes.poolDistributeWapper}>
        <Grid className={classes.poolDistributeTitle}>
          <Grid className={classes.textWrapper}>
            <Typography component='h4'>Pool distribution (24H)</Typography>
          </Grid>
        </Grid>
        <Grid className={classes.poolDistributeValueWrapper}>
          <img src={xINVT_MAIN.logoURI} width={16} height={16} alt='xinvt logo' />
          <Typography>{pool.poolDistribute}</Typography>
        </Grid>
      </Grid>
      <Grid className={classes.yourEarnWapper}>
        <Grid className={classes.yourEarnTitle}>
          <Typography component='h4'>Your earn (24h)</Typography>
        </Grid>
        <Grid className={classes.poolDistributeValueWrapper}>
          <img src={xINVT_MAIN.logoURI} width={16} height={16} alt='xinvt logo' />
          <Typography>{pool.userEarn}</Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PoolInfoSection
