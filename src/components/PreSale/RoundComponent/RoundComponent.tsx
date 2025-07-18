import { Box, Grid, Typography, Skeleton } from '@mui/material'
import React, { useMemo } from 'react'
import useStyles from './style'
import classNames from 'classnames'
import { BN } from '@coral-xyz/anchor'
import { formatNumberWithCommas, printBN, printBNandTrimZeros } from '@utils/utils'
import {
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
  proofOfInclusion: Array<number> | undefined
  isLoadingUserStats: boolean
  isReversed: boolean
  isLoadingSaleStats: boolean
  walletStatus: Status
  priceFormat: 'token-to-usdc' | 'usdc-to-token'
  roundName?: string
  saleEnded: boolean
  saleSoldOut: boolean
}

export const RoundComponent: React.FC<RoundComponentProps> = ({
  isActive,
  saleEnded,
  saleSoldOut,
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
  userReceivededAmount,
  roundName
}) => {
  const { classes } = useStyles({
    percentage: Number(printBNandTrimZeros(percentageFilled, PERCENTAGE_SCALE, 3)),
    isActive
  })

  const getValuation = (round: number) => {
    if (round === 1) return '$3.65 MLN'
    if (round === 2) return '$4.75 MLN'
    if (round === 3) return '$5.48 MLN'
    if (round === 4) return '$6.21 MLN'
  }

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
      return <>1$ = {printBNandTrimZeros(currentTierPrice, decimals, 4)} INVT</>
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
      <Box className={classes.roundTitleContainer}>
        <Typography className={classes.roundText}>Current phase:</Typography>
        {isLoadingSaleStats ? (
          <Skeleton variant='text' width={135} height={24} />
        ) : (
          <Typography className={classes.roundTitle}>{roundName?.toUpperCase()}</Typography>
        )}
      </Box>

      {!isActive && (
        <Box className={classNames(classes.infoRow)} marginTop={'24px'}>
          <Typography className={classes.infoLabelBigger}>Current price: </Typography>
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
                  {isLoadingSaleStats ? (
                    <Skeleton variant='text' width={'80px'} height={24} />
                  ) : (
                    <Typography sx={{ color: colors.invariant.text }}>
                      $
                      {formatNumberWithCommas(
                        Math.round(+printBN(amountNeeded, mintDecimals)).toString()
                      )}
                    </Typography>
                  )}
                </Typography>
              </Grid>
            </>
          ) : (
            <>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>Total raised</Typography>
                {renderFormattedNumberWithSkeleton(amountDeposited, mintDecimals, '$', '', '100px')}
              </Box>
              {!saleEnded && !saleSoldOut && (
                <Box className={classes.infoRow}>
                  <Typography className={classes.infoLabel}>Target raise</Typography>
                  {renderFormattedNumberWithSkeleton(targetAmount, mintDecimals, '$', '', '100px')}
                </Box>
              )}
              {/* <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>
                  <Box mr={'2px'}>Upper limit</Box>
                  <TooltipHover
                    top={1}
                    title={
                      'The sale can accept contributions beyond the target amount, up to this upper limit, to accommodate higher-than-expected demand'
                    }>
                    <img src={infoCircleIcon} />
                  </TooltipHover>
                </Typography>
                {renderFormattedNumberWithSkeleton(
                  EFFECTIVE_TARGET,
                  mintDecimals,
                  '$',
                  '',
                  '100px'
                )}
              </Box> */}
            </>
          )}
        </Box>
        {isActive && (
          <Box className={classes.priceIncreaseBox}>
            <Typography className={classes.priceIncreaseText}>
              {roundNumber === 4 ? 'REMAINING TO END OF SALE:' : 'REMAINING TO NEXT TIER:'}
            </Typography>
            {renderFormattedNumberWithSkeleton(amountLeft, mintDecimals, '$', '', '100px')}
          </Box>
        )}
      </Box>
      <Box className={classes.infoCard} marginTop={'24px'}>
        <Box className={classes.infoRow}>
          <Typography className={classes.infoLabel}>Current Phase FDV</Typography>
          <Typography className={classes.value}>{getValuation(roundNumber)}</Typography>
        </Box>
        {!isActive && (
          <Box className={classes.infoRow}>
            <Typography className={classes.infoLabel}>Total Supply</Typography>
            <Typography className={classes.value}>365 MLN</Typography>
          </Box>
        )}
      </Box>
      <Box className={classes.infoCard}>
        {isActive && (
          <>
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>Current price: </Typography>
              <Typography className={classes.currentPrice}>
                {renderPriceWithSkeleton(currentPrice, mintDecimals, '160px', isLoadingSaleStats)}
              </Typography>
            </Box>
            {!isLastRound && (
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>Next price: </Typography>
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
          <Typography className={classes.secondaryLabel}>Your contribution</Typography>
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

        {!isLastRound && !saleEnded && (
          <Box className={classes.infoRow}>
            <Typography className={classes.secondaryLabel}>Remaining limit</Typography>
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
          <Typography className={classes.secondaryLabel}>Your allocation</Typography>
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
