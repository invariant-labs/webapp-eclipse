import { Box, Grid, Typography, Skeleton } from '@mui/material'
import React from 'react'
import useStyles from './style'
import classNames from 'classnames'
import { BN } from '@coral-xyz/anchor'
import { formatNumberWithCommas, printBNandTrimZeros } from '@utils/utils'
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
  isReversed: boolean
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
  isReversed,
  isLoadingSaleStats,
  isLoadingUserStats
}) => {
  const { classes } = useStyles({
    percentage: Number(printBNandTrimZeros(percentageFilled, PERCENTAGE_SCALE, 3)),
    isActive
  })

  // ...existing code...
  // ...existing code...

  const renderPriceWithSkeleton = (amount, decimals, prefix = "$", suffix = '', width = "80px", isLoading = isLoadingSaleStats, applyReverse = false) => {
    if (isLoading) {
      return <Skeleton variant="text" width={width} height={24} />
    }

    if (isReversed && applyReverse) {
      return <>{printBNandTrimZeros(amount, decimals, 3)} $INVT</>
    }

    return <>{prefix}{printBNandTrimZeros(amount, decimals, 3)}{suffix}</>
  }

  const renderFormattedNumberWithSkeleton = (amount, decimals, prefix = "$", suffix = '', width = "100px", isLoading = isLoadingSaleStats, applyReverse = false) => {
    if (isLoading) {
      return <Skeleton variant="text" width={width} height={24} />
    }

    if (isReversed && applyReverse) {
      return <Typography>{formatNumberWithCommas(printBNandTrimZeros(amount, decimals, 3))} $INVT</Typography>
    }

    return <Typography>{prefix}{formatNumberWithCommas(printBNandTrimZeros(amount, decimals, 3))}{suffix}</Typography>
  }

  return (
    <Box className={classes.container}>
      <Typography className={classes.roundTitle}>ROUND {roundNumber}</Typography>

      {!isActive && (
        <Box className={classNames(classes.infoRow)} marginTop={'24px'}>
          <Typography className={classes.infoLabelBigger}>Current price: </Typography>
          <Typography className={classes.currentPriceBigger}>
            {renderPriceWithSkeleton(currentPrice, mintDecimals, "$", '', "80px", isLoadingSaleStats, true)}
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
                  {renderFormattedNumberWithSkeleton(amountDeposited, mintDecimals, "$", '', "80px")}
                </Typography>
                <Typography className={classes.amountLeft}>
                  {renderFormattedNumberWithSkeleton(amountNeeded, mintDecimals, "$", '', "80px")}
                </Typography>
              </Grid>
            </>
          ) : (
            <>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>
                  Deposited:
                </Typography>
                {renderFormattedNumberWithSkeleton(amountDeposited, mintDecimals, "$", '', "100px")}
              </Box>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>
                  Target deposit:
                </Typography>
                {renderFormattedNumberWithSkeleton(targetAmount, mintDecimals, "$", '', "100px")}
              </Box>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>
                  Maximal deposit:

                </Typography>
                {renderFormattedNumberWithSkeleton(targetAmount.mul(EFFECTIVE_TARGET_MULTIPLIER), mintDecimals, "$", '', "100px")}
              </Box>
            </>
          )}
        </Box>
        {isActive && (
          <Box className={classes.priceIncreaseBox}>
            <Typography className={classes.priceIncreaseText}>
              AMOUNT TILL PRICE INCREASE:
            </Typography>
            {renderFormattedNumberWithSkeleton(amountLeft, mintDecimals, "$", '', "100px")}
          </Box>
        )}
      </Box>

      <Box className={classes.infoCard}>
        {isActive && (
          <>
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>Current price: </Typography>
              <Typography className={classes.currentPrice}>
                {renderFormattedNumberWithSkeleton(currentPrice, mintDecimals, "$", '', "80px", isLoadingSaleStats, true)}
              </Typography>
            </Box>
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>Next price: </Typography>
              <Typography className={classes.nextPrice}>
                {renderFormattedNumberWithSkeleton(nextPrice, mintDecimals, "$", '', "80px", isLoadingSaleStats, true)}
              </Typography>
            </Box>
            <Box className={classes.divider} />
          </>
        )}

        <Box className={classes.infoRow}>
          <Typography className={classes.secondaryLabel}>Your deposit: </Typography>
          {!isLoadingUserStats && !saleDidNotStart && walletStatus === Status.Initialized && proofOfInclusion ? (
            <Typography className={classes.value}>
              {renderFormattedNumberWithSkeleton(userDepositedAmount, mintDecimals, "$", '', "80px", isLoadingUserStats)}
            </Typography>
          ) : isLoadingUserStats && walletStatus === Status.Initialized ? (
            <Skeleton variant="text" width="80px" height={24} />
          ) : (
            <Typography className={classes.value}>-</Typography>
          )}
        </Box>

        <Box className={classes.infoRow}>
          <Typography className={classes.secondaryLabel}>
            Your remaining allocation:{' '}
          </Typography>
          {!isLoadingUserStats && isActive && !(roundNumber === 4 || (roundNumber < 4 && !proofOfInclusion)) ? (
            <Typography className={classes.value}>
              {renderFormattedNumberWithSkeleton(userRemainingAllocation, mintDecimals, "$", '', "80px", isLoadingUserStats)}
            </Typography>
          ) : isLoadingUserStats && walletStatus === Status.Initialized && !!proofOfInclusion ? (
            <Skeleton variant="text" width="80px" height={24} />
          ) : (
            <Typography className={classes.value}>-</Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export interface StyleProps {
  percentage: number
}