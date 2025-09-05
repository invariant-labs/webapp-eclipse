import { Box, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import useStyles from './style'
import DepositAmountInput from '@components/Inputs/DepositAmountInput/DepositAmountInput'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  convertBalanceToBN,
  formatNumberWithCommas,
  printBN,
  printBNandTrimZeros
} from '@utils/utils'
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
// import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { Link } from 'react-router-dom'
import { theme } from '@static/theme'

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
  minDeposit: BN
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
  isLoadingUserStats: boolean
}

export const BuyComponent: React.FC<IProps> = ({
  nativeBalance,
  // isEligible,
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
  alertBox,
  isLoadingUserStats,
  minDeposit
}) => {
  const targetDate = useMemo(() => new Date(startTimestamp.toNumber() * 1000), [startTimestamp])
  const { hours, minutes, seconds } = useCountdown({
    targetDate
  })
  const truncateText = useMediaQuery(theme.breakpoints.down(470))
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
      return 'Not started yet'
    }

    if (saleSoldOut) {
      return 'Sold out'
    }

    if (saleEnded) {
      return 'Sale ended'
    }

    if (tokenIndex === null) {
      return 'Fetch error'
    }

    if (nativeBalance.lt(WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN)) {
      return `Insufficient ETH`
    }

    const valueAsBN = convertBalanceToBN(value, mintDecimals)

    if (Number(value) === 0) {
      return 'Enter token amount'
    }

    if (valueAsBN.ltn(minDeposit)) {
      return `Minimal deposit is ${printBN(minDeposit, mintDecimals)} ${tokens[tokenIndex].symbol}`
    }

    if (valueAsBN.add(userDepositedAmount).gt(whitelistWalletLimit) && !isPublic) {
      return 'Allocation limit reached'
    }

    if (valueAsBN.gt(tokens[tokenIndex].balance)) {
      return `Not enough ${tokens[tokenIndex].symbol}`
    }

    return 'Buy INVT'
  }, [tokenIndex, tokens, isLoading, value])

  const actions = createButtonActions({
    tokens,
    wrappedTokenAddress: WRAPPED_ETH_ADDRESS,
    minAmount: WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN,
    onAmountSet: setValue
  })

  const getAlerBoxColorVariant = useCallback(() => {
    if (alertBox?.variant === 'warning' || alertBox?.variant === 'limit') {
      return classes.alertBoxYellow
    }
    return classes.alerBoxGreen
  }, [alertBox])

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.container}>
        <Box sx={{ minHeight: !saleEnded ? '206px' : 0 }}>
          <Box className={classes.headingContainer}>
            <Box sx={{ height: '60px', width: '100%' }}>
              {alertBox && walletStatus !== Status.Uninitialized && !saleEnded && !saleSoldOut ? (
                isLoadingUserStats ? (
                  <Skeleton className={classes.skeletonBanner} />
                ) : (
                  <Box className={`${classes.alertBox} ${getAlerBoxColorVariant()}`}>
                    <Typography className={classes.alertBoxText}>{alertBox.text}</Typography>
                  </Box>
                )
              ) : walletStatus !== Status.Initialized && !saleEnded && !saleSoldOut ? (
                <Box className={classes.egibilityCheckerWrapper}>
                  <Typography className={classes.egibilityCheckerText}>
                    To participate in sale, check your eligibility
                  </Typography>
                  <ChangeWalletButton
                    height={36}
                    name={truncateText ? 'Check' : 'Check eligibility'}
                    onConnect={onConnectWallet}
                    connected={false}
                    onDisconnect={onDisconnectWallet}
                  />
                </Box>
              ) : null}
              {(saleEnded || saleSoldOut) && (
                <Typography className={classes.presaleEnded}>
                  PRESALE HAS <span className={classes.greenText}>ENDED</span>
                </Typography>
              )}
            </Box>
            <Box className={classes.sectionDivider} />
            {!saleDidNotStart && (
              <>
                <Typography className={classes.titleText}>
                  <Typography component='h4' className={classes.pinkText}>
                    INVARIANT
                  </Typography>
                  <Typography component='h4'>TOKEN PRESALE</Typography>
                  <Typography component='h4' className={classes.greenText}>
                    INVT
                  </Typography>
                </Typography>
                {isLoading ? (
                  <Typography className={classes.raisedAfterEnd}>
                    <Skeleton variant='rounded' width={150} height={24} sx={{ ml: 1 }} />
                  </Typography>
                ) : saleEnded ? (
                  <Typography className={classes.raisedAfterEnd}>
                    Raised Amount:{' '}
                    <span className={classes.greenText}>
                      ${formatNumberWithCommas(printBNandTrimZeros(currentAmount, mintDecimals, 2))}
                    </span>
                  </Typography>
                ) : (
                  <Typography className={classes.raisedInfo}>
                    <Typography className={classes.greyText}>Raised:</Typography>
                    <Typography className={classes.greenBodyText}>
                      ${formatNumberWithCommas(printBNandTrimZeros(currentAmount, mintDecimals, 2))}
                    </Typography>
                    <>
                      {' / '}$
                      {formatNumberWithCommas(printBNandTrimZeros(targetAmount, mintDecimals, 2))}
                    </>
                  </Typography>
                )}
              </>
            )}
          </Box>

          {saleDidNotStart ? (
            <Box className={classes.timerContainer}>
              <Typography className={classes.presaleTitle}>Community Sale opens in:</Typography>
              <Timer hours={hours} minutes={minutes} seconds={seconds} />
            </Box>
          ) : !saleEnded ? (
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
                    <Typography className={classes.colorSliderLabel}>
                      {filledPercentage.toFixed(2)}%
                    </Typography>
                    <Typography className={classes.sliderLabel}>100%</Typography>
                  </Grid>
                </>
              )}
            </Box>
          ) : null}
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
              currencyIsUnknown={
                tokenIndex !== null ? (tokens[tokenIndex].isUnknown ?? false) : false
              }
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
                      targetAmount
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
              blocked={!isLoading && (saleEnded || saleSoldOut)}
              blockerInfo='Sale ended'
            />
          </Box>
          <Box className={classes.receiveBox}>
            {!isLoading && (saleEnded || saleSoldOut) && <Box className={classes.blocker} />}{' '}
            <Typography className={classes.receiveLabel}>You receive</Typography>
            {isLoading ? (
              <Skeleton variant='rounded' width={80} height={24} sx={{ ml: 1 }} />
            ) : (
              <Typography className={classes.tokenAmount}>
                {printBNandTrimZeros(receive, REWARD_SCALE)} INVT
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
            disabled={getButtonMessage() !== 'Buy INVT' || !isActive}
            content={getButtonMessage()}
            progress={progress}
          />
        )}
      </Box>
      <Box mt={'24px'} height={27}>
        <Link
          to='https://eclipse.invariant.app/termsAndConditions.pdf'
          target='_blank'
          className={classes.link}>
          Terms and Conditions
        </Link>
      </Box>
    </Box>
  )
}
