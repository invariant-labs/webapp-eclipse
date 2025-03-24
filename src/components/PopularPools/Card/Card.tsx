import { Box, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import { useStyles } from './style'
import { PopularPoolData } from '@containers/PopularPoolsWrapper/PopularPoolsWrapper'
import GradientBorder from '@common/GradientBorder/GradientBorder'
import { colors, theme } from '@static/theme'
import cardBackgroundBottom from '@static/png/cardBackground1.png'
import cardBackgroundTop from '@static/png/cardBackground2.png'
import icons from '@static/icons'

import { shortenAddress } from '@utils/uiUtils'
import StatsLabel from './StatsLabel/StatsLabel'
import {
  addressToTicker,
  calculateAPYAndAPR,
  formatNumberWithSuffix,
  initialXtoY,
  parseFeeToPathFee,
  ROUTES
} from '@utils/utils'
import { useNavigate } from 'react-router-dom'
import { NetworkType } from '@store/consts/static'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { useSelector } from 'react-redux'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BN } from '@coral-xyz/anchor'
import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'
import { Button } from '@common/Button/Button'

export interface ICard extends PopularPoolData {
  isLoading: boolean
  network: NetworkType
  showAPY: boolean
}

const Card: React.FC<ICard> = ({
  addressFrom,
  addressTo,
  TVL,
  apy,
  // apyData,
  poolAddress,
  isLoading,
  isUnknownFrom,
  fee,
  iconFrom,
  iconTo,
  isUnknownTo,
  symbolFrom,
  symbolTo,
  volume,
  network,
  showAPY
}) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  const airdropIconRef = useRef<HTMLDivElement>(null)
  const popoverContainerRef = useRef<HTMLDivElement>(null)

  const [isPromotedPoolPopoverOpen, setIsPromotedPoolPopoverOpen] = useState(false)
  const { promotedPools } = useSelector(leaderboardSelectors.config)

  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  const { isPromoted, pointsPerSecond } = useMemo(() => {
    if (!poolAddress) return { isPromoted: false, pointsPerSecond: '00' }
    const promotedPool = promotedPools.find(pool => pool.address === poolAddress.toString())
    if (!promotedPool) return { isPromoted: false, pointsPerSecond: '00' }
    return { isPromoted: true, pointsPerSecond: promotedPool.pointsPerSecond }
  }, [promotedPools, poolAddress])

  const isXtoY = initialXtoY(addressFrom ?? '', addressTo ?? '')
  const tokenA = isXtoY
    ? addressToTicker(network, addressFrom ?? '')
    : addressToTicker(network, addressTo ?? '')
  const tokenB = isXtoY
    ? addressToTicker(network, addressTo ?? '')
    : addressToTicker(network, addressFrom ?? '')

  const handleOpenPosition = () => {
    if (fee === undefined) return

    navigate(
      ROUTES.getNewPositionRoute(
        tokenA,
        tokenB,
        parseFeeToPathFee(Math.round(fee * 10 ** (DECIMAL - 2)))
      ),
      { state: { referer: 'liquidity' } }
    )
  }

  const handleOpenSwap = () => {
    navigate(ROUTES.getExchangeRoute(tokenA, tokenB), { state: { referer: 'liquidity' } })
  }

  //HOTFIX
  const { convertedApy, convertedApr } = calculateAPYAndAPR(
    apy ?? 0,
    poolAddress?.toString(),
    volume,
    fee,
    TVL
  )

  useEffect(() => {
    if (!isPromotedPoolPopoverOpen) return

    const handleDocumentClickCapture = (event: MouseEvent) => {
      if (
        (airdropIconRef.current && airdropIconRef.current.contains(event.target as Node)) ||
        (popoverContainerRef.current && popoverContainerRef.current.contains(event.target as Node))
      ) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      setIsPromotedPoolPopoverOpen(false)
    }

    document.addEventListener('click', handleDocumentClickCapture, true)
    return () => {
      document.removeEventListener('click', handleDocumentClickCapture, true)
    }
  }, [isPromotedPoolPopoverOpen])

  return (
    <Grid className={classes.root}>
      {isLoading ? (
        <Skeleton variant='rounded' animation='wave' className={classes.skeleton} />
      ) : (
        <Grid>
          <GradientBorder
            borderRadius={24}
            borderWidth={2}
            backgroundColor={colors.invariant.newDark}
            innerClassName={classes.container}>
            <img
              src={cardBackgroundTop}
              alt=''
              className={classes.backgroundImage}
              style={{ top: 0, zIndex: -1 }}
            />
            <img
              src={cardBackgroundBottom}
              alt=''
              className={classes.backgroundImage}
              style={{ bottom: 0, zIndex: -1 }}
            />
            <Grid container className={classes.cardWrapper}>
              <Grid container className={classes.iconsWrapper}>
                <Box className={classes.iconContainer}>
                  <img
                    className={classes.tokenIcon}
                    src={iconFrom}
                    alt='Token from'
                    onError={e => {
                      e.currentTarget.src = icons.unknownToken
                    }}
                  />
                  {isUnknownFrom && <img className={classes.warningIcon} src={icons.warningIcon} />}
                </Box>
                <img className={classes.swapIcon} src={icons.RevertIcon} alt='Token from' />
                <Box className={classes.iconContainer}>
                  <img
                    className={classes.tokenIcon}
                    src={iconTo}
                    alt='Token to'
                    onError={e => {
                      e.currentTarget.src = icons.unknownToken
                    }}
                  />
                  {isUnknownTo && <img className={classes.warningIcon} src={icons.warningIcon} />}
                </Box>
              </Grid>

              <Box className={classes.symbolsContainer}>
                {shortenAddress(symbolFrom ?? '')} - {shortenAddress(symbolTo ?? '')}{' '}
                {isPromoted && (
                  <>
                    <PromotedPoolPopover
                      apr={convertedApr ?? 0}
                      apy={convertedApy ?? 0}
                      points={new BN(pointsPerSecond, 'hex').muln(24).muln(60).muln(60)}>
                      <div
                        className={classes.actionButton}
                        onPointerEnter={() => {
                          if (!isMobile) {
                            setIsPromotedPoolPopoverOpen(true)
                          }
                        }}
                        onPointerLeave={() => {
                          if (!isMobile) {
                            setIsPromotedPoolPopoverOpen(false)
                          }
                        }}
                        onClick={() => {
                          if (isMobile) {
                            setIsPromotedPoolPopoverOpen(!isPromotedPoolPopoverOpen)
                          }
                        }}>
                        <img
                          src={icons.airdropRainbow}
                          alt={'Airdrop'}
                          style={{ height: '24px' }}
                        />
                      </div>
                    </PromotedPoolPopover>
                  </>
                )}
              </Box>
              <Grid container gap='8px'>
                {apy !== undefined && showAPY && (
                  <StatsLabel
                    title='APY'
                    value={`${convertedApy > 1000 ? '>1000%' : convertedApy === 0 ? '-' : Math.abs(convertedApy).toFixed(2) + '%'}`}
                  />
                )}
                <StatsLabel title='Fee' value={fee + '%'} />
                {TVL !== undefined && (
                  <StatsLabel title='TVL' value={`$${formatNumberWithSuffix(TVL)}`} />
                )}
                {volume !== undefined && (
                  <StatsLabel title='Volume' value={`$${formatNumberWithSuffix(volume)}`} />
                )}
              </Grid>
              <Grid container className={classes.footerWrapper}>
                <Grid className={classes.back} container item onClick={handleOpenSwap}>
                  <img className={classes.backIcon} src={icons.backIcon} alt='Back' />
                  <Typography className={classes.backText}>Swap</Typography>
                </Grid>
                <Button
                  scheme='pink'
                  height={32}
                  borderRadius={8}
                  padding='0 25px'
                  onClick={handleOpenPosition}>
                  Deposit
                </Button>
              </Grid>
            </Grid>
          </GradientBorder>
        </Grid>
      )}
    </Grid>
  )
}

export default Card
