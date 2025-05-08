import { Box, Grid, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import useStyles from './style'
import { useCountdown } from '../Timer/useCountdown'
import { colors, typography } from '@static/theme'
import classNames from 'classnames'
import { BN } from '@coral-xyz/anchor'

interface RoundComponentProps {
  isActive: boolean
  roundNumber: number
  amountBought: string
  amountLeft: string
  percentageFilled: number
  tokensLeft: string
  currentPrice: string
  nextPrice: string
  purchasedTokens: string
  remainingAllocation: string
  currency: string | null
  endtimestamp: BN
}

export const RoundComponent: React.FC<RoundComponentProps> = ({
  isActive,
  roundNumber,
  amountBought,
  amountLeft,
  percentageFilled,
  currentPrice,
  tokensLeft,
  nextPrice,
  purchasedTokens,
  remainingAllocation,
  currency,
  endtimestamp
}) => {
  const { classes } = useStyles({ percentage: percentageFilled, isActive })
  const targetDate = useMemo(() => new Date(endtimestamp.toNumber() * 1000), [endtimestamp])

  const { hours, minutes, seconds } = useCountdown({
    targetDate
  })

  return (
    <Box className={classes.container}>
      <Typography className={classes.roundTitle}>ROUND {roundNumber}</Typography>
      {!isActive && (
        <Box className={classNames(classes.infoRow)} marginTop={'24px'}>
          <Typography className={classes.infoLabelBigger}>Current price: </Typography>
          <Typography className={classes.currentPriceBigger}>
            ${Number(currentPrice).toFixed(3)}
          </Typography>
        </Box>
      )}
      <Box className={classes.progressCard}>
        <Box className={classes.progressHeader}>
          {isActive ? (
            <>
              <Box className={classes.darkBackground}>
                <Box className={classes.gradientProgress} />
              </Box>
              <Grid container className={classes.barWrapper}>
                <Typography className={classes.amountBought}>
                  {amountBought.toLocaleString()} ${currency} deposited
                </Typography>
                <Typography className={classes.amountLeft}>
                  {amountLeft.toLocaleString()} ${currency} left
                </Typography>
              </Grid>
            </>
          ) : (
            <>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>Tokens left: </Typography>
                <Typography className={classes.currentPrice}>{tokensLeft}</Typography>
              </Box>
            </>
          )}
        </Box>
        <Box className={classes.priceIncreaseBox}>
          <Typography className={classes.priceIncreaseText}> PRESALE ENDS IN:</Typography>
          {isActive && (
            <Typography className={classes.priceIncreaseText} sx={{ width: '130px' }}>
              <Typography sx={{ ...typography.heading4, color: colors.invariant.text }}>
                {hours}H
              </Typography>
              :
              <Typography sx={{ ...typography.heading4, color: colors.invariant.text }}>
                {minutes}M
              </Typography>
              :
              <Typography sx={{ ...typography.heading4, color: colors.invariant.text }}>
                {seconds}S
              </Typography>
            </Typography>
          )}
          {/* <Timer hours={hours} minutes={minutes} seconds={seconds} /> */}
        </Box>
      </Box>

      <Box className={classes.infoCard}>
        {isActive && (
          <>
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>Current price: </Typography>
              <Typography className={classes.currentPrice}>
                ${Number(currentPrice).toFixed(3)}
              </Typography>
            </Box>
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>Next price: </Typography>
              <Typography className={classes.nextPrice}>${Number(nextPrice).toFixed(3)}</Typography>
            </Box>
            <Box className={classes.divider} />
          </>
        )}

        <Box className={classes.infoRow}>
          <Typography className={classes.secondaryLabel}>Your deposited {currency}: </Typography>
          <Typography className={classes.value}>{purchasedTokens.toLocaleString()}</Typography>
        </Box>
        <Box className={classes.infoRow}>
          <Typography className={classes.secondaryLabel}>
            Your remaining {currency} to deposit:{' '}
          </Typography>
          <Typography className={classes.value}>{remainingAllocation.toLocaleString()}</Typography>
        </Box>
      </Box>
    </Box>
  )
}

export interface StyleProps {
  percentage: number
}
