import React from 'react'
import { Box, Grid, Skeleton, Typography } from '@mui/material'
import { useDesktopSkeleton } from './styles/useDesktopSkeleton'

const LegendSkeleton: React.FC = () => {
  const { classes } = useDesktopSkeleton()

  return (
    <Box className={classes.container}>
      <Typography className={classes.tokenText}>Tokens</Typography>

      <Grid container spacing={1} className={classes.gridContainer}>
        {[1, 2, 3].map(item => (
          <Grid item container key={item} className={classes.gridItem}>
            <Grid item xs={2} alignContent={'center'} className={classes.logoContainer}>
              <Skeleton
                variant='circular'
                width={24}
                height={24}
                className={classes.circularSkeleton}
              />
            </Grid>

            <Grid item xs={3} alignContent={'center'}>
              <Skeleton variant='text' width={60} height={30} className={classes.textSkeleton} />
            </Grid>

            <Grid item xs={5} alignContent={'center'} className={classes.valueContainer}>
              <Skeleton variant='text' width={80} height={30} className={classes.textSkeleton} />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default LegendSkeleton
