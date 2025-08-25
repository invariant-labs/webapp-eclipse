import { Box, Grid, Skeleton } from '@mui/material'
import { useStyles } from './style'

const OrderItemPlaceholder = () => {
  const { classes } = useStyles()

  return (
    <Grid container className={classes.card}>
      <Grid container item className={classes.headerCard}>
        <Box className={classes.mobileCardSkeletonHeader}>
          <Box className={classes.tokenIcons}>
            <Skeleton variant='circular' className={classes.circularSkeleton} />
            <Skeleton variant='circular' className={classes.circularSkeletonSmall} />
            <Skeleton variant='circular' className={classes.circularSkeleton} />
          </Box>
          <Skeleton variant='text' className={classes.skeletonText} />
        </Box>
        <Skeleton variant='rectangular' className={classes.skeleton36x36} />
      </Grid>

      <Grid container className={classes.wrapper}>
        <Grid item xs={5}>
          <Skeleton variant='rectangular' className={classes.skeleton36x100} />
        </Grid>
        <Grid item xs={7} sx={{ paddingLeft: '16px', paddingTop: '0 !important' }}>
          <Skeleton variant='rectangular' className={classes.skeleton36x100} />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default OrderItemPlaceholder
