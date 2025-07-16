import { Box, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import { useStyles } from './style'
import { PopularPoolData } from '@containers/PopularPoolsWrapper/PopularPoolsWrapper'
import GradientBorder from '@common/GradientBorder/GradientBorder'
import { colors, theme } from '@static/theme'
import cardBackgroundBottom from '@static/png/cardBackground1.png'
import cardBackgroundTop from '@static/png/cardBackground2.png'
import {
  airdropRainbowIcon,
  backIcon,
  hornsETH,
  hornsUSDC,
  unknownTokenIcon,
  warningIcon
} from '@static/icons'
import cardESTop from '@static/png/ESWavesTop.png'
import cardESBottom from '@static/png/ESWavesBottom.png'
import Horn from '@static/png/turboHorn.png'
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
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ES_ETH_POOLS,
  ES_MAIN,
  NetworkType,
  POOLS_TO_HIDE_POINTS_PER_24H,
  USDC_MAIN,
  WETH_MAIN
} from '@store/consts/static'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BN } from '@coral-xyz/anchor'
import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'
import { Button } from '@common/Button/Button'
import { ReverseTokensIcon } from '@static/componentIcon/ReverseTokensIcon'
import { actions } from '@store/reducers/navigation'
import { PublicKey } from '@solana/web3.js'

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
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const airdropIconRef = useRef<HTMLDivElement>(null)
  const popoverContainerRef = useRef<HTMLDivElement>(null)

  const flipHorns = poolAddress?.equals(new PublicKey(ES_ETH_POOLS['0_03'])) ?? false

  const { classes } = useStyles({ flipHorns })
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
    dispatch(actions.setNavigation({ address: location.pathname }))

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
  const ESToken = useMemo(() => {
    if (addressFrom === ES_MAIN.address.toString() || addressTo === ES_MAIN.address.toString())
      return true
  }, [symbolFrom, symbolTo])

  const isUSDC = useMemo(() => {
    return (
      addressFrom === USDC_MAIN.address.toString() || addressTo === USDC_MAIN.address.toString()
    )
  }, [addressFrom, addressTo])
  const isETH = useMemo(() => {
    return (
      addressFrom === WETH_MAIN.address.toString() || addressTo === WETH_MAIN.address.toString()
    )
  }, [addressFrom, addressTo])

  const horns = useMemo(() => {
    if (isETH) return hornsETH
    if (isUSDC) return hornsUSDC
    return Horn
  }, [isETH, isUSDC])

  return (
    <Grid className={classes.root}>
      {ESToken && !isLoading && <img className={classes.horn} src={horns} />}

      {isLoading || !poolAddress?.toString() ? (
        <Skeleton variant='rounded' animation='wave' className={classes.skeleton} />
      ) : (
        <Grid>
          <GradientBorder
            borderRadius={24}
            borderWidth={2}
            borderColor={
              ESToken
                ? colors.invariant.esToken
                : `linear-gradient(to bottom, ${colors.invariant.green}, ${colors.invariant.pink})`
            }
            backgroundColor={colors.invariant.newDark}
            innerClassName={classes.container}>
            <img
              src={ESToken ? cardESTop : cardBackgroundTop}
              alt=''
              className={classes.backgroundImage}
              style={{ top: 0, zIndex: -1 }}
            />
            <img
              src={ESToken ? cardESBottom : cardBackgroundBottom}
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
                      e.currentTarget.src = unknownTokenIcon
                    }}
                  />
                  {isUnknownFrom && <img className={classes.warningIcon} src={warningIcon} />}
                </Box>
                <ReverseTokensIcon className={classes.swapIcon} />
                <Box className={classes.iconContainer}>
                  <img
                    className={classes.tokenIcon}
                    src={iconTo}
                    alt='Token to'
                    onError={e => {
                      e.currentTarget.src = unknownTokenIcon
                    }}
                  />
                  {isUnknownTo && <img className={classes.warningIcon} src={warningIcon} />}
                </Box>
              </Grid>

              <Box className={classes.symbolsContainer}>
                {shortenAddress(symbolFrom ?? '')} - {shortenAddress(symbolTo ?? '')}{' '}
                {isPromoted && (
                  <>
                    <PromotedPoolPopover
                      apr={convertedApr ?? 0}
                      apy={convertedApy ?? 0}
                      points={
                        POOLS_TO_HIDE_POINTS_PER_24H.includes(poolAddress.toString())
                          ? new BN(0)
                          : new BN(pointsPerSecond, 'hex').muln(24).muln(60).muln(60)
                      }>
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
                          src={airdropRainbowIcon}
                          alt={'Airdrop'}
                          style={{ height: '24px', position: 'absolute', right: -24 }}
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
                    value={`${convertedApy > 1000 ? '>1000%' : Math.abs(convertedApy).toFixed(2) + '%'}`}
                  />
                )}
                <StatsLabel title='Fee' value={fee + '%'} />
                {TVL !== undefined && (
                  <StatsLabel title='TVL' value={`$${formatNumberWithSuffix(TVL)}`} />
                )}
                {
                  <StatsLabel
                    title='Volume'
                    value={volume !== undefined ? `$${formatNumberWithSuffix(volume)}` : '$0'}
                  />
                }
              </Grid>
              <Grid container className={classes.footerWrapper}>
                <Grid className={classes.back} container item onClick={handleOpenSwap}>
                  <img className={classes.backIcon} src={backIcon} alt='Back' />
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
