import React, { useMemo } from 'react'
import { Box, Skeleton, Typography } from '@mui/material'
import useStyles from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { SwapToken } from '@store/selectors/solanaWallet'
import { infoIcon } from '@static/icons'

export interface IApyTooltip {
  tokenFrom: SwapToken
  tokenTo: SwapToken
  sBitzApyApr: { apy: number | null; apr: number | null }
  stakeDataLoading: boolean
}

export const ApyTooltip: React.FC<IApyTooltip> = ({
  tokenFrom,
  tokenTo,
  sBitzApyApr,
  stakeDataLoading
}) => {
  const { classes } = useStyles()
  const additionalApy = useMemo(() => {
    const { apr, apy } = sBitzApyApr
    if (!apr || !apy) return 0
    return (apy - apr).toFixed(3)
  }, [sBitzApyApr])

  if (stakeDataLoading) {
    return <Skeleton width={150} height={24} />
  }
  return (
    <TooltipHover
      title={
        <Box className={classes.tooltipWrapper}>
          <Box className={classes.itemWrapper}>
            <img src={tokenFrom?.logoURI} width={16} height={16} />
            <Typography className={classes.tooltipText}>
              {sBitzApyApr.apr?.toFixed(3) ?? 0}% APR (Stake){' '}
            </Typography>
          </Box>
          <Typography className={classes.plus}>+</Typography>
          <Box className={classes.itemWrapper}>
            <img src={tokenTo?.logoURI} width={16} height={16} />
            <Typography className={classes.greenTooltipText}>
              {additionalApy}% (10s Compound){' '}
            </Typography>
          </Box>
          <Typography className={classes.plus}>+</Typography>
          <Box className={classes.itemWrapper}>
            <img src={tokenTo?.logoURI} width={16} height={16} />
            <Typography className={classes.greenTooltipText}>Pool APY/DeFi </Typography>
          </Box>
        </Box>
      }
      increasePadding>
      <Typography className={classes.apyLabel}>
        <span className={classes.crossedText}> {sBitzApyApr.apr?.toFixed(3) ?? 0}% APR </span>
        <span className={classes.greenLabel}>{sBitzApyApr.apy?.toFixed(3) ?? 0}% APY</span>
        <img src={infoIcon} height={12} />
      </Typography>
    </TooltipHover>
  )
}

export default ApyTooltip
