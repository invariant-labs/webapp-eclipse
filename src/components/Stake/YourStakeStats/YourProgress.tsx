import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import { ProgressItem } from './ProgressItem'
import BITZ from '@static/png/bitz.png'
import sBITZ from '@static/png/sBitz.png'
import { BN } from '@coral-xyz/anchor'
import { BITZ_MAIN, sBITZ_MAIN } from '@store/consts/static'
import { formatNumberWithSuffix, printBN } from '@utils/utils'
import { Separator } from '@common/Separator/Separator'
import { colors, theme } from '@static/theme'
import top from '@static/png/trapezeMobileTop.png'
import bot from '@static/png/trapezeMobileBottom.png'
import mid from '@static/png/boxMobileMiddle.png'

interface YourProgressProps {
  sBitzBalance: BN
  bitzToWithdraw: BN
  bitzPrice: number
  yield24: number
  isLoading?: boolean
  isConnected: boolean
}

export const YourStakeProgress: React.FC<YourProgressProps> = ({
  sBitzBalance,
  bitzToWithdraw,
  bitzPrice,
  isLoading,
  yield24
}) => {
  const { classes } = useStyles({})
  const isMobile = useMediaQuery(theme.breakpoints.down(500))
  return (
    <Grid className={classes.mainWrapper}>
      <Typography className={classes.portfolioHeader}>Portfolio</Typography>
      <Grid className={classes.boxWrapper}>
        <Grid className={classes.section}>
          <Grid className={classes.pointsColumn}>
            <ProgressItem
              bgImage={top}
              label={
                <Box className={classes.boxLabel}>
                  <img src={sBITZ} width={20} height={20} />
                  <Typography>sBITZ Amount</Typography>
                </Box>
              }
              isLoading={isLoading}
              value={formatNumberWithSuffix(
                (+printBN(sBitzBalance, sBITZ_MAIN.decimals)).toFixed(4),
                { decimalsAfterDot: 4 }
              )}
            />
            {!isMobile && (
              <Separator color={colors.invariant.light} isHorizontal margin='0px 8px 0px 8px' />
            )}

            <ProgressItem
              bgImage={mid}
              tooltip={<>The underlying BITZ tokens backing your sBITZ holdings.</>}
              label={
                <Box className={classes.boxLabel}>
                  <img src={BITZ} width={20} height={20} />
                  <Typography>Redeemable BITZ</Typography>{' '}
                </Box>
              }
              isLoading={isLoading}
              value={`${formatNumberWithSuffix(
                (+printBN(bitzToWithdraw, BITZ_MAIN.decimals)).toFixed(4),
                { decimalsAfterDot: 4 }
              )}`}
            />
            {!isMobile && (
              <Separator color={colors.invariant.light} isHorizontal margin='0px 8px 0px 8px' />
            )}

            <ProgressItem
              isLoading={isLoading}
              bgImage={mid}
              tooltip={
                <>
                  Estimated BITZ rewards earned from holding sBITZ over the next 24 hours. Staking
                  rewards don't increase your sBITZ amount. Instead, the same amount of sBITZ
                  gradually becomes redeemable for more BITZ over time.
                </>
              }
              label={
                <Box className={classes.boxLabel}>
                  <img src={BITZ} width={20} height={20} />
                  <Typography>24H BITZ Rewards</Typography>
                </Box>
              }
              value={
                yield24 > 0 && yield24 < 0.0001
                  ? '<0.0001'
                  : formatNumberWithSuffix(yield24.toFixed(4), { decimalsAfterDot: 4 })
              }
            />

            {!isMobile && (
              <Separator color={colors.invariant.light} isHorizontal margin='0px 8px 0px 8px' />
            )}

            <ProgressItem
              isLoading={isLoading}
              bgImage={bot}
              label='USD Value'
              value={`$${formatNumberWithSuffix(
                (+printBN(bitzToWithdraw, BITZ_MAIN.decimals) * bitzPrice).toFixed(2),
                { decimalsAfterDot: 2 }
              )}`}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
