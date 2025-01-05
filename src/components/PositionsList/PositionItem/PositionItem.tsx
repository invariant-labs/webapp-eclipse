import { Box, Grid, Hidden, Tooltip, Typography, useMediaQuery } from '@mui/material'
import SwapList from '@static/svg/swap-list.svg'
import { theme } from '@static/theme'
import { formatNumber } from '@utils/utils'
import classNames from 'classnames'
import { useMemo, useRef, useState } from 'react'
import { useStyles } from './style'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { initialXtoY, tickerToAddress } from '@utils/utils'
import { NetworkType } from '@store/consts/static'
import lockIcon from '@static/svg/lock.svg'
import unlockIcon from '@static/svg/unlock.svg'
import icons from '@static/icons'
import { PublicKey } from '@solana/web3.js'
import { useSelector } from 'react-redux'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'
import { BN } from '@coral-xyz/anchor'
import { estimatePointsForUserPositions } from '@invariant-labs/points-sdk'
import { PoolStructure, Position } from '@invariant-labs/sdk-eclipse/lib/market'
import { PoolWithAddressAndIndex } from '@store/selectors/positions'
import { LEADERBOARD_DECIMAL } from '@pages/LeaderboardPage/config'

export interface IPositionItem {
  tokenXName: string
  tokenYName: string
  tokenXIcon: string
  tokenYIcon: string
  tokenXLiq: number
  poolAddress: PublicKey
  position: Position
  tokenYLiq: number
  fee: number
  min: number
  max: number
  valueX: number
  valueY: number
  id: string
  address: string
  isActive?: boolean
  currentPrice: number
  network: NetworkType
  isFullRange: boolean
  isLocked: boolean
  poolData: PoolWithAddressAndIndex
  liquidity: BN
}

export const PositionItem: React.FC<IPositionItem> = ({
  tokenXName,
  tokenYName,
  tokenXIcon,
  poolAddress,
  tokenYIcon,
  fee,
  min,
  max,
  valueX,
  valueY,
  position,
  liquidity,
  poolData,
  isActive = false,
  currentPrice,
  tokenXLiq,
  tokenYLiq,
  network,
  isFullRange,
  isLocked
}) => {
  const { classes } = useStyles()
  const airdropIconRef = useRef<any>(null)

  const { promotedPools } = useSelector(leaderboardSelectors.config)
  const [isPromotedPoolPopoverOpen, setIsPromotedPoolPopoverOpen] = useState(false)

  const { isPromoted, pointsPerSecond } = useMemo(() => {
    if (!poolAddress) return { isPromoted: false, pointsPerSecond: '00' }
    const promotedPool = promotedPools.find(pool => pool.address === poolAddress.toString())

    if (!promotedPool) return { isPromoted: false, pointsPerSecond: '00' }
    return { isPromoted: true, pointsPerSecond: promotedPool.pointsPerSecond }
  }, [promotedPools, poolAddress])

  const isXs = useMediaQuery(theme.breakpoints.down('xs'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  const [xToY, setXToY] = useState<boolean>(
    initialXtoY(tickerToAddress(network, tokenXName), tickerToAddress(network, tokenYName))
  )

  const getPercentageRatio = () => {
    const firstTokenPercentage =
      ((tokenXLiq * currentPrice) / (tokenYLiq + tokenXLiq * currentPrice)) * 100

    const tokenXPercentageFloat = xToY ? firstTokenPercentage : 100 - firstTokenPercentage
    const tokenXPercentage =
      tokenXPercentageFloat > 50
        ? Math.floor(tokenXPercentageFloat)
        : Math.ceil(tokenXPercentageFloat)

    const tokenYPercentage = 100 - tokenXPercentage

    return { tokenXPercentage, tokenYPercentage }
  }

  const { tokenXPercentage, tokenYPercentage } = getPercentageRatio()

  const feeFragment = useMemo(
    () => (
      <Tooltip
        enterTouchDelay={0}
        leaveTouchDelay={Number.MAX_SAFE_INTEGER}
        onClick={e => e.stopPropagation()}
        title={
          isActive ? (
            <>
              The position is <b>active</b> and currently <b>earning a fee</b> as long as the
              current price is <b>within</b> the position's price range.
            </>
          ) : (
            <>
              The position is <b>inactive</b> and <b>not earning a fee</b> as long as the current
              price is <b>outside</b> the position's price range.
            </>
          )
        }
        placement='top'
        classes={{
          tooltip: classes.tooltip
        }}>
        <Grid
          container
          item
          className={classNames(classes.fee, isActive ? classes.activeFee : undefined)}
          justifyContent='center'
          alignItems='center'>
          <Typography
            className={classNames(classes.infoText, isActive ? classes.activeInfoText : undefined)}>
            {fee}% fee
          </Typography>
        </Grid>
      </Tooltip>
    ),
    [fee, classes, isActive]
  )

  const valueFragment = useMemo(
    () => (
      <Grid
        container
        item
        className={classes.value}
        justifyContent='space-between'
        alignItems='center'
        wrap='nowrap'>
        <Typography className={classNames(classes.infoText, classes.label)}>Value</Typography>
        <Grid className={classes.infoCenter} container item justifyContent='center'>
          <Typography className={classes.greenText}>
            {formatNumber(xToY ? valueX : valueY)} {xToY ? tokenXName : tokenYName}
          </Typography>
        </Grid>
      </Grid>
    ),
    [valueX, valueY, tokenXName, classes, isXs, isDesktop, tokenYName, xToY]
  )
  const estimation = useMemo(() => {
    if (!position || !promotedPools || !poolData) {
      return new BN(0)
    }

    try {
      const poolAddress = position.pool?.toString()
      if (!poolAddress) {
        return new BN(0)
      }

      const promotedPool = promotedPools.find(pool => pool.address === poolAddress)
      if (!promotedPool?.pointsPerSecond) {
        return new BN(0)
      }

      const pointsPerSecond = new BN(promotedPool.pointsPerSecond, 'hex').mul(
        new BN(10).pow(new BN(LEADERBOARD_DECIMAL))
      )

      return estimatePointsForUserPositions(
        [position] as Position[],
        poolData as PoolStructure,
        pointsPerSecond
      )
    } catch (error) {
      console.error('Error calculating estimation:', error)
      return new BN(0)
    }
  }, [position, promotedPools, poolData, liquidity, isPromotedPoolPopoverOpen])
  return (
    <Grid
      className={classes.root}
      container
      direction='row'
      alignItems='center'
      justifyContent='space-between'>
      <Grid container item className={classes.mdTop} direction='row' wrap='nowrap'>
        <Grid container item className={classes.iconsAndNames} alignItems='center' wrap='nowrap'>
          <Grid container item className={classes.icons} alignItems='center' wrap='nowrap'>
            <img
              className={classes.tokenIcon}
              src={xToY ? tokenXIcon : tokenYIcon}
              alt={xToY ? tokenXName : tokenYName}
            />
            <TooltipHover text='Reverse tokens'>
              <img
                className={classes.arrows}
                src={SwapList}
                alt='Arrow'
                onClick={e => {
                  e.stopPropagation()
                  setXToY(!xToY)
                }}
              />
            </TooltipHover>
            <img
              className={classes.tokenIcon}
              src={xToY ? tokenYIcon : tokenXIcon}
              alt={xToY ? tokenYName : tokenXName}
            />
          </Grid>

          <Typography className={classes.names}>
            {xToY ? tokenXName : tokenYName} - {xToY ? tokenYName : tokenXName}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item className={classes.mdInfo} direction='row'>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isPromoted && isActive ? (
            <>
              <div
                ref={airdropIconRef}
                className={classes.actionButton}
                onPointerLeave={() => {
                  setIsPromotedPoolPopoverOpen(false)
                }}
                onPointerEnter={() => {
                  setIsPromotedPoolPopoverOpen(true)
                }}>
                <img
                  src={icons.airdropRainbow}
                  alt={'Airdrop'}
                  style={{ height: '32px', marginRight: '16px' }}
                />
              </div>
              <PromotedPoolPopover
                anchorEl={airdropIconRef.current}
                open={isPromotedPoolPopoverOpen}
                onClose={() => {
                  setIsPromotedPoolPopoverOpen(false)
                }}
                estPoints={estimation}
                points={new BN(pointsPerSecond, 'hex').muln(24).muln(60).muln(60)}
              />
            </>
          ) : (
            <>
              <TooltipHover text='This position is not earning any points'>
                <img
                  src={icons.airdropRainbow}
                  alt={'Airdrop'}
                  style={{
                    height: '32px',
                    marginRight: '16px',
                    opacity: 0.3,
                    filter: 'grayscale(1)'
                  }}
                />
              </TooltipHover>
            </>
          )}
          <Hidden mdUp>{feeFragment}</Hidden>
        </Box>
        <Hidden mdDown>{feeFragment}</Hidden>
        <Grid
          container
          item
          className={classes.liquidity}
          justifyContent='center'
          alignItems='center'>
          <Typography className={classes.infoText}>
            {tokenXPercentage === 100 && (
              <span>
                {tokenXPercentage}
                {'%'} {xToY ? tokenXName : tokenYName}
              </span>
            )}
            {tokenYPercentage === 100 && (
              <span>
                {tokenYPercentage}
                {'%'} {xToY ? tokenYName : tokenXName}
              </span>
            )}

            {tokenYPercentage !== 100 && tokenXPercentage !== 100 && (
              <span>
                {tokenXPercentage}
                {'%'} {xToY ? tokenXName : tokenYName} {' - '} {tokenYPercentage}
                {'%'} {xToY ? tokenYName : tokenXName}
              </span>
            )}
          </Typography>
        </Grid>
        <Hidden mdUp>{valueFragment}</Hidden>

        <Grid
          container
          item
          className={classes.minMax}
          justifyContent='space-between'
          alignItems='center'
          wrap='nowrap'>
          <>
            <Typography className={classNames(classes.greenText, classes.label)}>
              MIN - MAX
            </Typography>
            <Grid className={classes.infoCenter} container item justifyContent='center'>
              {isFullRange ? (
                <Typography className={classes.infoText}>FULL RANGE</Typography>
              ) : (
                <Typography className={classes.infoText}>
                  {formatNumber(xToY ? min : 1 / max)} - {formatNumber(xToY ? max : 1 / min)}{' '}
                  {xToY ? tokenYName : tokenXName} per {xToY ? tokenXName : tokenYName}
                </Typography>
              )}
            </Grid>
          </>
        </Grid>

        <Hidden mdDown>{valueFragment}</Hidden>

        {isLocked && (
          <Grid
            container
            item
            className={classNames(classes.dropdown, isLocked ? classes.dropdownLocked : undefined)}
            justifyContent='center'
            alignItems='center'
            wrap='nowrap'>
            {isLocked ? (
              <TooltipHover text={'Liquidity locked'}>
                <img src={lockIcon} alt='Lock' />
              </TooltipHover>
            ) : (
              <TooltipHover text={'Liquidity not locked'}>
                <img src={unlockIcon} alt='Lock' />
              </TooltipHover>
            )}
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}
