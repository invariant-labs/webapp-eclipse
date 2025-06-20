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
import { ProcessedToken } from '@store/hooks/userOverview/useProcessedToken'
interface YourProgressProps {
  processedTokens: ProcessedToken[]
  isProcesing?: boolean
  isConnected: boolean
}

export const YourStakeProgress: React.FC<YourProgressProps> = ({
  processedTokens,
  isProcesing,
  isConnected
}) => {
  const { classes } = useStyles({})
  return (
    <Grid className={classes.mainWrapper}>
      <Grid className={classes.boxWrapper}>
        {<BlurOverlay isConnected={isConnected} />}

        <Grid className={classes.section}>
          <Grid className={classes.pointsContainer}>
            <Grid className={classes.pointsColumn}>
              <ProgressItem
                isConnected={isConnected}
                bgImage={top}
                label={<Box sx={{ display: 'flex', gap: 1 }}><img src={sBITZ} width={20} height={20} /><Typography>sBITZ</Typography></Box>}
                tooltip={
                  <>
                    sBITZ
                  </>
                }
                isLoading={isProcesing}
                value={processedTokens.find(token => token.symbol === 'sBITZ')?.amount.toFixed(4) || 0}
              />
              <ProgressItem
                bgImage={mid}
                isConnected={isConnected}
                isLoading={isProcesing}
                tooltip={
                  <>
                    Yield
                  </>
                }
                label={<Box sx={{ display: 'flex', gap: 1 }}><img src={sBITZ} width={20} height={20} /><Typography>sBITZ 24H Yield</Typography></Box>}
                value={
                  0
                }
              />
            </Grid>

            <Grid className={classes.divider} />

            <Grid className={classes.pointsColumn}>
              <ProgressItem
                isConnected={isConnected}
                bgImage={mid}
                tooltip={
                  <>
                    BITZ
                  </>
                }
                label={<Box sx={{ display: 'flex', gap: 1 }}><Typography>Backed by</Typography> <img src={BITZ} width={20} height={20} /> <Typography>BITZ</Typography></Box>}
                isLoading={isProcesing}
                value={processedTokens.find(token => token.symbol === 'BITZ')?.amount.toFixed(4) || 0}
              />
              <ProgressItem
                isConnected={isConnected}
                bgImage={bot}
                tooltip={
                  <>
                    Value
                  </>
                }
                isLoading={isProcesing}
                label='Value'
                value={`$${processedTokens.find(token => token.symbol === 'BITZ')?.value.toFixed(4) || 0}`}

              />
            </Grid>
          </Grid>
        </Grid>

      </Grid>
    </Grid >
  )
}
