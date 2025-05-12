import { Box, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import useStyles from './style'
import classNames from 'classnames'
import { BN } from '@coral-xyz/anchor'
import { closeSmallGreenIcon, greenInfoIcon } from '@static/icons'
import { printBNandTrimZeros } from '@utils/utils'
import { EFFECTIVE_TARGET_MULTIPLIER, PERCENTAGE_SCALE } from '@invariant-labs/sale-sdk'

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
  alertBoxText: string | undefined
}

export const RoundComponent: React.FC<RoundComponentProps> = ({
  isActive,
  saleDidNotStart,
  targetAmount,
  amountDeposited,
  amountNeeded,
  amountLeft,
  currentPrice,
  nextPrice,
  percentageFilled,
  userDepositedAmount,
  userRemainingAllocation,
  mintDecimals,
  roundNumber,
  alertBoxText
}) => {
  const { classes } = useStyles({
    percentage: Number(printBNandTrimZeros(percentageFilled, PERCENTAGE_SCALE, 3)),
    isActive
  })
  const [alertBoxShow, setAlertBoxShow] = useState(false)

  useEffect(() => {
    const showBanner = localStorage.getItem('INVARIANT_SALE_SHOW_BANNER')
    if (!showBanner) {
      setAlertBoxShow(true)
      return
    }
    setAlertBoxShow(showBanner === 'true')
  }, [])

  return (
    <Box className={classes.container}>
      <Typography className={classes.roundTitle}>ROUND {roundNumber}</Typography>

      {alertBoxText && alertBoxShow && isActive && (
        <Box className={classes.alertBox}>
          <Box className={classes.alertBoxContent}>
            <img src={greenInfoIcon} alt='Info icon' />
            <Typography className={classes.alertBoxText}>{alertBoxText}</Typography>
          </Box>

          <Box
            className={classes.closeIconContainer}
            onClick={() => {
              localStorage.setItem('INVARIANT_SALE_SHOW_BANNER', 'false')
              setAlertBoxShow(false)
            }}>
            <img className={classes.closeIcon} src={closeSmallGreenIcon} alt='Close icon' />
          </Box>
        </Box>
      )}
      {!isActive && (
        <Box className={classNames(classes.infoRow)} marginTop={'24px'}>
          <Typography className={classes.infoLabelBigger}>Current price: </Typography>
          <Typography className={classes.currentPriceBigger}>
            ${printBNandTrimZeros(currentPrice, mintDecimals, 3)}
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

        {!saleDidNotStart && (
          <Box className={classes.infoRow}>
            <Typography className={classes.secondaryLabel}>Your deposit: </Typography>
            <Typography className={classes.value}>
              ${printBNandTrimZeros(userDepositedAmount, mintDecimals, 3)}
            </Typography>
          </Box>
        )}
        {isActive && (
          <Box className={classes.infoRow}>
            <Typography className={classes.secondaryLabel}>Your remaining allocation: </Typography>
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
