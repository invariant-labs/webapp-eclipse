import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import useStyles from './style'
import { useCountdown } from '../Timer/useCountdown';
import { colors, typography } from '@static/theme';
import classNames from 'classnames';

interface RoundComponentProps {
    isActive?: boolean;
    roundNumber: number;
    amountBought: number;
    amountLeft: number;
    percentageFilled: number;
    tokensLeft?: number;
    currentPrice: number;
    nextPrice: number;
    purchasedTokens: number;
    remainingAllocation: number;
    currency?: string;
}

export const RoundComponent: React.FC<RoundComponentProps> = ({
    isActive = false,
    roundNumber = 1,
    amountBought = 12129392.32,
    amountLeft = 18239.1233,
    percentageFilled = 50,
    currentPrice = 0.192,
    tokensLeft = 0,
    nextPrice = 0.192,
    purchasedTokens = 17283.201,
    remainingAllocation = 20000,
    currency = 'INV'
}) => {
    const { classes } = useStyles({ percentage: percentageFilled, isActive })
    const { hours, minutes, seconds } = useCountdown({ targetDate: '2025-05-07T23:59:59Z' })
    return (
        <Box className={classes.container}>
            <Typography className={classes.roundTitle}>ROUND {roundNumber}</Typography>
            {!isActive && (
                <Box className={classNames(classes.infoRow)} marginTop={'24px'}>
                    <Typography className={classes.infoLabelBigger}>Current price: </Typography>
                    <Typography className={classes.currentPriceBigger}>${currentPrice.toFixed(3)}</Typography>
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
                                <Typography className={classes.amountBought}>{amountBought.toLocaleString()} ${currency} bought</Typography>
                                <Typography className={classes.amountLeft}>{amountLeft.toLocaleString()} ${currency} left</Typography>
                            </Grid>
                        </>
                    ) : <>
                        <Box className={classes.infoRow}>
                            <Typography className={classes.infoLabel}>Tokens left: </Typography>
                            <Typography className={classes.currentPrice}>{tokensLeft}</Typography>
                        </Box>
                    </>}
                </Box>
                <Box className={classes.priceIncreaseBox}>
                    <Typography className={classes.priceIncreaseText}>UNTIL NEXT PRICE INCREASE:</Typography>
                    {isActive && (
                        <Typography className={classes.priceIncreaseText} sx={{ width: '130px' }}><Typography sx={{ ...typography.heading4, color: colors.invariant.text }}>{hours}H</Typography>:<Typography sx={{ ...typography.heading4, color: colors.invariant.text }}>{minutes}M</Typography>:<Typography sx={{ ...typography.heading4, color: colors.invariant.text }}>{seconds}S</Typography></Typography>
                    )}
                    {/* <Timer hours={hours} minutes={minutes} seconds={seconds} /> */}
                </Box>
            </Box>

            <Box className={classes.infoCard}>
                {isActive && (
                    <>
                        <Box className={classes.infoRow}>
                            <Typography className={classes.infoLabel}>Current price: </Typography>
                            <Typography className={classes.currentPrice}>${currentPrice.toFixed(3)}</Typography>
                        </Box>
                        <Box className={classes.infoRow}>
                            <Typography className={classes.infoLabel}>Next price: </Typography>
                            <Typography className={classes.nextPrice}>${nextPrice.toFixed(3)}</Typography>
                        </Box>
                        <Box className={classes.divider} />
                    </>
                )}

                <Box className={classes.infoRow}>
                    <Typography className={classes.secondaryLabel}>Your purchased {currency}: </Typography>
                    <Typography className={classes.value}>{purchasedTokens.toLocaleString()}</Typography>
                </Box>
                <Box className={classes.infoRow}>
                    <Typography className={classes.secondaryLabel}>Your remaining {currency} allocation: </Typography>
                    <Typography className={classes.value}>{remainingAllocation.toLocaleString()}</Typography>
                </Box>
            </Box>
        </Box>
    )
}

export interface StyleProps {
    percentage: number;
}