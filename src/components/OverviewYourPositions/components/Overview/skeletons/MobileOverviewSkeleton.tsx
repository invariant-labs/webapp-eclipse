// MobileOverviewSkeleton.tsx
import React from 'react'
import { Box, Grid, Skeleton } from '@mui/material'
import { useMobileSkeletonStyle } from './styles/useMobileSkeleton'
const MobileOverviewSkeleton: React.FC = () => {
  const { classes } = useMobileSkeletonStyle()
  const segments = Array(4).fill(null)

  const getSegmentBorderRadius = (index: number) => {
    if (index === 0) return '12px 0 0 12px'
    if (index === segments.length - 1) return '0 12px 12px 0'
    return '0'
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.chartContainer}>
        {segments.map((_, index) => (
          <Skeleton
            key={index}
            variant='rectangular'
            className={classes.skeletonSegment}
            sx={{
              width: `${100 / segments.length}%`,
              borderRadius: getSegmentBorderRadius(index)
            }}
          />
        ))}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Skeleton variant='text' className={classes.tokenTextSkeleton} />

        <Grid container spacing={1} className={classes.gridContainer}>
          {segments.map((_, index) => (
            <Grid item container key={index} className={classes.gridItem}>
              <Grid item xs={1} className={classes.logoContainer}>
                <Skeleton variant='circular' className={classes.circularSkeleton} />
              </Grid>

              <Grid item xs={1}>
                <Skeleton variant='text' className={classes.tokenSymbolSkeleton} />
              </Grid>

              <Grid item xs={10}>
                <Skeleton variant='text' className={classes.valueSkeleton} />
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

export default MobileOverviewSkeleton
