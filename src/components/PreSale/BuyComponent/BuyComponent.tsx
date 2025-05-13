import { Box, Grid, Skeleton, Typography } from '@mui/material'
import useStyles from './style'
import DepositAmountInput from '@components/Inputs/DepositAmountInput/DepositAmountInput'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { convertBalanceToBN, printBNandTrimZeros } from '@utils/utils'
import { Timer } from '../Timer/Timer'
import { BN } from '@coral-xyz/anchor'
import {
  getPurchaseAmount,
  PERCENTAGE_DENOMINATOR,
  PERCENTAGE_SCALE,
  REWARD_SCALE
} from '@invariant-labs/sale-sdk'
import { useCountdown } from '../Timer/useCountdown'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import { WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN } from '@store/consts/static'
import { closeSmallGreenIcon, greenInfoIcon } from '@static/icons'

interface IProps {
  nativeBalance: BN
  isEligible: boolean
  saleDidNotStart: boolean
  saleEnded: boolean
  saleSoldOut: boolean
  isPublic: Boolean
  userDepositedAmount: BN
  whitelistWalletLimit: BN
  isActive: boolean
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
  alertBoxText?: string
  onBuyClick: (amount: BN) => void
  onConnectWallet: () => void
  onDisconnectWallet: () => void
}

export const BuyComponent: React.FC<IProps> = ({
  nativeBalance,
  isEligible,
  isPublic,
  saleDidNotStart,
  saleEnded,
  saleSoldOut,
  userDepositedAmount,
  whitelistWalletLimit,
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
  onDisconnectWallet,
  alertBoxText,
}) => {
  const targetDate = useMemo(() => new Date(startTimestamp.toNumber() * 1000), [startTimestamp])
  const { hours, minutes, seconds } = useCountdown({
    targetDate
  })

  const [value, setValue] = useState<string>('0')
  const [receive, setReceive] = useState<BN>(new BN(0))
  const filledPercentage = useMemo(() => {
    if (targetAmount.isZero()) {
      return 0
    }
    const filledPercentageBN = currentAmount.muln(100).mul(PERCENTAGE_DENOMINATOR).div(targetAmount)
    return Number(printBNandTrimZeros(filledPercentageBN, PERCENTAGE_SCALE, 3))
  }, [currentAmount, targetAmount])

  const { classes } = useStyles({ percentage: filledPercentage, isActive })

  useEffect(() => {
    const amount = convertBalanceToBN(value, mintDecimals)
    const purchaseAmount = getPurchaseAmount(currentAmount, targetAmount, amount, mintDecimals)
    setReceive(purchaseAmount)
  }, [value, currentAmount, targetAmount, mintDecimals])

  const getButtonMessage = useCallback(() => {
    if (isLoading) {
      return 'Loading'
    }

    if (saleDidNotStart) {
      return 'Sale did not start'
    }

    if (saleSoldOut) {
      return 'Sale sold out'
    }

    if (saleEnded) {
      return 'Sale ended'
    }

    if (tokenIndex === null) {
      return 'Fetch error'
    }

    if (!isEligible && !isPublic) {
      return 'You are not eligible'
    }

    if (
      convertBalanceToBN(value, mintDecimals).add(userDepositedAmount).gte(whitelistWalletLimit) &&
      !isPublic
    ) {
      return 'Your deposit exceed limit'
    }

    if (convertBalanceToBN(value, tokens[tokenIndex].decimals).gt(tokens[tokenIndex].balance)) {
      return `Not enough ${tokens[tokenIndex].symbol}`
    }

    if (nativeBalance.lt(WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN)) {
      return `Insufficient ETH`
    }

    if (Number(value) === 0) {
      return 'Enter token amount'
    }

    return 'Buy $INV'
  }, [tokenIndex, tokens, isLoading, value])

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
      <Box>
        <Box className={classes.headingContainer}>
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
          <Typography className={classes.titleText}>
            <Typography className={classes.pinkText}>INVARIANT</Typography>
            <Typography className={classes.headingText}>TOKEN PRESALE</Typography>
            <Typography className={classes.greenText}>$INV</Typography>
          </Typography>
          {isActive && (
            <Typography className={classes.raisedInfo}>
              <Typography className={classes.greyText}>Raised:</Typography>
              {isLoading ? (
                <Skeleton variant="rounded" width={200} height={24} sx={{ ml: 1 }} />
              ) : (
                <>
                  <Typography className={classes.greenBodyText}>
                    ${printBNandTrimZeros(currentAmount, mintDecimals, 3)}
                  </Typography>
                  {' / '}
                  ${printBNandTrimZeros(targetAmount, mintDecimals, 3)}
                </>
              )}
            </Typography>
          )}
        </Box>
        {
          isActive && (
            <>
              <Box className={classes.darkBackground}>
                <Box className={classes.gradientProgress} />
              </Box>
              <Grid container className={classes.barWrapper}>
                <Typography className={classes.sliderLabel}>{filledPercentage}%</Typography>
                <Typography className={classes.sliderLabel}>100%</Typography>
              </Grid>
            </>
          )
        }

        {
          saleDidNotStart && (
            <Box
              sx={{
                marginTop: '16px',
                width: '467px'
              }}>
              <Timer hours={hours} minutes={minutes} seconds={seconds} />
            </Box>
          )
        }
      </Box >
      <Box className={classes.sectionDivider} />

      <Box>
        <Box className={classes.inputContainer}>
          <DepositAmountInput
            tokenPrice={1}
            setValue={value => setValue(value)}
            decimalsLimit={mintDecimals}
            currency={tokenIndex !== null ? tokens[tokenIndex].symbol : null}
            currencyIconSrc={tokenIndex !== null ? tokens[tokenIndex].logoURI : undefined}
            currencyIsUnknown={tokenIndex !== null ? tokens[tokenIndex].isUnknown ?? false : false}
            disableBackgroundColor
            placeholder='0.0'
            actionButtons={[
              {
                label: 'Max',
                onClick: () => { },
                variant: 'max'
              }
            ]}
            balanceValue={
              tokenIndex !== null
                ? printBNandTrimZeros(tokens[tokenIndex].balance, tokens[tokenIndex].decimals)
                : ''
            }
            onBlur={() => { }}
            value={value}
            isBalanceLoading={isBalanceLoading}
            walletUninitialized={walletStatus !== Status.Initialized}
          />
        </Box>
        <Box className={classes.receiveBox}>
          <Typography className={classes.receiveLabel}>You'll receive</Typography>
          {isLoading ? (
            <Skeleton variant="rounded" width={200} height={24} sx={{ ml: 1 }} />
          ) : (
            <Typography className={classes.tokenAmount}>
              {printBNandTrimZeros(receive, REWARD_SCALE)} $INV
            </Typography>
          )}

        </Box>
      </Box>
      {
        walletStatus !== Status.Initialized ? (
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
        )
      }
    </Box >
  )
}
