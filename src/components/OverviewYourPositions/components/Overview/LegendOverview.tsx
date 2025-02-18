import { Box, Typography, Grid } from '@mui/material'
import { typography, theme, colors } from '@static/theme'
import {
  TokenColorOverride,
  useAverageLogoColor
} from '@store/hooks/userOverview/useAverageLogoColor'
import { formatNumber2 } from '@utils/utils'
import React from 'react'
interface LegendOverviewProps {
  sortedPositions: any[]
  logoColors: Record<string, string>
  tokenColorOverrides: TokenColorOverride[]
}
export const LegendOverview: React.FC<LegendOverviewProps> = ({
  sortedPositions,
  logoColors,
  tokenColorOverrides
}) => {
  const { getTokenColor } = useAverageLogoColor()

  return (
    <Box sx={{ marginTop: 2 }}>
      <Typography sx={{ ...typography.body2, color: colors.invariant.textGrey }}>Tokens</Typography>

      <Grid
        container
        spacing={1}
        sx={{
          height: '160px',
          width: '90%',
          overflowY: sortedPositions.length <= 3 ? 'hidden' : 'auto',
          marginTop: '8px',
          marginLeft: '0 !important',
          '&::-webkit-scrollbar': {
            padding: 0,
            width: '4px'
          },
          '&::-webkit-scrollbar-track': {
            background: colors.invariant.componentDark
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.invariant.pink,
            borderRadius: '4px'
          }
        }}>
        {sortedPositions.map(position => {
          const textColor = getTokenColor(
            position.token,
            logoColors[position.logo ?? ''] ?? '',
            tokenColorOverrides
          )
          return (
            <Grid
              item
              container
              key={position.token}
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
                <img
                  src={position.logo}
                  alt={'Token logo'}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '100%'
                  }}
                />
              </Grid>

              <Grid item xs={3} alignContent={'center'}>
                <Typography
                  style={{
                    ...typography.heading4,
                    color: textColor
                  }}>
                  {position.token}
                </Typography>
              </Grid>

              <Grid item xs={6} alignContent={'center'}>
                <Typography
                  style={{
                    ...typography.heading4,
                    color: colors.invariant.text,
                    textAlign: 'right'
                  }}>
                  ${formatNumber2(position.value)}
                </Typography>
              </Grid>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
