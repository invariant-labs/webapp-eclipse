import React from 'react'
import { Box, Typography } from '@mui/material'
import useStyles from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { SwapToken } from '@store/selectors/solanaWallet'
import { infoIcon } from '@static/icons'

export interface IApyTooltip {
  tokenFrom: SwapToken
  tokenTo: SwapToken
  apyStaked: number
  apyCompound: number
}

export const ApyTooltip: React.FC<IApyTooltip> = ({
  tokenFrom,
  tokenTo,
  apyStaked,
  apyCompound
}) => {
  const { classes } = useStyles()

  return (
    <TooltipHover
      title={
        <Box
          display='flex'
          alignItems='center'
          justifyContent='centers'
          gap={'4px'}
          flexDirection='column'>
          <Box className={classes.itemWrapper}>
            <img src={tokenFrom.logoURI} width={16} height={16} />
            <Typography className={classes.tooltipText}>{apyStaked} APY (Stake) </Typography>
          </Box>
          <Typography className={classes.plus}>+</Typography>
          <Box className={classes.itemWrapper}>
            <img src={tokenTo.logoURI} width={16} height={16} />
            <Typography className={classes.greenTooltipText}>
              {apyCompound}% (10s Compound){' '}
            </Typography>
          </Box>
          <Typography className={classes.plus}>+</Typography>
          <Box className={classes.itemWrapper}>
            <img src={tokenTo.logoURI} width={16} height={16} />
            <Typography className={classes.greenTooltipText}>Pool APY/DeFi </Typography>
          </Box>
        </Box>
      }
      increasePadding>
      <Typography className={classes.apyLabel}>
        <span className={classes.crossedText}> {apyStaked}% APY </span>
        <span className={classes.greenLabel}>{apyStaked + apyCompound}% APY</span>
        <img src={infoIcon} height={12} />
      </Typography>
    </TooltipHover>
  )
}

export default ApyTooltip
