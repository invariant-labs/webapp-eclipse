import { Box, Button, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import { useStyles } from './style'
import { PopularPoolData } from '@containers/PopularPoolsWrapper/PopularPoolsWrapper'
import GradientBorder from '@components/GradientBorder/GradientBorder'
import { colors, theme } from '@static/theme'
import cardBackgroundBottom from '@static/png/cardBackground1.png'
import cardBackgroundTop from '@static/png/cardBackground2.png'
import icons from '@static/icons'
import RevertIcon from '@static/svg/revert.svg'
import { shortenAddress } from '@utils/uiUtils'
import StatsLabel from './StatsLabel/StatsLabel'
import backIcon from '@static/svg/back-arrow-2.svg'
import {
  addressToTicker,
  calculateAPYAndAPR,
  formatNumber,
  initialXtoY,
  parseFeeToPathFee
} from '@utils/utils'
import { useNavigate } from 'react-router-dom'
import { NetworkType } from '@store/consts/static'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { useSelector } from 'react-redux'
import { useMemo, useRef, useState } from 'react'
import { BN } from '@coral-xyz/anchor'
import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'

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
  const airdropIconRef = useRef<any>(null)

  const [isPromotedPoolPopoverOpen, setIsPromotedPoolPopoverOpen] = useState(false)
  const { promotedPools } = useSelector(leaderboardSelectors.config)

  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  const { isPromoted, pointsPerSecond } = useMemo(() => {
    if (!poolAddress) return { isPromoted: false, pointsPerSecond: '00' }
    const promotedPool = promotedPools.find(pool => pool.address === poolAddress.toString())
    if (!promotedPool) return { isPromoted: false, pointsPerSecond: '00' }
    return { isPromoted: true, pointsPerSecond: promotedPool.pointsPerSecond }
  }, [promotedPools, poolAddress])

  const handleOpenPosition = () => {
    if (fee === undefined) return

    const isXtoY = initialXtoY(addressFrom ?? '', addressTo ?? '')

    const tokenA = isXtoY
      ? addressToTicker(network, addressFrom ?? '')
      : addressToTicker(network, addressTo ?? '')
    const tokenB = isXtoY
      ? addressToTicker(network, addressTo ?? '')
      : addressToTicker(network, addressFrom ?? '')

    navigate(
      `/newPosition/${tokenA}/${tokenB}/${parseFeeToPathFee(Math.round(fee * 10 ** (DECIMAL - 2)))}`,
      { state: { referer: 'liquidity' } }
    )
  }

  const handleOpenSwap = () => {
    navigate(
      `/exchange/${addressToTicker(network, addressFrom ?? '')}/${addressToTicker(network, addressTo ?? '')}`,
      { state: { referer: 'liquidity' } }
    )
  }

  //HOTFIX
  const { convertedApy, convertedApr } = calculateAPYAndAPR(
    apy ?? 0,
    poolAddress?.toString(),
    volume,
    fee,
    TVL
  )

  return (
    <Grid className={classes.root}>
      {isLoading ? (
        <Skeleton
          variant='rounded'
          animation='wave'
          width={220}
          height={344}
          style={{ opacity: 0.7, borderRadius: 24 }}
        />
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
            <Grid container p={'20px'} alignItems='center' flexDirection='column'>
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
                <img className={classes.swapIcon} src={RevertIcon} alt='Token from' />
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

              <Typography className={classes.symbolsContainer}>
                {shortenAddress(symbolFrom ?? '')} - {shortenAddress(symbolTo ?? '')}{' '}
                {isPromoted && (
                  <>
                    <div
                      ref={airdropIconRef}
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
                      <img src={icons.airdropRainbow} alt={'Airdrop'} style={{ height: '24px' }} />
                    </div>
                    <PromotedPoolPopover
                      anchorEl={airdropIconRef.current}
                      open={isPromotedPoolPopoverOpen}
                      onClose={() => {
                        setIsPromotedPoolPopoverOpen(false)
                      }}
                      apr={convertedApr ?? 0}
                      apy={convertedApy ?? 0}
                      points={new BN(pointsPerSecond, 'hex').muln(24).muln(60).muln(60)}
                    />
                  </>
                )}
              </Typography>
              <Grid container gap='8px'>
                {apy !== undefined && showAPY && (
                  <StatsLabel
                    title='APY'
                    value={`${convertedApy > 1000 ? '>1000%' : convertedApy === 0 ? '-' : Math.abs(convertedApy).toFixed(2) + '%'}`}
                  />
                )}
                <StatsLabel title='Fee' value={fee + '%'} />
                {TVL !== undefined && <StatsLabel title='TVL' value={`$${formatNumber(TVL)}`} />}
                {volume !== undefined && (
                  <StatsLabel title='Volume' value={`$${formatNumber(volume)}`} />
                )}
              </Grid>
              <Grid container justifyContent='space-between' alignItems='center' mt='auto'>
                <Grid
                  className={classes.back}
                  container
                  item
                  alignItems='center'
                  onClick={handleOpenSwap}>
                  <img className={classes.backIcon} src={backIcon} alt='Back' />
                  <Typography className={classes.backText}>Swap</Typography>
                </Grid>
                <Button className={classes.button} variant='contained' onClick={handleOpenPosition}>
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
