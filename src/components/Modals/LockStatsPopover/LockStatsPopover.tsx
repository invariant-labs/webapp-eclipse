import useStyles from './style'
import { Popover, Typography, LinearProgress, Box } from '@mui/material'
import { PieChart } from '@mui/x-charts'
import { colors } from '@static/theme'
import { formatNumber } from '@utils/utils'
import { useState, useEffect, useMemo } from 'react'

export interface ILockStatsPopover {
  open: boolean
  lockedX: number
  lockedY: number
  liquidityX: number
  liquidityY: number
  symbolX: string
  symbolY: string
  anchorEl: HTMLElement | null
  onClose: () => void
}

export const LockStatsPopover = ({
  open,
  onClose,
  anchorEl,
  lockedX,
  lockedY,
  liquidityX,
  liquidityY,
  symbolX,
  symbolY
}: ILockStatsPopover) => {
  const { classes } = useStyles()
  const [animationTriggered, setAnimationTriggered] = useState(false)

  const percentages = useMemo(() => {
    const totalLocked = lockedX + lockedY
    const totalLiq = liquidityX + liquidityY - totalLocked

    const values = {
      xLocked: ((lockedX / totalLocked) * 100).toFixed(1),
      yLocked: ((lockedY / totalLocked) * 100).toFixed(1),
      xStandard: (((liquidityX - lockedX) / totalLiq) * 100).toFixed(2),
      yStandard: (((liquidityY - lockedY) / totalLiq) * 100).toFixed(2)
    }

    return values
  }, [lockedX, lockedY, liquidityX, liquidityY])

  const data = useMemo(() => {
    const arr = [
      {
        id: 0,
        value: +percentages.xLocked,
        label: symbolX,
        color: colors.invariant.pink
      },
      {
        id: 1,
        value: +percentages.yLocked,
        label: symbolY,
        color: colors.invariant.green
      }
    ]
    return arr.sort((a, b) => b.value - a.value)
  }, [percentages, symbolX, symbolY])

  useEffect(() => {
    if (open && !animationTriggered) {
      const ANIM_TIME = 500

      const timer = setTimeout(() => {
        setAnimationTriggered(true)
      }, ANIM_TIME)

      return () => clearTimeout(timer)
    }
  }, [open])

  if (!anchorEl) return null

  const progressStyles = {
    height: 3,
    width: '0%',
    marginLeft: '10px',
    borderRadius: 4,
    backgroundColor: colors.invariant.light,
    '.MuiLinearProgress-bar': {
      transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: 4
    }
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      classes={{
        paper: classes.paper,
        root: classes.popover
      }}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      disableRestoreFocus
      slotProps={{
        paper: {
          onMouseLeave: onClose
        }
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      marginThreshold={16}>
      <div className={classes.backgroundContainer}>
        <div className={classes.statsContainer} style={{ gap: '16px' }}>
          <div style={{ display: 'flex', width: '38%', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
              <Typography className={classes.chartTitle} style={{ textAlign: 'center' }}>
                Lock Liquidity Distribution
              </Typography>

              <Typography
                className={classes.description}
                style={{
                  flex: 1,
                  display: 'flex'
                }}>
                Percentage breakdown of total locked liquidity between token pair in the pool.
              </Typography>
              <PieChart
                series={[
                  {
                    data: data,
                    outerRadius: 40,
                    startAngle: -45,
                    endAngle: 315,
                    cx: 122.5,
                    cy: 77.5,
                    arcLabel: item => {
                      return `${item.label} (${item.value}%)`
                    },
                    arcLabelRadius: 85
                  }
                ]}
                colors={[colors.invariant.pink, colors.invariant.green]}
                slotProps={{
                  legend: { hidden: true },
                  pieArc: {
                    fill: 'currentColor'
                  }
                }}
                width={255}
                height={155}
              />
            </div>
          </div>

          <Box
            sx={{
              width: '2px',
              backgroundColor: colors.invariant.light,
              alignSelf: 'stretch'
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '50%'
            }}>
            <Typography
              className={classes.chartTitle}
              style={{ textAlign: 'center', width: 'fit-content', alignSelf: 'center' }}>
              Standard Positions Share
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography style={{ textWrap: 'nowrap', width: '120px' }}>
                  {symbolX}:{' '}
                  <span style={{ color: colors.invariant.pink }}>
                    ${formatNumber(liquidityX - lockedX)}
                  </span>{' '}
                  <span style={{ color: colors.invariant.textGrey }}>
                    ({percentages.xStandard}%)
                  </span>
                </Typography>
                <Box
                  sx={{
                    width: '40%',
                    ml: '60px',
                    position: 'relative'
                  }}>
                  <LinearProgress
                    variant='determinate'
                    value={animationTriggered ? +percentages.xStandard : 0}
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
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: animationTriggered ? `${percentages.xStandard}%` : '0%',
                      height: '3px',
                      borderRadius: 4,
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: `0 0 6px 1px ${colors.invariant.pink}`
                    }}
                  />
                </Box>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography style={{ textWrap: 'nowrap', width: '120px' }}>
                  {symbolY}:{' '}
                  <span style={{ color: colors.invariant.green }}>
                    ${formatNumber(liquidityY - lockedY)}
                  </span>{' '}
                  <span style={{ color: colors.invariant.textGrey }}>
                    ({percentages.yStandard}%)
                  </span>
                </Typography>

                <Box
                  sx={{
                    width: '40%',
                    ml: '60px',
                    position: 'relative'
                  }}>
                  <LinearProgress
                    variant='determinate'
                    value={animationTriggered ? +percentages.yStandard : 0}
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
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: animationTriggered ? `${percentages.yStandard}%` : '0%',
                      height: '3px',
                      borderRadius: 4,
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: `0 0 6px 1px ${colors.invariant.green}`
                    }}
                  />
                </Box>
              </div>
            </div>
            <Typography className={classes.description}>
              Amount and percentage of tokens secured in standard positions. More locked token value
              (TVL) provides stronger pool stability and better resistance to price impact.
            </Typography>
          </div>
        </div>
      </div>
    </Popover>
  )
}

export default LockStatsPopover
