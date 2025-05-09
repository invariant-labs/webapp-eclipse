import { Box, Typography, useMediaQuery } from '@mui/material'
import { useStyles } from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { airdropRainbowIcon, backArrowIcon, newTabIcon, reverseTokensIcon } from '@static/icons'
import { theme } from '@static/theme'
import MarketIdLabel from '@components/NewPosition/MarketIdLabel/MarketIdLabel'
import { VariantType } from 'notistack'
import Refresher from '@common/Refresher/Refresher'
import { REFRESHER_INTERVAL } from '@store/consts/static'
import { useEffect, useMemo, useState } from 'react'
import { truncateString } from '@utils/utils'
import { LockButton } from './LockButton'
import { Button } from '@common/Button/Button'

type Props = {
  tokenA: {
    icon: string
    ticker: string
  }
  tokenB: {
    icon: string
    ticker: string
  }
  fee: number
  hasEnoughETH: boolean
  hasFees: boolean
  isPromoted: boolean
  poolAddress: string
  networkUrl: string
  isLocked: boolean
  isActive: boolean
  onReverseTokensClick: () => void
  onClosePositionClick: () => void
  onAddPositionClick: () => void
  onRefreshClick: () => void
  onGoBackClick: () => void
  onLockClick: () => void
  copyPoolAddressHandler: (message: string, variant: VariantType) => void
  isPreview: boolean
  isClosing: boolean
}

export const PositionHeader = ({
  tokenA,
  tokenB,
  fee,
  hasEnoughETH,
  hasFees,
  isPromoted,
  poolAddress,
  networkUrl,
  isLocked,
  isActive,
  onReverseTokensClick,
  onClosePositionClick,
  onAddPositionClick,
  onRefreshClick,
  onGoBackClick,
  onLockClick,
  copyPoolAddressHandler,
  isPreview,
  isClosing
}: Props) => {
  const { classes, cx } = useStyles()
  const isSmDown = useMediaQuery(theme.breakpoints.down(688))
  const isMdDown = useMediaQuery(theme.breakpoints.down(1040))
  const isMdUp = useMediaQuery(theme.breakpoints.up(1040))
  const [refresherTime, setRefresherTime] = useState(REFRESHER_INTERVAL)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (refresherTime > 0) {
        setRefresherTime(refresherTime - 1)
      } else {
        onRefreshClick()
        setRefresherTime(REFRESHER_INTERVAL)
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [refresherTime])

  const closeButtonTitle = useMemo(() => {
    if (isPreview) {
      return 'Closing positions is disabled in preview'
    }
    if (isLocked) {
      return 'Closing positions is disabled when position is locked'
    }
    if (!hasEnoughETH) {
      return 'Insufficient ETH to close position'
    }
    if (hasFees) {
      return 'Unclaimed fees will be returned when closing the position'
    }
    return ''
  }, [isPreview, isLocked, hasEnoughETH, hasFees])

  const closeButton = closeButtonTitle ? (
    <TooltipHover title={closeButtonTitle}>
      <Button
        height={36}
        scheme='green'
        disabled={isLocked || !hasEnoughETH || isPreview || isClosing}
        variant='contained'
        onClick={() => onClosePositionClick()}>
        Close position
      </Button>
    </TooltipHover>
  ) : (
    <Button
      height={36}
      scheme='green'
      disabled={isLocked || !hasEnoughETH || isPreview || isClosing}
      variant='contained'
      onClick={() => onClosePositionClick()}>
      Close position
    </Button>
  )

  const addButton = (
    <TooltipHover title='Add more liquidity to this pool'>
      <Button scheme='pink' variant='contained' onClick={() => onAddPositionClick()}>
        + Add position
      </Button>
    </TooltipHover>
  )

  const marketIdLabel = (
    <Box className={classes.marketIdLabelContainer}>
      <MarketIdLabel
        marketId={poolAddress}
        displayLength={5}
        copyPoolAddressHandler={copyPoolAddressHandler}
      />
      <TooltipHover title='Open pool in explorer'>
        <a
          href={`https://eclipsescan.xyz/account/${poolAddress.toString()}${networkUrl}`}
          target='_blank'
          rel='noopener noreferrer'>
          <img className={classes.explorerLink} src={newTabIcon} alt='Explorer link' />
        </a>
      </TooltipHover>
    </Box>
  )

  const refresher = (
    <TooltipHover title='Refresh'>
      <Box>
        <Refresher
          currentIndex={refresherTime}
          maxIndex={REFRESHER_INTERVAL}
          onClick={() => {
            onRefreshClick()
            setRefresherTime(REFRESHER_INTERVAL)
          }}
        />
      </Box>
    </TooltipHover>
  )

  return (
    <Box className={classes.headerContainer}>
      <Box className={classes.navigation}>
        <Box className={cx(classes.wrapper, classes.backContainer)} onClick={() => onGoBackClick()}>
          <img src={backArrowIcon} alt='Back arrow' />
          <Typography className={classes.backText}>Back to portfolio</Typography>
        </Box>
        {isMdDown && (
          <Box className={classes.navigationSide}>
            {marketIdLabel} {refresher}
          </Box>
        )}
      </Box>
      <Box className={classes.container}>
        <Box className={classes.upperContainer}>
          <Box className={classes.wrapper}>
            <Box className={classes.iconContainer}>
              <img className={classes.icon} src={tokenA.icon} alt={tokenA.ticker} />
              <TooltipHover title='Reverse tokens'>
                <img
                  className={classes.reverseTokensIcon}
                  src={reverseTokensIcon}
                  alt='Reverse tokens'
                  onClick={() => onReverseTokensClick()}
                />
              </TooltipHover>
              <img className={classes.icon} src={tokenB.icon} alt={tokenB.ticker} />
            </Box>
            <Typography className={classes.tickerContainer}>
              {truncateString(tokenA.ticker, 4)} - {truncateString(tokenB.ticker, 4)}
            </Typography>
            <TooltipHover
              title={
                isPromoted ? 'This pool distributes points' : "This pool doesn't distribute points"
              }>
              <img
                className={cx(classes.airdropIcon, {
                  [classes.airdropIconInActive]: !isPromoted
                })}
                src={airdropRainbowIcon}
                alt='Points'
              />
            </TooltipHover>
          </Box>
          <Box className={classes.wrapper}>
            <TooltipHover
              title={
                isActive ? (
                  <>
                    The position is <b>active</b> and <b>earning a fee</b> as long as the current
                    price is <b>within</b> the position's price range.
                  </>
                ) : (
                  <>
                    The position is <b>inactive</b> and <b>not earning a fee</b> as long as the
                    current price is <b>outside</b> the position's price range.
                  </>
                )
              }
              placement='top'
              increasePadding>
              <Box
                className={cx(classes.feeContainer, {
                  [classes.feeContainerIsActive]: isActive
                })}>
                {fee.toFixed(2)}%
              </Box>
            </TooltipHover>
            {!isSmDown && closeButton}
            {!isSmDown && isMdDown && (
              <>
                {addButton}
                <LockButton
                  isClosing={isClosing}
                  isLocked={isLocked}
                  isPreview={isPreview}
                  onLockClick={onLockClick}
                />
              </>
            )}
          </Box>
        </Box>
        {(isSmDown || isMdUp) && (
          <Box className={classes.lowerContainer}>
            {!isMdDown ? (
              <>
                {marketIdLabel}
                <Box className={classes.wrapper}>
                  {refresher} {addButton}{' '}
                  <LockButton
                    isLocked={isLocked}
                    isClosing={isClosing}
                    isPreview={isPreview}
                    onLockClick={onLockClick}
                  />
                </Box>
              </>
            ) : (
              <>
                {closeButton}
                {addButton}
                <LockButton
                  isClosing={isClosing}
                  isLocked={isLocked}
                  isPreview={isPreview}
                  onLockClick={onLockClick}
                />
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
