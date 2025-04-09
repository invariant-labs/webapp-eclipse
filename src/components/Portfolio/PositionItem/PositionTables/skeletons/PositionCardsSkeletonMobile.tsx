import { Box, Grid, Skeleton } from '@mui/material'
import { useMobileSkeletonStyles } from './mobileSkeleton'

const PositionCardsSkeletonMobile = () => {
  const { classes } = useMobileSkeletonStyles()
  const cards = [1, 2, 3]

  return (
    <>
      {cards.map(index => (
        <Grid key={index} container className={classes.card}>
          <Grid container item className={classes.innerCard}>
            <Box className={classes.mobileCardSkeletonHeader}>
              <Box className={classes.tokenIcons}>
                <Skeleton variant='circular' className={classes.circularSkeleton} />
                <Skeleton variant='circular' className={classes.circularSkeletonSmall} />
                <Skeleton variant='circular' className={classes.circularSkeleton} />
              </Box>
              <Skeleton variant='text' className={classes.textSkeleton} />
            </Box>

            <Skeleton variant='rectangular' className={classes.skeletonRect36} />
          </Grid>

          <Grid container className={classes.marginTop16}>
            <Grid item xs={5}>
              <Skeleton variant='rectangular' className={classes.skeletonRect36} />
            </Grid>

            <Grid item xs={7} className={classes.paddingLeft16PT0}>
              <Skeleton variant='rectangular' className={classes.skeletonRect36} />
            </Grid>
          </Grid>

          <Grid container spacing={2} className={classes.marginTopBottom16}>
            <Grid item xs={6} className={classes.paddingTop0Important}>
              <Grid container justifyContent='center'>
                <Skeleton variant='rectangular' className={classes.skeletonRect36} />
              </Grid>
            </Grid>

            <Grid item xs={6} className={classes.paddingTop0Important}>
              <Grid container justifyContent='center'>
                <Skeleton variant='rectangular' className={classes.skeletonRect36} />
              </Grid>
            </Grid>
          </Grid>

          <Grid container className={classes.chartContainer}>
            <Skeleton variant='rectangular' className={classes.skeletonRect40} />
          </Grid>
        </Grid>
      ))}
    </>
  )
}

export default PositionCardsSkeletonMobile
