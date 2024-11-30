import useStyles from './style'
import { Popover, Typography, LinearProgress, Box } from '@mui/material'
import { PieChart } from '@mui/x-charts'
import { colors } from '@static/theme'
import { useState, useEffect } from 'react'

export interface ILockStatsPopover {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
}

export const LockStatsPopover = ({ open, onClose, anchorEl }: ILockStatsPopover) => {
  const { classes } = useStyles()
  const [animationTriggered, setAnimationTriggered] = useState(false)

  useEffect(() => {
    if (open) {
      const ANIM_TIME = 100
      setAnimationTriggered(false)

      const timer = setTimeout(() => {
        setAnimationTriggered(true)
      }, ANIM_TIME)

      return () => clearTimeout(timer)
    }
  }, [open])

  if (!anchorEl) return null

  const progressStyles = {
    height: 3,
    width: '50%',
    marginLeft: '10px',
    borderRadius: 4,
    backgroundColor: colors.invariant.light,
    '.MuiLinearProgress-bar': {
      transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: 4
    }
  }
  const pieChartData = [
    { id: 0, value: 554, label: 'USDT', color: colors.invariant.pink },
    { id: 1, value: 85, label: 'ETH', color: colors.invariant.green }
  ]
  const total = pieChartData.reduce((sum, item) => sum + item.value, 0)

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
          <div style={{ display: 'flex', width: '48%', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
              <Typography className={classes.chartTitle} style={{ textAlign: 'center' }}>
                Lock ratio
              </Typography>

              <Typography
                className={classes.description}
                style={{
                  flex: 1,
                  display: 'flex'
                }}>
                Contribution to the total locked amount between the tokens.
              </Typography>
              <PieChart
                series={[
                  {
                    data: [
                      { id: 0, value: 554, label: 'USDT', color: colors.invariant.pink },
                      { id: 1, value: 85, label: 'ETH', color: colors.invariant.green }
                    ],
                    outerRadius: 40,
                    paddingAngle: 2,
                    startAngle: -90,
                    endAngle: 270,
                    cx: 143,
                    cy: 50,
                    arcLabel: item => {
                      const percentage = ((item.value / total) * 100).toFixed(1)
                      return `${item.label} (${percentage}%)`
                    },
                    arcLabelRadius: 80
                  }
                ]}
                colors={[colors.invariant.pink, colors.invariant.green]}
                slotProps={{
                  legend: { hidden: true },
                  pieArc: {
                    fill: 'currentColor'
                  }
                }}
                width={285}
                height={100}
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
              width: '40%'
            }}>
            <Typography
              className={classes.chartTitle}
              style={{ textAlign: 'center', width: 'fit-content', alignSelf: 'center' }}>
              Guaranteed Liquidity Share
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography style={{ textWrap: 'nowrap', width: '120px' }}>
                  USDC: <span style={{ color: colors.invariant.pink }}>$200k</span>{' '}
                  <span style={{ color: colors.invariant.textGrey }}>(45.77%)</span>
                </Typography>
                <Box
                  sx={{
                    width: '40%',
                    ml: '50px',
                    position: 'relative'
                  }}>
                  <LinearProgress
                    variant='determinate'
                    value={animationTriggered ? 75 : 0}
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
                      width: animationTriggered ? '75%' : '0%',
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
                  ETH: <span style={{ color: colors.invariant.green }}>$200k</span>{' '}
                  <span style={{ color: colors.invariant.textGrey }}>(75.77%)</span>
                </Typography>

                <Box
                  sx={{
                    width: '40%',
                    ml: '50px',
                    position: 'relative'
                  }}>
                  <LinearProgress
                    variant='determinate'
                    value={animationTriggered ? 45 : 0}
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
                      width: animationTriggered ? '45%' : '0%',
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
              Shares locked tokens contribute to the total volume available in the protocol. The
              higher the ratio is the more tokens are guaranteed to stay in the protocol ensuring no
              price manipulation by liquidity removal.
            </Typography>
          </div>
        </div>
      </div>
    </Popover>
  )
}

export default LockStatsPopover
