import React, { useMemo } from 'react'
import { Box, Skeleton, Stack, Typography, useMediaQuery } from '@mui/material'
import useStyles from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { infoIcon } from '@static/icons'
import bitzIcon from '@static/png/bitz.png'
import sBitzIcon from '@static/png/sBitz.png'
import { colors, theme } from '@static/theme'
import { Separator } from '@common/Separator/Separator'

export interface IApyTooltip {
  stakeDataLoading: boolean
  sBitzBitzMonthlyAnnual: {
    sbitzMonthly: number
    sbitzAnnual: number
    bitzMonthly: number
    bitzAnnual: number
  }
}

const ApyTooltip: React.FC<IApyTooltip> = ({ stakeDataLoading, sBitzBitzMonthlyAnnual }) => {
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const { classes } = useStyles()
  const { sbitzMonthly, sbitzAnnual, bitzMonthly, bitzAnnual } = sBitzBitzMonthlyAnnual

  const additionalApy = useMemo(
    () => (sbitzAnnual - bitzAnnual).toFixed(2),
    [sbitzAnnual, bitzAnnual]
  )

  if (stakeDataLoading) {
    return <Skeleton width={180} height={24} />
  }

  return (
    <TooltipHover
      title={
        <Box className={classes.tooltipWrapper}>
          <Box className={classes.itemWrapper}>
            <img src={bitzIcon} width={16} height={16} />
            <Typography className={classes.tooltipText}>
              {bitzAnnual.toFixed(2)}% APR (Stake)
            </Typography>
          </Box>
          <Typography className={classes.plus}>+</Typography>
          <Box className={classes.itemWrapper}>
            <img src={sBitzIcon} width={16} height={16} />
            <Typography className={classes.greenTooltipText}>
              {additionalApy}% (10s Compound)
            </Typography>
          </Box>
          <Typography className={classes.plus}>+</Typography>
          <Box className={classes.itemWrapper}>
            <img src={sBitzIcon} width={16} height={16} />
            <Typography className={classes.greenTooltipText}>Pool APY/DeFi</Typography>
          </Box>
        </Box>
      }
      increasePadding>
      <Stack direction='row' spacing={1} className={classes.row}>
        {!isSm && (
          <>
            <Box className={classes.valueWrapper}>
              <Typography className={classes.greenValue} textAlign='center'>
                {' '}
                monthly
              </Typography>
              <Box className={classes.value}>
                <img src={bitzIcon} width={12} height={12} />
                <Typography className={classes.crossedValue}>
                  {bitzMonthly.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Typography>
                <img src={sBitzIcon} width={12} height={12} />
                <Typography className={classes.greenValue}>
                  {sbitzMonthly.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                  %
                </Typography>
              </Box>
            </Box>
            <Separator size={'50%'} width={1} isHorizontal={false} color={colors.invariant.light} />
          </>
        )}

        <Box className={classes.valueWrapper}>
          <Typography className={classes.greenValue} textAlign='center'>
            {' '}
            yearly
          </Typography>

          <Box className={classes.value}>
            <img src={bitzIcon} width={12} height={12} />
            <Typography className={classes.crossedValue}>
              {bitzAnnual.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Typography>
            <img src={sBitzIcon} width={12} height={12} />
            <Typography className={classes.greenValue}>
              {sbitzAnnual.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              %
            </Typography>
          </Box>
        </Box>

        <img src={infoIcon} width={12} height={12} style={{ marginRight: '4px' }} />
      </Stack>
    </TooltipHover>
  )
}

export default ApyTooltip
