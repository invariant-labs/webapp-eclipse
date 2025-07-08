import { Grid, Skeleton, Typography } from '@mui/material'
import useStyles from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { infoCircleIcon } from '@static/icons'
import ResponsivePieChart from '@components/Portfolio/Overview/OverviewPieChart/ResponsivePieChart'
import { colors } from '@static/theme'
import BitzArc from './BitzArc'
import { useEffect, useState } from 'react'
import { formatNumberWithCommas } from '@utils/utils'

interface TokenColors {
  isLoading: boolean
  bitzAmount: number
  sbitzAmount: number
  totalSupply: number
}

export const BitzChart: React.FC<TokenColors> = ({
  isLoading,
  bitzAmount,
  sbitzAmount,
  totalSupply
}) => {
  const [tokenColors, setTokenColors] = useState({
    sBITZ: { color: colors.invariant.lightBlue, label: 'sBITZ', value: 0, percent: 0 },
    BITZ: { color: colors.invariant.green, label: 'BITZ', value: 0, percent: 0 },
    unstake: { color: colors.invariant.textGrey, label: 'Unstake', value: 0, percent: 0 }
  })
  useEffect(() => {
    if (!isLoading) {
      setTokenColors({
        sBITZ: {
          color: colors.invariant.lightBlue,
          label: 'sBITZ',
          value: sbitzAmount,
          percent: (sbitzAmount / totalSupply) * 100
        },
        BITZ: {
          color: colors.invariant.green,
          label: 'BITZ',
          value: bitzAmount,
          percent: (bitzAmount / totalSupply) * 100
        },
        unstake: {
          color: colors.invariant.textGrey,
          label: 'Unstake',
          value: totalSupply - sbitzAmount - bitzAmount,
          percent: ((totalSupply - sbitzAmount - bitzAmount) / totalSupply) * 100
        }
      })
    }
  }, [isLoading])
  const chartData = Object.values(tokenColors).map(t => ({
    id: t.label,
    label: t.label,
    value: t.value,
    color: t.color
  }))
  const chartColors = Object.values(tokenColors).map(t => t.color)
  const { classes } = useStyles()

  return (
    <Grid className={classes.chartWrapper}>
      <Grid className={classes.leftWrapper}>
        <Grid className={classes.supplyTitleWrapper}>
          <Typography component='h4'>
            BITZ supply{' '}
            <TooltipHover title='lorem ipsum'>
              <img width={14} src={infoCircleIcon} />
            </TooltipHover>
          </Typography>
          {isLoading ? (
            <Skeleton variant='rounded' width={160} height={36} />
          ) : (
            <Typography component='h3'>{formatNumberWithCommas(totalSupply.toFixed(2))}</Typography>
          )}
        </Grid>

        <Grid className={classes.legendWrapper}>
          {Object.entries(tokenColors).map(([key, value]) => (
            <Grid key={key} className={classes.singleLegendWrapper}>
              <BitzArc color={value.color} size={30} />
              <Grid className={classes.legendText}>
                <Typography component='h3'>{value.label}</Typography>
                {isLoading ? (
                  <Skeleton variant='rounded' width={60} height={24} />
                ) : (
                  <Typography sx={{ color: `${value.color} !important ` }} component='h4'>
                    {value.percent.toFixed(2)}%
                  </Typography>
                )}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid className={classes.rightWrapper}>
        <ResponsivePieChart
          isLoading={isLoading}
          chartColors={chartColors}
          data={chartData}
          height={250}
          tooltipPrefix=''
        />
      </Grid>
    </Grid>
  )
}
