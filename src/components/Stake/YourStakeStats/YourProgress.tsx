import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import { ProgressItem } from './ProgressItem'
import { BlurOverlay } from './BlurOverlay'
import top from '@static/png/trapezeMobileTop.png'
import bot from '@static/png/trapezeMobileBottom.png'
import mid from '@static/png/boxMobileMiddle.png'
import BITZ from '@static/png/bitz.png'
import sBITZ from '@static/png/sBitz.png'
import { BN } from '@coral-xyz/anchor'
import { BITZ_MAIN, sBITZ_MAIN } from '@store/consts/static'
import { formatNumberWithSuffix, printBN } from '@utils/utils'
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
  yield24,
  isConnected
}) => {
  const { classes } = useStyles({})
  return (
    <Grid className={classes.mainWrapper}>
      <Typography className={classes.statsTitle}>Your stats</Typography>

      <Grid className={classes.boxWrapper}>
        {<BlurOverlay isConnected={isConnected} />}
        <Grid className={classes.section}>
          <Grid className={classes.pointsContainer}>
            <Grid className={classes.pointsColumn}>
              <ProgressItem
                isConnected={isConnected}
                bgImage={top}
                label={
                  <Box className={classes.boxLabel}>
                    <img src={sBITZ} width={20} height={20} />
                    <Typography>sBITZ</Typography>
                  </Box>
                }
                isLoading={isLoading}
                value={formatNumberWithSuffix(printBN(sBitzBalance, sBITZ_MAIN.decimals), {
                  decimalsAfterDot: 4
                })}
              />
              <ProgressItem
                bgImage={mid}
                isConnected={isConnected}
                isLoading={isLoading}
                tooltip={<>Estimated BITZ rewards from holding sBITZ over the next 24 hours.</>}
                label={
                  <Box className={classes.boxLabel}>
                    <Typography>24H </Typography>
                    <img src={BITZ} width={20} height={20} />
                    <Typography> BITZ Rewards</Typography>
                  </Box>
                }
                value={formatNumberWithSuffix(yield24, {
                  decimalsAfterDot: 4
                })}
              />
            </Grid>

            <Grid className={classes.divider} />

            <Grid className={classes.pointsColumn}>
              <ProgressItem
                isConnected={isConnected}
                bgImage={mid}
                tooltip={<>The underlying BITZ tokens backing your sBITZ holdings.</>}
                label={
                  <Box className={classes.boxLabel}>
                    <Typography>Backed by</Typography> <img src={BITZ} width={20} height={20} />{' '}
                    <Typography>BITZ</Typography>
                  </Box>
                }
                isLoading={isLoading}
                value={formatNumberWithSuffix(printBN(bitzToWithdraw, BITZ_MAIN.decimals), {
                  decimalsAfterDot: 4
                })}
              />
              <ProgressItem
                isConnected={isConnected}
                bgImage={bot}
                isLoading={isLoading}
                label='Value'
                value={`$${formatNumberWithSuffix(
                  +printBN(bitzToWithdraw, BITZ_MAIN.decimals) * bitzPrice,
                  { decimalsAfterDot: 2 }
                )}`}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
