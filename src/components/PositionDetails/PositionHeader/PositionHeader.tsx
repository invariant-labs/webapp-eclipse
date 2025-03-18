import { Box, Button, Typography, useMediaQuery } from '@mui/material'
import { useStyles } from './style'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import icons from '@static/icons'
import classNames from 'classnames'
import { theme } from '@static/theme'
import MarketIdLabel from '@components/NewPosition/MarketIdLabel/MarketIdLabel'
import { VariantType } from 'notistack'
import Refresher from '@components/Refresher/Refresher'
import { REFRESHER_INTERVAL } from '@store/consts/static'
import { useEffect, useState } from 'react'
import { TooltipGradient } from '@components/TooltipHover/TooltipGradient'

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
  copyPoolAddressHandler
}: Props) => {
  const { classes } = useStyles()

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

  const closeButton = (
    <TooltipHover
      title={
        isLocked
          ? 'Closing positions is disabled when position is locked'
          : hasEnoughETH
            ? hasFees
              ? 'Unclaimed fees will be returned when closing the position'
              : ''
            : 'Insufficient ETH to close position'
      }>
      <Button
        className={classes.closeButton}
        disabled={isLocked || !hasEnoughETH}
        variant='contained'
        onClick={() => onClosePositionClick()}>
        Close position
      </Button>
    </TooltipHover>
  )

  const addButton = (
    <TooltipHover title='Add more liquidity to this pool'>
      <Button
        className={classes.addButton}
        variant='contained'
        onClick={() => onAddPositionClick()}>
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
          <img className={classes.explorerLink} src={icons.newTab} alt='Explorer link' />
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

  const lockButton = !isLocked ? (
    <TooltipHover title='Lock liquidity'>
      <Button
        className={classes.lockButton}
        disabled={isLocked}
        variant='contained'
        onClick={() => onLockClick()}>
        <img src={icons.lock} alt='Lock' />
      </Button>
    </TooltipHover>
  ) : (
    <TooltipHover title='Unlocking liquidity is forbidden'>
      <Button disabled className={classes.lockButton} variant='contained' onClick={() => {}}>
        <img src={icons.unlock} alt='Unlock' />
      </Button>
    </TooltipHover>
  )

  return (
    <Box className={classes.headerContainer}>
      <Box className={classes.navigation}>
        <Box
          className={classNames(classes.wrapper, classes.backContainer)}
          onClick={() => onGoBackClick()}>
          <img src={icons.backArrow} alt='Back arrow' />
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
                  src={icons.reverseTokens}
                  alt='Reverse tokens'
                  onClick={() => onReverseTokensClick()}
                />
              </TooltipHover>
              <img className={classes.icon} src={tokenB.icon} alt={tokenB.ticker} />
            </Box>
            <Typography className={classes.tickerContainer}>
              {tokenA.ticker} - {tokenB.ticker}
            </Typography>
            <TooltipHover title='This pool distributes points'>
              <img
                className={classNames(classes.airdropIcon, {
                  [classes.airdropIconInActive]: !isPromoted
                })}
                src={icons.airdropRainbow}
                alt='Points'
              />
            </TooltipHover>
          </Box>
          <Box className={classes.wrapper}>
            <TooltipGradient
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
              top={3}
              noGradient>
              <Box className={classes.feeContainer}>{fee.toFixed(2)}%</Box>
            </TooltipGradient>
            {!isSmDown && closeButton}
            {!isSmDown && isMdDown && (
              <>
                {lockButton} {addButton}
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
                  {refresher} {lockButton} {addButton}
                </Box>
              </>
            ) : (
              <>
                {closeButton}
                {lockButton}
                {addButton}
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
