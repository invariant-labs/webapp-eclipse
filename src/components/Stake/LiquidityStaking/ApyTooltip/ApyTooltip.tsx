import React, { useMemo } from 'react'
import { Box, Skeleton, Typography, useMediaQuery } from '@mui/material'
import useStyles from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { infoIcon, arrowRightIcon } from '@static/icons'
import { theme } from '@static/theme'
import bitzIcon from '@static/png/bitz.png'
import sBitzIcon from '@static/png/sBitz.png'

export interface IApyTooltip {
  sBitzApyApr: { apy: number | null; apr: number | null }
  stakeDataLoading: boolean
}

export const ApyTooltip: React.FC<IApyTooltip> = ({ sBitzApyApr, stakeDataLoading }) => {
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  const { classes } = useStyles()
  const additionalApy = useMemo(() => {
    const { apr, apy } = sBitzApyApr
    if (!apr || !apy) return 0
    return (apy - apr).toFixed(2)
  }, [sBitzApyApr])

  if (stakeDataLoading) {
    return <Skeleton width={200} height={24} />
  }
  return (
    <TooltipHover
      title={
        <Box className={classes.tooltipWrapper}>
          <Box className={classes.itemWrapper}>
            <img src={bitzIcon} width={16} height={16} />
            <Typography className={classes.tooltipText}>
              {sBitzApyApr.apr?.toFixed(2) ?? 0}% APR (Stake){' '}
            </Typography>
          </Box>
          <Typography className={classes.plus}>+</Typography>
          <Box className={classes.itemWrapper}>
            <img src={sBitzIcon} width={16} height={16} />
            <Typography className={classes.greenTooltipText}>
              {additionalApy}% (10s Compound){' '}
            </Typography>
          </Box>
          <Typography className={classes.plus}>+</Typography>
          <Box className={classes.itemWrapper}>
            <img src={sBitzIcon} width={16} height={16} />
            <Typography className={classes.greenTooltipText}>Pool APY/DeFi </Typography>
          </Box>
        </Box>
      }
      increasePadding>
      <Typography className={classes.apyLabel}>
        <img src={bitzIcon} width={16} height={16} />
        <span className={classes.crossedText}> {sBitzApyApr.apr?.toFixed(2) ?? 0}% APR </span>
        {!isSm && <img src={arrowRightIcon} height={10} />}
        <img src={sBitzIcon} width={16} height={16} />
        <span className={classes.greenLabel}>{sBitzApyApr.apy?.toFixed(2) ?? 0}% APY</span>
        <img src={infoIcon} height={12} width={12} />
      </Typography>
    </TooltipHover>
  )
}

export default ApyTooltip
