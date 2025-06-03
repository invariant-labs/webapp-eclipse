import useStyles from './style'
import { Typography, LinearProgress, Box, useMediaQuery } from '@mui/material'
import { ResponsivePie } from '@nivo/pie'
import { colors, theme, typography } from '@static/theme'
import { formatNumberWithSuffix } from '@utils/utils'
import { useState, useEffect, useMemo } from 'react'

export interface ILockStatsPopover {
  lockedX: number
  lockedY: number
  liquidityX: number
  liquidityY: number
  symbolX: string
  symbolY: string
}

export const LockStatsPopover = ({
  lockedX,
  lockedY,
  liquidityX,
  liquidityY,
  symbolX,
  symbolY
}: ILockStatsPopover) => {
  const { classes } = useStyles()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const [animationTriggered, setAnimationTriggered] = useState(false)
  const percentagesAndValues = useMemo(() => {
    const totalLocked = lockedX + lockedY

    const standardXRatio = ((lockedX / liquidityX) * 100).toFixed(2)
    const standardYRatio = ((lockedY / liquidityY) * 100).toFixed(2)

    const values = {
      xLocked: ((lockedX / totalLocked) * 100).toFixed(1),
      yLocked: ((lockedY / totalLocked) * 100).toFixed(1),
      xStandard: standardXRatio,
      yStandard: standardYRatio,
      xStandardVal: (lockedX * liquidityX) / liquidityX,
      yStandardVal: (lockedY * liquidityY) / liquidityY
    }

    if (liquidityX === 0) {
      values.xStandardVal = 0
      values.xStandard = '0.00'
    }
    if (liquidityY === 0) {
      values.yStandardVal = 0
      values.yStandard = '0.00'
    }

    if (values.xStandardVal > liquidityX) {
      values.xStandardVal = liquidityX
    }
    if (values.yStandardVal > liquidityY) {
      values.yStandardVal = liquidityY
    }

    if (lockedX > liquidityX) {
      values.xStandard = '100.00'
      values.xStandardVal = liquidityX
    }
    if (lockedY > liquidityY) {
      values.yStandard = '100.00'
      values.yStandardVal = liquidityY
    }
    return values
  }, [lockedX, lockedY, liquidityX, liquidityY])

  const data = useMemo(() => {
    const arr = [
      {
        id: 0,
        value: +percentagesAndValues.xLocked,
        label: symbolX,
        color: colors.invariant.pink
      },
      {
        id: 1,
        value: +percentagesAndValues.yLocked,
        label: symbolY,
        color: colors.invariant.green
      }
    ]
    return arr.sort((a, b) => b.value - a.value)
  }, [percentagesAndValues, symbolX, symbolY])

  useEffect(() => {
    if (!animationTriggered) {
      const ANIM_TIME = 500

      const timer = setTimeout(() => {
        setAnimationTriggered(true)
      }, ANIM_TIME)

      return () => clearTimeout(timer)
    }
  }, [])

  const progressStyles = {
    height: 3,
    width: '0%',
    marginLeft: '10px',
    borderRadius: 4,
    backgroundColor: colors.invariant.light,
    '.MuiLinearProgress-bar': {
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: 4
    }
  }

  const tokenXAmount = useMemo(() => {
    if (percentagesAndValues.xStandardVal < 0.01) {
      return '<$0.01'
    }
    if (percentagesAndValues.xStandardVal < 1) {
      return '<$1'
    }
    return '$' + formatNumberWithSuffix(percentagesAndValues.xStandardVal)
  }, [percentagesAndValues.xStandardVal])

  const tokenYAmount = useMemo(() => {
    if (percentagesAndValues.yStandardVal < 0.01) {
      return '<$0.01'
    }
    if (percentagesAndValues.yStandardVal < 1) {
      return '<$1'
    }
    return '$' + formatNumberWithSuffix(percentagesAndValues.yStandardVal)
  }, [percentagesAndValues.yStandardVal])

  return (
    <div className={classes.backgroundContainer}>
      <div className={classes.statsContainer}>
        <div className={classes.leftWrapper}>
          <div className={classes.leftInnerWrapper}>
            <Typography className={classes.chartTitle}>Lock Liquidity Distribution</Typography>

            <Typography
              className={classes.description}
              style={{
                flex: 1,
                display: 'flex'
              }}>
              Percentage breakdown of total locked liquidity between token pair in the pool.
            </Typography>
            <div style={{ width: 300, height: 130, overflow: 'visible' }}>
              <ResponsivePie
                data={data.filter(d => d.value > 0)}
                colors={[colors.invariant.pink, colors.invariant.green]}
                margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                startAngle={-45}
                endAngle={315}
                borderWidth={1}
                borderColor='white'
                enableArcLabels={false}
                enableArcLinkLabels={true}
                arcLinkLabelsTextColor='#ffffff'
                arcLinkLabelsThickness={1}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLinkLabelsOffset={3}
                arcLinkLabelsDiagonalLength={0}
                arcLinkLabelsStraightLength={0}
                arcLinkLabelsSkipAngle={1}
                arcLinkLabel={d => `${d.label} (${d.value}%)`}
                theme={{
                  labels: {
                    text: {
                      fontFamily: 'Mukta',
                      ...typography.body2
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        <Box className={classes.separator} />

        <div className={classes.rightWrapper}>
          <Typography
            className={classes.chartTitle}
            style={{ width: 'fit-content', alignSelf: 'center' }}>
            Positions Liquidity Share
          </Typography>
          <Typography className={classes.description}>
            Represents the ratio of locked liquidity to the total TVL in the pool.
          </Typography>
          <div className={classes.chartsWrapper}>
            <div className={classes.chartWrapper}>
              <Typography style={{ textWrap: 'nowrap', width: '300px' }}>
                {symbolX}: <span style={{ color: colors.invariant.pink }}>{tokenXAmount}</span> of
                <span style={{ color: colors.invariant.pink }}>
                  {' '}
                  ${formatNumberWithSuffix(liquidityX)}
                </span>{' '}
                <span style={{ color: colors.invariant.textGrey }}>
                  (
                  {percentagesAndValues.xStandard >= '0.01' ||
                  percentagesAndValues.xLocked === '0.0'
                    ? +percentagesAndValues.xStandard
                    : '<0.01'}
                  %)
                </span>
              </Typography>
              {!isSm && (
                <Box className={classes.barWrapper}>
                  <LinearProgress
                    variant='determinate'
                    value={animationTriggered ? +percentagesAndValues.xStandard : 0}
                    sx={{
                      ...progressStyles,
                      width: '100%',
                      ml: 0,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: colors.invariant.pink
                      }
                    }}
                  />
                  <Box
                    className={classes.progress}
                    sx={{
                      width: animationTriggered ? `${percentagesAndValues.xStandard}%` : '0%',
                      boxShadow: `0 0 6px 1px ${colors.invariant.pink}`
                    }}
                  />
                </Box>
              )}
            </div>

            <div className={classes.chartWrapper}>
              <Typography style={{ textWrap: 'nowrap', width: '300px' }}>
                {symbolY}: <span style={{ color: colors.invariant.green }}>{tokenYAmount}</span> of{' '}
                <span style={{ color: colors.invariant.green }}>
                  ${formatNumberWithSuffix(liquidityY)}
                </span>{' '}
                <span style={{ color: colors.invariant.textGrey }}>
                  (
                  {percentagesAndValues.yStandard >= '0.01' || percentagesAndValues.yLocked == '0.0'
                    ? +percentagesAndValues.yStandard
                    : '<0.01'}
                  %)
                </span>
              </Typography>

              {!isSm && (
                <Box className={classes.barWrapper}>
                  <LinearProgress
                    variant='determinate'
                    value={animationTriggered ? +percentagesAndValues.yStandard : 0}
                    sx={{
                      ...progressStyles,
                      width: '100%',
                      ml: 0,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: colors.invariant.green
                      }
                    }}
                  />
                  <Box
                    className={classes.progress}
                    sx={{
                      width: animationTriggered ? `${percentagesAndValues.yStandard}%` : '0%',

                      boxShadow: `0 0 6px 1px ${colors.invariant.green}`
                    }}
                  />
                </Box>
              )}
            </div>
          </div>
          <Typography className={classes.description}>
            A higher locked liquidity share helps stabilize prices, reduces volatility, and
            minimizes slippage for swaps.
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default LockStatsPopover
