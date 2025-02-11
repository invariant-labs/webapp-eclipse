import React from 'react'
import { Box, Grid, Skeleton, Typography } from '@mui/material'
import { colors, typography, theme } from '@static/theme'

const LegendSkeleton = () => {
  return (
    <Box sx={{ marginTop: 2 }}>
      <Typography sx={{ ...typography.body2, color: colors.invariant.textGrey }}>Tokens</Typography>

      <Grid
        container
        spacing={1}
        sx={{
          minHeight: '120px',
          overflowY: 'auto',
          marginLeft: '0 !important',
          marginTop: '8px',

          '&::-webkit-scrollbar': {
            width: '4px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.invariant.pink,
            borderRadius: '4px'
          }
        }}>
        {[1, 2, 3].map(item => (
          <Grid
            item
            container
            key={item}
            sx={{
              paddingLeft: '0 !important',
              display: 'flex',
              [theme.breakpoints.down('lg')]: {
                justifyContent: 'space-between'
              },
              justifyContent: 'flex-start'
            }}>
            <Grid
              item
              xs={2}
              alignContent={'center'}
              sx={{
                display: 'flex',
                alignItems: 'center'
              }}>
              <Skeleton
                variant='circular'
                width={24}
                height={24}
                sx={{
                  bgcolor: colors.invariant.light
                }}
              />
            </Grid>

            <Grid item xs={3} alignContent={'center'}>
              <Skeleton
                variant='text'
                width={60}
                height={30}
                sx={{
                  bgcolor: colors.invariant.light,
                  ...typography.heading4
                }}
              />
            </Grid>

            <Grid
              item
              xs={5}
              alignContent={'center'}
              sx={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
              <Skeleton
                variant='text'
                width={80}
                height={30}
                sx={{
                  bgcolor: colors.invariant.light,
                  ...typography.heading4
                }}
              />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default LegendSkeleton
