import React, { useMemo } from 'react'
import { Box, Chip, Skeleton, Stack, Typography } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import useStyles from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { infoIcon } from '@static/icons'
import bitzIcon from '@static/png/bitz.png'
import sBitzIcon from '@static/png/sBitz.png'

export interface IApyTooltip {
  sBitzBitzMonthlyAnnual: {
    sbitzMonthly: number
    sbitzAnnual: number
    bitzMonthly: number
    bitzAnnual: number
  }
  stakeDataLoading: boolean
}

export const ApyTooltip: React.FC<IApyTooltip> = ({ sBitzBitzMonthlyAnnual, stakeDataLoading }) => {
  const { sbitzMonthly, sbitzAnnual, bitzMonthly, bitzAnnual } = sBitzBitzMonthlyAnnual

  const { classes } = useStyles()
  const additionalApy = useMemo(
    () => (sbitzAnnual - bitzAnnual).toFixed(2),
    [bitzAnnual, sbitzAnnual]
  )

  const chipLabel = (sbitz: number, bitz: number, suffix: string) => (
    <span>
      <span className={classes.crossedValue}>
        {bitz.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>{' '}
      {sbitz.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %{' '}
      {suffix}{' '}
    </span>
  )

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
              {bitzAnnual.toFixed(2) ?? 0}% APR (Stake){' '}
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
        <Stack direction='row' spacing={0.5}>
          <Chip
            icon={<TrendingUpIcon fontSize='inherit' />}
            label={chipLabel(sbitzMonthly, bitzMonthly, '/mo')}
            variant='outlined'
            size='small'
            className={classes.greenChip}
          />
          <Chip
            icon={<TrendingUpIcon fontSize='inherit' />}
            label={chipLabel(sbitzAnnual, bitzAnnual, '/yr')}
            variant='outlined'
            size='small'
            className={classes.greenChip}
          />
        </Stack>
        <img src={infoIcon} height={12} width={12} />
      </Typography>
    </TooltipHover>
  )
}

export default ApyTooltip
