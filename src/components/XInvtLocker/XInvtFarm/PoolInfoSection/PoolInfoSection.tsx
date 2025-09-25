import { Box, Grid, Skeleton, Typography } from '@mui/material'
import { star, starFill } from '@static/icons'
import { xINVT_MAIN } from '@store/consts/static'
import useStyles from './style'
import { ConvertedPool } from '@containers/LockWrapper/LockWrapper'
import { formatNumberWithCommas, removeAdditionalDecimals } from '@utils/utils'

interface IProps {
  pool: ConvertedPool | null
  switchFavouritePool: () => void
  configLoading: boolean
  userEarnLoading: boolean
  walletConnected: boolean
}
export const PoolInfoSection: React.FC<IProps> = ({
  pool,
  switchFavouritePool,
  configLoading,
  userEarnLoading,
  walletConnected
}) => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.poolInfoWrapper}>
      <Grid className={classes.titleWrapper}>
        {configLoading || pool === null ? (
          <Skeleton variant='rounded' width={140} height={32} style={{ borderRadius: 12 }} />
        ) : (
          <Box className={classes.tokenWrapper}>
            <img alt={pool.tokenX.name} width={32} src={pool.tokenX.logoURI} />
            <img alt={pool.tokenY.name} width={32} src={pool.tokenY.logoURI} />
            <Typography component='h1'>
              {pool.tokenX.symbol} - {pool.tokenY.symbol} POOL
            </Typography>
          </Box>
        )}

        <img
          alt='star icon'
          className={classes.starIcon}
          src={pool !== null ? (pool.isFavourite ? starFill : star) : star}
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
          {configLoading || pool === null ? (
            <Skeleton variant='rounded' width={50} height={17} />
          ) : (
            <>
              <img src={xINVT_MAIN.logoURI} width={16} height={16} alt='xinvt logo' />
              <Typography>{formatNumberWithCommas(pool?.poolPointsDistribiution)}</Typography>
            </>
          )}
        </Grid>
      </Grid>
      <Grid className={classes.yourEarnWapper}>
        <Grid className={classes.yourEarnTitle}>
          <Typography component='h4'>Your earn (24h)</Typography>
        </Grid>
        <Grid className={classes.poolDistributeValueWrapper}>
          {userEarnLoading ? (
            <Skeleton variant='rounded' width={50} height={17} />
          ) : walletConnected ? (
            <>
              <img src={xINVT_MAIN.logoURI} width={16} height={16} alt='xinvt logo' />
              <Typography>
                {removeAdditionalDecimals(formatNumberWithCommas(pool?.userPoints), 2)}
              </Typography>
            </>
          ) : (
            <Typography>Not connected</Typography>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PoolInfoSection
