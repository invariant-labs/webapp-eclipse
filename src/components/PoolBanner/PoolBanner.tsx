import { Grid } from '@mui/material'
import useStyles from './style'
import NewPoolSection from './NewPoolSection/NewPoolSection'
import PoolInfoSection from './PoolInfoSection/PoolInfoSection'
import { ClaimSection } from './ClaimSection/ClaimSection'

export interface IPoolBanner {
  handleOpenPosition: () => void
  toggleAddToFavourites: () => void
  handleClaim: () => void
  poolDistribute: number
  userEarn: number
  isFavourite: boolean
}

const PoolBanner: React.FC<IPoolBanner> = ({
  handleOpenPosition,
  toggleAddToFavourites,
  handleClaim,
  poolDistribute,
  userEarn,
  isFavourite
}) => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.wrapper}>
      <Grid className={classes.leftBannerWrapper}>
        <NewPoolSection handleOpenPosition={handleOpenPosition} />
        <PoolInfoSection
          poolDistribute={poolDistribute}
          toggleAddToFavourites={toggleAddToFavourites}
          userEarn={userEarn}
          isFavourite={isFavourite}
        />
      </Grid>
      <Grid className={classes.rightBannerWapper}>
        <ClaimSection handleClaim={handleClaim} />
      </Grid>
    </Grid>
  )
}

export default PoolBanner
