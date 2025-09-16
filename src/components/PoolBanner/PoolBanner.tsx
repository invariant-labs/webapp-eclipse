import { Grid } from '@mui/material'
import useStyles from './style'

import NewPoolSection from './NewPoolSection/NewPoolSection'

import PoolInfoSection from './PoolInfoSection/PoolInfoSection'

import { ClaimSection } from './ClaimSection/ClaimSection'
const PoolBanner = () => {
  const { classes } = useStyles()
  return (
    <Grid className={classes.wrapper}>
      <Grid className={classes.leftBannerWrapper}>
        <NewPoolSection />
        <PoolInfoSection />
      </Grid>
      <Grid className={classes.rightBannerWapper}>
        <ClaimSection />
      </Grid>
    </Grid>
  )
}

export default PoolBanner
