import { Box, Grid, Typography, Skeleton } from '@mui/material'
import React, { useMemo } from 'react'
import useStyles from './style'
import classNames from 'classnames'
import { BN } from '@coral-xyz/anchor'
import { formatNumberWithCommas, printBNandTrimZeros } from '@utils/utils'
import {
  EFFECTIVE_TARGET_MULTIPLIER,
  PERCENTAGE_SCALE,
  REWARD_SCALE,
  TIER1,
  TIER2,
  TIER3,
  TIER4
} from '@invariant-labs/sale-sdk'
import { Status } from '@store/reducers/solanaWallet'
import { colors } from '@static/theme'

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
  userReceivededAmount: BN
  mintDecimals: number
  roundNumber: number
  proofOfInclusion: Uint8Array<ArrayBufferLike> | undefined
  isLoadingUserStats: boolean
  isReversed: boolean
  isLoadingSaleStats: boolean
  walletStatus: Status
  priceFormat: 'token-to-usdc' | 'usdc-to-token'
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
  isLoadingUserStats,
  priceFormat,
  userReceivededAmount
}) => {
  const { classes } = useStyles({
    percentage: Number(printBNandTrimZeros(percentageFilled, PERCENTAGE_SCALE, 3)),
    isActive
  })

  const renderPriceWithSkeleton = (
    amount: BN,
    decimals: number,
    width = '80px',
    isLoading = isLoadingSaleStats,
    round = roundNumber
  ) => {
    if (isLoading) {
      return <Skeleton variant='text' width={width} height={24} />
    }

    if (priceFormat === 'usdc-to-token') {
      const currentTierPrice = round >= 0 ? [TIER1, TIER2, TIER3, TIER4][Math.min(round - 1, 3)] : 0
      return <>1$ = {printBNandTrimZeros(currentTierPrice, decimals)} INVT</>
    } else {
      return <>1 INVT = {printBNandTrimZeros(amount, decimals, 4)}$</>
    }
  }

  const isLastRound = useMemo(() => roundNumber === 4, [roundNumber])

  const renderFormattedNumberWithSkeleton = (
    amount: BN,
    decimals: number,
    prefix = '$',
    suffix = '',
    width = '100px',
    isLoading = isLoadingSaleStats
  ) => {
    if (isLoading) {
      return <Skeleton variant='text' width={width} height={24} />
    }

    return (
      <Typography sx={{ color: colors.invariant.text }}>
        {prefix}
        {formatNumberWithCommas(printBNandTrimZeros(amount, decimals, 3))}
        {suffix}
      </Typography>
    )
  }

  return (
    <Box className={classes.container}>
      <Typography className={classes.roundTitle}>ROUND {roundNumber}</Typography>

      {!isActive && (
        <Box className={classNames(classes.infoRow)} marginTop={'24px'}>
          <Typography className={classes.infoLabelBigger}>Current ratio: </Typography>
          <Typography className={classes.currentPriceBigger}>
            {renderPriceWithSkeleton(currentPrice, mintDecimals, '160px', isLoadingSaleStats)}
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
                  {renderFormattedNumberWithSkeleton(
                    amountDeposited,
                    mintDecimals,
                    '$',
                    '',
                    '80px'
                  )}
                </Typography>
                <Typography className={classes.amountLeft}>
                  {renderFormattedNumberWithSkeleton(amountNeeded, mintDecimals, '$', '', '80px')}
                </Typography>
              </Grid>
            </>
          ) : (
            <>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>Deposited:</Typography>
                {renderFormattedNumberWithSkeleton(amountDeposited, mintDecimals, '$', '', '100px')}
              </Box>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>Target deposit:</Typography>
                {renderFormattedNumberWithSkeleton(targetAmount, mintDecimals, '$', '', '100px')}
              </Box>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>Maximal deposit:</Typography>
                {renderFormattedNumberWithSkeleton(
                  targetAmount.mul(EFFECTIVE_TARGET_MULTIPLIER),
                  mintDecimals,
                  '$',
                  '',
                  '100px'
                )}
              </Box>
            </>
          )}
        </Box>
        {isActive && (
          <Box className={classes.priceIncreaseBox}>
            <Typography className={classes.priceIncreaseText}>
              {roundNumber === 4 ? 'AMOUNT LEFT:' : 'AMOUNT TILL PRICE INCREASE:'}
            </Typography>
            {renderFormattedNumberWithSkeleton(amountLeft, mintDecimals, '$', '', '100px')}
          </Box>
        )}
      </Box>
      <Box className={classes.infoCard}>
        {isActive && (
          <>
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>Current ratio: </Typography>
              <Typography className={classes.currentPrice}>
                {renderPriceWithSkeleton(currentPrice, mintDecimals, '160px', isLoadingSaleStats)}
              </Typography>
            </Box>
            {!isLastRound && (
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>Next ratio: </Typography>
                <Typography className={classes.nextPrice}>
                  {renderPriceWithSkeleton(
                    nextPrice,
                    mintDecimals,
                    '160px',
                    isLoadingSaleStats,
                    roundNumber + 1
                  )}
                </Typography>
              </Box>
            )}
            <Box className={classes.divider} />
          </>
        )}

        <Box className={classes.infoRow}>
          <Typography className={classes.secondaryLabel}>Your deposit: </Typography>
          {!saleDidNotStart && walletStatus === Status.Initialized ? (
            <Typography className={classes.value}>
              {renderFormattedNumberWithSkeleton(
                userDepositedAmount,
                mintDecimals,
                '$',
                '',
                '80px',
                isLoadingUserStats
              )}
            </Typography>
          ) : (
            <Typography className={classes.value}>-</Typography>
          )}
        </Box>

        {!isLastRound && (
          <Box className={classes.infoRow}>
            <Typography className={classes.secondaryLabel}>Your remaining deposit:</Typography>
            {!saleDidNotStart && walletStatus === Status.Initialized && !!proofOfInclusion ? (
              <Typography className={classes.value}>
                {renderFormattedNumberWithSkeleton(
                  userRemainingAllocation,
                  mintDecimals,
                  '$',
                  '',
                  '80px',
                  isLoadingUserStats
                )}
              </Typography>
            ) : (
              <Typography className={classes.value}>-</Typography>
            )}
          </Box>
        )}

        <Box className={classes.infoRow}>
          <Typography className={classes.secondaryLabel}>Your allocation: </Typography>
          {!saleDidNotStart && walletStatus === Status.Initialized ? (
            <Typography className={classes.value}>
              {renderFormattedNumberWithSkeleton(
                userReceivededAmount,
                REWARD_SCALE,
                '',
                ' INVT',
                '80px',
                isLoadingUserStats
              )}
            </Typography>
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
