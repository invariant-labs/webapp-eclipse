import React from 'react'
import { Box, Grid, Skeleton } from '@mui/material'
import { colors } from '@static/theme'

const MobileOverviewSkeleton: React.FC = () => {
  const segments = Array(4).fill(null)

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Box
        sx={{
          height: '24px',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          mb: 3
        }}>
        {segments.map((_, index) => (
          <Skeleton
            key={index}
            variant='rectangular'
            sx={{
              width: `${100 / segments.length}%`,
              height: '100%',
              borderRadius:
                index === 0
                  ? '12px 0 0 12px'
                  : index === segments.length - 1
                    ? '0 12px 12px 0'
                    : '0',
              bgcolor: 'rgba(255, 255, 255, 0.1)'
            }}
          />
        ))}
      </Box>

      <Box sx={{ mt: 2 }}>
        {/* "Tokens" text skeleton */}
        <Skeleton
          variant='text'
          sx={{
            mb: 2,
            width: '60px',
            height: '24px',
            bgcolor: 'rgba(255, 255, 255, 0.1)'
          }}
        />

        <Grid
          container
          spacing={1}
          sx={{
            marginTop: 1,
            width: '100% !important',
            minHeight: '120px',
            marginLeft: '0 !important',
            overflowY: 'auto',
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
          {segments.map((_, index) => (
            <Grid
              item
              container
              key={index}
              sx={{
                paddingLeft: '0 !important',
                marginLeft: '0 !important',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1
              }}>
              <Grid
                item
                xs={1}
                sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                <Skeleton
                  variant='circular'
                  sx={{
                    width: '24px',
                    height: '24px',
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }}
                />
              </Grid>

              <Grid item xs={1}>
                <Skeleton
                  variant='text'
                  sx={{
                    width: '40px',
                    height: '24px',
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }}
                />
              </Grid>

              <Grid item xs={10}>
                <Skeleton
                  variant='text'
                  sx={{
                    width: '100%',
                    height: '24px',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    textAlign: 'right'
                  }}
                />
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

export default MobileOverviewSkeleton
