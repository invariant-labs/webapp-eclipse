import { Box, Grid, Skeleton, Typography } from '@mui/material'
import React from 'react'
import useStyles from './style'
import classNames from 'classnames'
import { BN } from '@coral-xyz/anchor'
import { printBNandTrimZeros } from '@utils/utils'
import { EFFECTIVE_TARGET_MULTIPLIER, PERCENTAGE_SCALE } from '@invariant-labs/sale-sdk'
import { Status } from '@store/reducers/solanaWallet'

interface RoundComponentProps {
  isActive: boolean
  saleDidNotStart: boolean
  targetAmount: BN
  amountDeposited: BN
  amountNeeded: BN
  amountLeft: BN
  currentPrice: BN
  nextPrice: BN
  percentageFilled: BN
  userDepositedAmount: BN
  userRemainingAllocation: BN
  mintDecimals: number
  roundNumber: number
  proofOfInclusion: Uint8Array<ArrayBufferLike> | undefined
  isLoadingUserStats: boolean
  isLoadingSaleStats: boolean
  walletStatus: Status
}

export const RoundComponent: React.FC<RoundComponentProps> = ({
  isActive,
  saleDidNotStart,
  targetAmount,
  amountDeposited,
  amountNeeded,
  amountLeft,
  walletStatus,
  currentPrice,
  nextPrice,
  percentageFilled,
  userDepositedAmount,
  userRemainingAllocation,
  mintDecimals,
  proofOfInclusion,
  roundNumber,
  isLoadingSaleStats,
  isLoadingUserStats
}) => {
  const { classes } = useStyles({
    percentage: Number(printBNandTrimZeros(percentageFilled, PERCENTAGE_SCALE, 3)),
    isActive
  })

  if (isLoadingSaleStats) {
    return (
      <Box className={classes.container}>
        <Skeleton variant='text' sx={{ justifySelf: 'center' }} width={150} height={40} />

        <Box className={classes.progressCard}>
          <Box className={classes.progressHeader}>
            {isActive ? (
              <>
                <Box className={classes.darkBackground}>
                  <Box className={classes.gradientProgress} />
                </Box>
                <Grid container className={classes.barWrapper}>
                  <Typography className={classes.amountBought}>
                    <Skeleton variant='text' width={20} />
                  </Typography>
                  <Typography className={classes.amountLeft}>
                    <Skeleton variant='text' width={20} />
                  </Typography>
                </Grid>
              </>
            ) : (
              <>
                <Box className={classes.infoRow}>
                  <Skeleton variant='text' width={200} />
                </Box>
                <Box className={classes.infoRow}>
                  <Skeleton variant='text' width={200} />
                </Box>
                <Box className={classes.infoRow}>
                  <Skeleton variant='text' width={200} />
                </Box>
              </>
            )}
          </Box>
        </Box>

        <Box className={classes.infoCard}>
          {isActive && (
            <>
              <Box className={classes.infoRow}>
                <Skeleton variant='text' width={180} />
              </Box>
              <Box className={classes.infoRow}>
                <Skeleton variant='text' width={180} />
              </Box>
              <Box className={classes.divider} />
            </>
          )}

          {!saleDidNotStart && (
            <Box className={classes.infoRow}>
              <Skeleton variant='text' width={200} />
            </Box>
          )}

          {isActive && (
            <Box className={classes.infoRow}>
              <Skeleton variant='text' width={200} />
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box className={classes.container}>
      <Typography className={classes.roundTitle}>ROUND {roundNumber}</Typography>

      {!isActive && (
        <Box className={classNames(classes.infoRow)} marginTop={'24px'}>
          <Typography className={classes.infoLabelBigger}>Current price: </Typography>
          <Typography className={classes.currentPriceBigger}>
            ${printBNandTrimZeros(currentPrice, mintDecimals, 4)}
          </Typography>
        </Box>
      )}
      <Box className={classes.progressCard}>
        <Box className={classes.progressHeader}>
          {isActive ? (
            <>
              <Box className={classes.darkBackground}>
                <Box
                  className={classNames(
                    classes.gradientProgress,
                    walletStatus === Status.Initialized
                      ? classes.activeProgress
                      : classes.inactiveProgress
                  )}
                />
              </Box>
              <Grid container className={classes.barWrapper}>
                <Typography className={classes.amountBought}>
                  ${printBNandTrimZeros(amountDeposited, mintDecimals, 3)}
                </Typography>
                <Typography className={classes.amountLeft}>
                  ${printBNandTrimZeros(amountNeeded, mintDecimals, 3)}
                </Typography>
              </Grid>
            </>
          ) : (
            <>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>
                  Deposited: ${printBNandTrimZeros(amountDeposited, mintDecimals, 3)}
                </Typography>
              </Box>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>
                  Target deposit: ${printBNandTrimZeros(targetAmount, mintDecimals, 3)}
                </Typography>
              </Box>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>
                  Maximal deposit: $
                  {printBNandTrimZeros(
                    targetAmount.mul(EFFECTIVE_TARGET_MULTIPLIER),
                    mintDecimals,
                    3
                  )}
                </Typography>
              </Box>
            </>
          )}
        </Box>
        {isActive && (
          <Box className={classes.priceIncreaseBox}>
            <Typography className={classes.priceIncreaseText}>
              AMOUNT TILL PRICE INCREASE: ${printBNandTrimZeros(amountLeft, mintDecimals, 3)}
            </Typography>
          </Box>
        )}
      </Box>

      <Box className={classes.infoCard}>
        {isActive && (
          <>
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>Current price: </Typography>
              <Typography className={classes.currentPrice}>
                ${printBNandTrimZeros(currentPrice, mintDecimals, 3)}
              </Typography>
            </Box>
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>Next price: </Typography>
              <Typography className={classes.nextPrice}>
                ${printBNandTrimZeros(nextPrice, mintDecimals, 3)}
              </Typography>
            </Box>
            <Box className={classes.divider} />
          </>
        )}

        {!isLoadingUserStats && !saleDidNotStart && walletStatus === Status.Initialized && (
          <Box className={classes.infoRow}>
            <Typography className={classes.secondaryLabel}>Your deposit: </Typography>
            <Typography className={classes.value}>
              ${printBNandTrimZeros(userDepositedAmount, mintDecimals, 3)}
            </Typography>
          </Box>
        )}
        {!isLoadingUserStats &&
          isActive &&
          !(roundNumber === 4 || (roundNumber < 4 && !proofOfInclusion)) && (
            <Box className={classes.infoRow}>
              <Typography className={classes.secondaryLabel}>
                Your remaining allocation:{' '}
              </Typography>
              <Typography className={classes.value}>
                ${printBNandTrimZeros(userRemainingAllocation, mintDecimals, 3)}
              </Typography>
            </Box>
          )}
      </Box>
    </Box>
  )
}

export interface StyleProps {
  percentage: number
}
