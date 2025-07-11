import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { TokenomicsArc } from '../TokenomicsArc/TokenomicsArc'
import TokenomicsChart from '@static/png/presale/tokenomic_overlay_chart.png'
import useStyles from './style'

interface TokenomicsItem {
  title: string
  percentage: number
  color: string
}

export const Tokenomics = () => {
  const theme = useTheme()
  const isLgDown = useMediaQuery(theme.breakpoints.down('lg'))
  const { classes } = useStyles()

  const tokenomicsItems: TokenomicsItem[] = [
    {
      title: 'Community',
      percentage: 40,
      color: colors.invariant.green
    },
    {
      title: 'Strategic Reserve',
      percentage: 25,
      color: colors.invariant.pink
    },
    {
      title: 'Contributors & Grants',
      percentage: 15,
      color: colors.invariant.textGrey
    },
    {
      title: 'Liquidity',
      percentage: 10,
      color: colors.invariant.light
    },
    {
      title: 'Public Sale',
      percentage: 10,
      color: colors.invariant.yellow
    }
  ]

  return (
    <Box className={`${classes.container} ${!isLgDown ? classes.containerBackground : ''}`}>
      {isLgDown && (
        <Box className={classes.mobileChartContainer}>
          <img src={TokenomicsChart} alt='Tokenomics Chart' className={classes.mobileChart} />
        </Box>
      )}

      <Grid
        container
        className={classes.gridContainer}
        sx={{ background: isLgDown ? colors.invariant.component : 'transparent' }}>
        {tokenomicsItems.map((item, index) => (
          <Box key={index} className={classes.tokenomicsItemContainer}>
            <Box className={classes.arcContainer}>
              <TokenomicsArc color={item.color} width={65} height={98} glowColor={item.color} />
              <Box className={classes.textContainer} sx={{ color: colors.invariant.text }}>
                <Typography sx={{ ...typography.heading3 }}>{item.title}</Typography>
                <Typography sx={{ ...typography.heading4, color: item.color }}>
                  ({item.percentage}%)
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}

        {!isLgDown && (
          <img
            src={TokenomicsChart}
            alt='Tokenomics Background'
            className={classes.desktopChartImage}
          />
        )}
      </Grid>
    </Box>
  )
}
