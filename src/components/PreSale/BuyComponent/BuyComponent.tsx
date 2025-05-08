import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import { closeSmallGreenIcon, greenInfoIcon, virtualCardIcon } from '@static/icons'
import { USDC_MAIN } from '@store/consts/static'
import DepositAmountInput from '@components/Inputs/DepositAmountInput/DepositAmountInput'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { convertBalanceToBN, formatNumberWithCommas, printBN } from '@utils/utils'
import classNames from 'classnames'
import { Timer } from '../Timer/Timer'
import { BN } from '@coral-xyz/anchor'
import { getPurchaseAmount, MINT_DECIMALS, REWARD_SCALE } from '@invariant-labs/sale-sdk'
import { useCountdown } from '../Timer/useCountdown'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'

interface IProps {
  isActive?: boolean
  alertBoxText?: string
  targetAmount: BN
  currentAmount: BN
  mintDecimals: number
  startTimestamp: BN
  tokens: SwapToken[]
  tokenIndex: number | null
  walletStatus: Status
  progress: ProgressState
  isBalanceLoading: boolean
  isLoading: boolean
  onBuyClick: (amount: BN) => void
  onConnectWallet: () => void
  onDisconnectWallet: () => void
}

enum PaymentMethod {
  VIRTUAL_CARD = 'VIRTUAL_CARD',
  CRYPTO_USDC = 'CRYPTO_USDC'
}

export const BuyComponent: React.FC<IProps> = ({
  alertBoxText,
  targetAmount,
  currentAmount,
  mintDecimals,
  isActive,
  startTimestamp,
  tokens,
  tokenIndex,
  walletStatus,
  isBalanceLoading,
  isLoading,
  progress,
  onBuyClick,
  onConnectWallet,
  onDisconnectWallet
}) => {
  const targetDate = useMemo(() => new Date(startTimestamp.toNumber() * 1000), [startTimestamp])
  const { hours, minutes, seconds } = useCountdown({
    targetDate
  })

  const [value, setValue] = useState<string>('0')
  const [receive, setReceive] = useState<BN>(new BN(0))
  const { raisedAmount, totalAmount } = useMemo(() => {
    return {
      raisedAmount: printBN(currentAmount, mintDecimals),
      totalAmount: printBN(targetAmount, mintDecimals)
    }
  }, [currentAmount, targetAmount])

  const { classes } = useStyles({ percentage: (+raisedAmount / +totalAmount) * 100, isActive })
  const [alertBoxShow, setAlertBoxShow] = useState(true)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | undefined>(
    undefined
  )

  useEffect(() => {
    const amount = convertBalanceToBN(value, mintDecimals)
    const purchaseAmount = getPurchaseAmount(currentAmount, targetAmount, amount)
    setReceive(purchaseAmount)
  }, [value, currentAmount, targetAmount])

  const getButtonMessage = useCallback(() => {
    if (isLoading) {
      return 'Loading'
    }

    if (tokenIndex === null) {
      return 'Fetch error'
    }

    if (convertBalanceToBN(value, tokens[tokenIndex].decimals).gt(tokens[tokenIndex].balance)) {
      return `Not enough ${tokens[tokenIndex].symbol}`
    }

    if (Number(value) === 0) {
      return 'Enter token amount'
    }

    return 'Buy $INV'
  }, [tokenIndex, tokens, isLoading, value])
  return (
    <Box className={classes.container}>
      {alertBoxText && alertBoxShow && isActive && (
        <Box className={classes.alertBox}>
          <Box className={classes.alertBoxContent}>
            <img src={greenInfoIcon} alt='Info icon' />
            <Typography className={classes.alertBoxText}>{alertBoxText}</Typography>
          </Box>

          <Box
            className={classes.closeIconContainer}
            onClick={() => {
              setAlertBoxShow(false)
            }}>
            <img className={classes.closeIcon} src={closeSmallGreenIcon} alt='Close icon' />
          </Box>
        </Box>
      )}

      <Box>
        <Box className={classes.headingContainer}>
          <Typography className={classes.titleText}>
            <Typography className={classes.pinkText}>INVARIANT</Typography>
            <Typography className={classes.headingText}>TOKEN PRESALE</Typography>
            <Typography className={classes.greenText}>$INV</Typography>
          </Typography>
          {isActive && (
            <Typography className={classes.raisedInfo}>
              <Typography className={classes.greyText}>Raised:</Typography>
              <Typography className={classes.greenBodyText}>
                ${formatNumberWithCommas(raisedAmount)}
              </Typography>{' '}
              / ${formatNumberWithCommas(totalAmount)}
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
            <Timer hours={hours} minutes={minutes} seconds={seconds} />
          </Box>
        )}
      </Box>

      <Box className={classes.sectionDivider}>
        <Typography className={classes.sectionHeading}>Pay with</Typography>
        <Box className={classes.paymentOptions}>
          <Box
            className={classNames(
              classes.paymentOption,
              selectedPaymentMethod === PaymentMethod.VIRTUAL_CARD ? classes.paymentSelected : ''
            )}
            onClick={() =>
              isActive ? setSelectedPaymentMethod(PaymentMethod.VIRTUAL_CARD) : undefined
            }>
            <img
              src={virtualCardIcon}
              alt='Virtual Card Icon'
              className={classes.paymentOptionIcon}
            />
            <Typography className={classes.paymentOptionText}>Virtual Card</Typography>
          </Box>
          <Box
            className={classNames(
              classes.paymentOption,
              selectedPaymentMethod === PaymentMethod.CRYPTO_USDC ? classes.paymentSelected : ''
            )}
            onClick={() =>
              isActive ? setSelectedPaymentMethod(PaymentMethod.CRYPTO_USDC) : undefined
            }>
            <img src={USDC_MAIN.logoURI} alt='USDC Icon' className={classes.tokenIcon} />
            <Typography className={classes.paymentOptionText}>Crypto USDC</Typography>
          </Box>
        </Box>
      </Box>

      <Box>
        <Box className={classes.inputContainer}>
          <DepositAmountInput
            tokenPrice={1}
            setValue={value => setValue(value)}
            decimalsLimit={MINT_DECIMALS}
            currency={tokenIndex !== null ? tokens[tokenIndex].symbol : null}
            currencyIconSrc={tokenIndex !== null ? tokens[tokenIndex].logoURI : undefined}
            currencyIsUnknown={tokenIndex !== null ? tokens[tokenIndex].isUnknown ?? false : false}
            disableBackgroundColor
            placeholder='0.0'
            actionButtons={[
              {
                label: 'Max',
                onClick: () => {},
                variant: 'max'
              }
            ]}
            balanceValue={
              tokenIndex !== null
                ? printBN(tokens[tokenIndex].balance, tokens[tokenIndex].decimals)
                : ''
            }
            onBlur={() => {}}
            value={value}
            isBalanceLoading={isBalanceLoading}
            walletUninitialized={walletStatus !== Status.Initialized}
          />
        </Box>
        <Box className={classes.receiveBox}>
          <Typography className={classes.receiveLabel}>You'll receive</Typography>
          <Typography className={classes.tokenAmount}>
            {printBN(receive, REWARD_SCALE)} $INV
          </Typography>
        </Box>
      </Box>
      {walletStatus !== Status.Initialized ? (
        <ChangeWalletButton
          width={'100%'}
          height={48}
          name='Connect wallet'
          onConnect={onConnectWallet}
          connected={false}
          onDisconnect={onDisconnectWallet}
        />
      ) : (
        <AnimatedButton
          className={classes.greenButton}
          onClick={() => {
            if (progress === 'none' && tokenIndex !== null) {
              onBuyClick(convertBalanceToBN(value, mintDecimals))
            }
          }}
          disabled={getButtonMessage() !== 'Buy $INV' || !isActive}
          content={getButtonMessage()}
          progress={progress}
        />
      )}
    </Box>
  )
}
