import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import { closeSmallGreenIcon, greenInfoIcon, virtualCardIcon } from '@static/icons'
import { USDC_MAIN } from '@store/consts/static'
import DepositAmountInput from '@components/Inputs/DepositAmountInput/DepositAmountInput'
import { Button } from '@common/Button/Button'
import React, { useState } from 'react'
import { formatNumberWithCommas } from '@utils/utils'
import classNames from 'classnames'
import { Timer } from '../Timer/Timer'
// import { Timer } from '../Timer/Timer'

interface IProps {
    isActive?: boolean
    alertBoxText?: string
    raisedAmount: string
    totalAmount: string
    onBuyClick?: () => void
}

enum PaymentMethod {
    VIRTUAL_CARD = 'VIRTUAL_CARD',
    CRYPTO_USDC = 'CRYPTO_USDC'
}


export const BuyComponent: React.FC<IProps> = ({ alertBoxText, raisedAmount, totalAmount, isActive, onBuyClick }) => {
    const { classes } = useStyles({ percentage: (+raisedAmount / +totalAmount) * 100, isActive })
    const [alertBoxShow, setAlertBoxShow] = useState(true)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | undefined>(undefined)
    return (
        <Box className={classes.container}>
            {alertBoxText && alertBoxShow && isActive && (

                <Box className={classes.alertBox}>
                    <Box className={classes.alertBoxContent}>
                        <img src={greenInfoIcon} alt='Info icon' />
                        <Typography className={classes.alertBoxText}>{alertBoxText}</Typography>
                    </Box>

                    <Box className={classes.closeIconContainer} onClick={() => {

                        setAlertBoxShow(false)

                    }}>
                        <img className={classes.closeIcon} src={closeSmallGreenIcon} alt='Close icon' />
                    </Box>
                </Box>
            )}

            <Box>

                {/* <Timer hours='00' minutes='00' seconds='00' /> */}
                <Box className={classes.headingContainer}>
                    <Typography className={classes.titleText}>
                        <Typography className={classes.pinkText}>INVARIANT</Typography>
                        <Typography className={classes.headingText}>TOKEN PRESALE</Typography>
                        <Typography className={classes.greenText}>$INV</Typography>
                    </Typography>
                    {isActive && (
                        <Typography className={classes.raisedInfo}>
                            <Typography className={classes.greyText}>Raised:</Typography>
                            <Typography className={classes.greenBodyText}>${formatNumberWithCommas(raisedAmount)}</Typography> / ${formatNumberWithCommas(totalAmount)}
                        </Typography>
                    )}
                </Box>
                {isActive ? (
                    <>
                        <Box className={classes.darkBackground}>
                            <Box className={classes.gradientProgress} />
                        </Box>
                        <Grid container className={classes.barWrapper}>
                            <Typography className={classes.sliderLabel}>0%</Typography>
                            <Typography className={classes.sliderLabel}>100%</Typography>
                        </Grid>
                    </>

                ) : (
                    <Box sx={{ marginTop: '16px' }}>
                        <Timer hours='00' minutes='00' seconds='00' />
                    </Box>
                )}
            </Box>

            <Box className={classes.sectionDivider}>
                <Typography className={classes.sectionHeading}>Pay with</Typography>
                <Box className={classes.paymentOptions}>
                    <Box className={classNames(classes.paymentOption, selectedPaymentMethod === PaymentMethod.VIRTUAL_CARD ? classes.paymentSelected : '')} onClick={() => isActive ? setSelectedPaymentMethod(PaymentMethod.VIRTUAL_CARD) : undefined}>
                        <img src={virtualCardIcon} alt='Virtual Card Icon' className={classes.paymentOptionIcon} />
                        <Typography className={classes.paymentOptionText}>Virtual Card</Typography>
                    </Box>
                    <Box className={classNames(classes.paymentOption, selectedPaymentMethod === PaymentMethod.CRYPTO_USDC ? classes.paymentSelected : '')} onClick={() => isActive ? setSelectedPaymentMethod(PaymentMethod.CRYPTO_USDC) : undefined}>
                        <img src={USDC_MAIN.logoURI} alt='USDC Icon' className={classes.tokenIcon} />
                        <Typography className={classes.paymentOptionText}>Crypto USDC</Typography>
                    </Box>
                </Box>
            </Box>

            <Box>
                <Box className={classes.inputContainer}>
                    <DepositAmountInput
                        tokenPrice={0.1}
                        setValue={() => { }}
                        decimalsLimit={2}
                        currency={'USDC'}
                        disableBackgroundColor
                        percentageChange={-4.32}
                        currencyIconSrc={USDC_MAIN.logoURI}
                        currencyIsUnknown={false}
                        placeholder='0.0'
                        actionButtons={[
                            {
                                label: 'Max',
                                onClick: () => { },
                                variant: 'max'
                            },
                        ]}
                        balanceValue={'0'}
                        onBlur={() => { }}
                        value={'0'}
                        priceLoading={false}
                        isBalanceLoading={false}
                        walletUninitialized={false}
                    />
                </Box>
                <Box className={classes.receiveBox}>
                    <Typography className={classes.receiveLabel}>You'll receive</Typography>
                    <Typography className={classes.tokenAmount}>6,456 $INV</Typography>
                </Box>
            </Box>

            <Button scheme='green' padding='0 42px' height='44px' disabled={!isActive} onClick={onBuyClick}>
                Buy $INV
            </Button>
        </Box>
    )
}