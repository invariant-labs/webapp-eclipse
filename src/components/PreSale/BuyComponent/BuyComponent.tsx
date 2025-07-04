import { Box, Grid, Skeleton, Typography } from '@mui/material'
import useStyles from './style'
import DepositAmountInput from '@components/Inputs/DepositAmountInput/DepositAmountInput'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { convertBalanceToBN, formatNumberWithCommas, printBNandTrimZeros } from '@utils/utils'
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
import { WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN, WRAPPED_ETH_ADDRESS } from '@store/consts/static'
import { createButtonActions } from '@utils/uiUtils'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'

interface IProps {
  nativeBalance: BN
  isEligible: boolean
  saleDidNotStart: boolean
  saleEnded: boolean
  saleSoldOut: boolean
  isPublic: boolean
  userDepositedAmount: BN
  whitelistWalletLimit: BN
  currentRound: number
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
  alertBox?: { variant?: string; text: string }
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
  currentRound,
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
  alertBox
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

  const { classes } = useStyles({ percentage: Math.floor(filledPercentage), isActive })

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
      convertBalanceToBN(value, mintDecimals).add(userDepositedAmount).gt(whitelistWalletLimit) &&
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

    return 'Buy $INVT'
  }, [tokenIndex, tokens, isLoading, value])

  const actions = createButtonActions({
    tokens,
    wrappedTokenAddress: WRAPPED_ETH_ADDRESS,
    minAmount: WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN,
    onAmountSet: setValue
  })

  const getAlerBoxColorVariant = useCallback(() => {
    if (alertBox?.variant === 'warning') {
      return classes.alertBoxYellow
    }
    return classes.alerBoxGreen
  }, [alertBox])

  return (
    <Box className={classes.container}>
      <Box sx={{ minHeight: '206px' }}>
        <Box className={classes.headingContainer}>
          <Box sx={{ height: '60px', width: '100%' }}>
            {alertBox && isActive && walletStatus !== Status.Uninitialized ? (
              <Box className={`${classes.alertBox} ${getAlerBoxColorVariant()}`}>
                <TooltipHover
                  gradient
                  title={
                    alertBox.variant !== 'warning' ? (
                      ''
                    ) : (
                      <Box className={classes.tooltipBox}>
                        <Typography>Eligibility was granted for:</Typography>
                        <Typography>- Participating in the Invariant Points Program</Typography>
                        <Typography>- Staking $BITZ on Invariant</Typography>
                      </Box>
                    )
                  }
                  placement='bottom'>
                  <Typography className={classes.alertBoxText}>{alertBox.text}</Typography>
                </TooltipHover>
              </Box>
            ) : walletStatus !== Status.Initialized && isActive ? (
              <Box className={classes.egibilityCheckerWrapper}>
                <Typography className={classes.egibilityCheckerText}>
                  To participate in sale, check your eligibility
                </Typography>
                <ChangeWalletButton
                  width={'40%'}
                  height={36}
                  name='Check eligibility'
                  onConnect={onConnectWallet}
                  connected={false}
                  onDisconnect={onDisconnectWallet}
                />
              </Box>
            ) : saleDidNotStart ? (
              <Typography className={classes.presaleTitle}>Presale starts in:</Typography>
            ) : null}
          </Box>
          <Box className={classes.sectionDivider} />
          {!saleDidNotStart && (
            <>
              <Typography className={classes.titleText}>
                <Typography className={classes.pinkText}>INVARIANT</Typography>
                <Typography className={classes.headingText}>TOKEN PRESALE</Typography>
                <Typography className={classes.greenText}>$INVT</Typography>
              </Typography>
              <Typography className={classes.raisedInfo}>
                <Typography className={classes.greyText}>Raised:</Typography>
                {isLoading ? (
                  <Skeleton variant='rounded' width={150} height={24} sx={{ ml: 1 }} />
                ) : (
                  <>
                    <Typography className={classes.greenBodyText}>
                      ${formatNumberWithCommas(printBNandTrimZeros(currentAmount, mintDecimals, 2))}
                    </Typography>
                    {' / '}$
                    {formatNumberWithCommas(printBNandTrimZeros(targetAmount, mintDecimals, 2))}
                  </>
                )}
              </Typography>
            </>
          )}
        </Box>

        {saleDidNotStart ? (
          <Box className={classes.timerContainer}>
            <Timer hours={hours} minutes={minutes} seconds={seconds} />
          </Box>
        ) : (
          <Box className={classes.barContainer}>
            {isLoading ? (
              <Skeleton variant='rounded' width={'100%'} height={49} sx={{ marginTop: '8px' }} />
            ) : (
              <>
                <Box className={classes.darkBackground}>
                  <Box className={classes.gradientProgress} />
                </Box>
                <Grid container className={classes.barWrapper}>
                  <Typography className={classes.sliderLabel}>0%</Typography>
                  <Typography className={classes.sliderLabel}>
                    {filledPercentage.toFixed(2)}%
                  </Typography>
                  <Typography className={classes.sliderLabel}>100%</Typography>
                </Grid>
              </>
            )}
          </Box>
        )}
      </Box>
      <Box className={classes.sectionDivider} />
      <Box>
        <Box className={classes.inputContainer}>
          <DepositAmountInput
            tokenPrice={1}
            setValue={value => setValue(value)}
            limit={1e14}
            decimalsLimit={mintDecimals}
            currency={tokenIndex !== null ? tokens[tokenIndex].symbol : null}
            currencyIconSrc={tokenIndex !== null ? tokens[tokenIndex].logoURI : undefined}
            currencyIsUnknown={tokenIndex !== null ? tokens[tokenIndex].isUnknown ?? false : false}
            disableBackgroundColor
            placeholder='0.0'
            actionButtons={[
              {
                label: 'Max',
                onClick: () => {
                  actions.maxSale(
                    tokenIndex,
                    currentRound,
                    userDepositedAmount,
                    whitelistWalletLimit,
                    currentAmount,
                    targetAmount,
                    isPublic
                  )
                },
                variant: 'max'
              }
            ]}
            balanceValue={
              tokenIndex !== null
                ? printBNandTrimZeros(tokens[tokenIndex].balance, tokens[tokenIndex].decimals)
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
          {isLoading ? (
            <Skeleton variant='rounded' width={80} height={24} sx={{ ml: 1 }} />
          ) : (
            <Typography className={classes.tokenAmount}>
              {printBNandTrimZeros(receive, REWARD_SCALE)} $INVT
            </Typography>
          )}
        </Box>
      </Box>
      {walletStatus !== Status.Initialized ? (
        <ChangeWalletButton
          width={'100%'}
          height={48}
          name='Connect wallet'
          defaultVariant='green'
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
          disabled={getButtonMessage() !== 'Buy $INVT' || !isActive}
          content={getButtonMessage()}
          progress={progress}
        />
      )}
    </Box>
  )
}
