import React from 'react'
import { Box, Grid, Skeleton, Typography } from '@mui/material'
import { useDesktopSkeleton } from './styles/useDesktopSkeleton'

const LegendSkeleton: React.FC = () => {
  const { classes } = useDesktopSkeleton()

  return (
    <Box className={classes.container}>
      <Typography className={classes.tokenText}>Tokens</Typography>

      <Grid container spacing={1} className={classes.gridContainer}>
        {[1, 2, 3, 4].map(item => (
          <Grid item container key={item} className={classes.gridItem}>
            <Grid item xs={5} alignContent={'center'}>
              <Skeleton
                variant='text'
                width={80}
                height={32}
                sx={{ borderRadius: '6px' }}
                className={classes.textSkeleton}
              />
            </Grid>

            <Grid item xs={5} alignContent={'center'} className={classes.valueContainer}>
              <Skeleton
                variant='text'
                sx={{ borderRadius: '6px' }}
                width={80}
                height={32}
                className={classes.textSkeleton}
              />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default LegendSkeleton
