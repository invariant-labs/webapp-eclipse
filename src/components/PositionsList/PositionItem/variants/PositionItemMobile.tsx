import { Box, Grid, Tooltip, Typography, useMediaQuery } from '@mui/material'
import SwapList from '@static/svg/swap-list.svg'
import { theme } from '@static/theme'
import { formatNumber } from '@utils/utils'
import classNames from 'classnames'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMobileStyles } from './style/mobile'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { initialXtoY, tickerToAddress } from '@utils/utils'
import lockIcon from '@static/svg/lock.svg'
import unlockIcon from '@static/svg/unlock.svg'
import icons from '@static/icons'
import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'
import { BN } from '@coral-xyz/anchor'
import { usePromotedPool } from '../hooks/usePromotedPool'
import { calculatePercentageRatio } from '../utils/calculations'
import { IPositionItem } from '@components/PositionsList/types'
import { useSharedStyles } from './style/shared'
import { InactivePoolsPopover } from '../components/InactivePoolsPopover/InactivePoolsPopover'
import { NetworkType } from '@store/consts/static'
import { network as currentNetwork } from '@store/selectors/solanaConnection'
import { useSelector } from 'react-redux'

interface IPositionItemMobile extends IPositionItem {
  setAllowPropagation: React.Dispatch<React.SetStateAction<boolean>>
}

export const PositionItemMobile: React.FC<IPositionItemMobile> = ({
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
  setAllowPropagation,
  // liquidity,
  poolData,
  isActive = false,
  currentPrice,
  tokenXLiq,
  tokenYLiq,
  network,
  isFullRange,
  isLocked
}) => {
  const { classes } = useMobileStyles()
  const { classes: sharedClasses } = useSharedStyles()
  const airdropIconRef = useRef<any>(null)
  const [isPromotedPoolPopoverOpen, setIsPromotedPoolPopoverOpen] = useState(false)
  const [isPromotedPoolInactive, setIsPromotedPoolInactive] = useState(false)
  const isXs = useMediaQuery(theme.breakpoints.down('xs'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const networkSelector = useSelector(currentNetwork)

  const [xToY, setXToY] = useState<boolean>(
    initialXtoY(tickerToAddress(network, tokenXName), tickerToAddress(network, tokenYName))
  )

  const { tokenXPercentage, tokenYPercentage } = calculatePercentageRatio(
    tokenXLiq,
    tokenYLiq,
    currentPrice,
    xToY
  )

  const { isPromoted, pointsPerSecond, estimated24hPoints } = usePromotedPool(
    poolAddress,
    position,
    poolData
  )

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
          tooltip: sharedClasses.tooltip
        }}>
        <Grid
          container
          item
          className={classNames(sharedClasses.fee, isActive ? sharedClasses.activeFee : undefined)}
          justifyContent='center'
          alignItems='center'>
          <Typography
            className={classNames(
              sharedClasses.infoText,
              isActive ? sharedClasses.activeInfoText : undefined
            )}>
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
        className={sharedClasses.value}
        justifyContent='space-between'
        alignItems='center'
        wrap='nowrap'>
        <Typography className={classNames(sharedClasses.infoText, sharedClasses.label)}>
          Value
        </Typography>
        <Grid className={sharedClasses.infoCenter} container item justifyContent='center'>
          <Typography className={sharedClasses.greenText}>
            {formatNumber(xToY ? valueX : valueY)} {xToY ? tokenXName : tokenYName}
          </Typography>
        </Grid>
      </Grid>
    ),
    [valueX, valueY, tokenXName, classes, isXs, isDesktop, tokenYName, xToY]
  )

  const handleInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    event.stopPropagation()

    if (event.type === 'touchstart') {
      setIsPromotedPoolPopoverOpen(!isPromotedPoolPopoverOpen)
      setAllowPropagation(false)
    }
  }
  useEffect(() => {
    const PROPAGATION_ALLOW_TIME = 500

    const handleClickOutside = (event: TouchEvent | MouseEvent) => {
      if (
        airdropIconRef.current &&
        !(airdropIconRef.current as HTMLElement).contains(event.target as Node) &&
        !document.querySelector('.promoted-pool-popover')?.contains(event.target as Node) &&
        !document.querySelector('.promoted-pool-inactive-popover')?.contains(event.target as Node)
      ) {
        setIsPromotedPoolPopoverOpen(false)
        setIsPromotedPoolInactive(false)
        setTimeout(() => {
          setAllowPropagation(true)
        }, PROPAGATION_ALLOW_TIME)
      }
    }

    if (isPromotedPoolPopoverOpen || isPromotedPoolInactive) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isPromotedPoolPopoverOpen, isPromotedPoolInactive])

  const promotedIconFragment = useMemo(() => {
    if (isPromoted && isActive) {
      return (
        <>
          <div
            className={classes.actionButton}
            onClick={handleInteraction}
            onPointerEnter={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                setIsPromotedPoolPopoverOpen(true)
              }
            }}
            onPointerLeave={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                setIsPromotedPoolPopoverOpen(false)
              }
            }}
            onTouchStart={handleInteraction}>
            <img src={icons.airdropRainbow} alt={'Airdrop'} style={{ height: '32px' }} />
          </div>
          <PromotedPoolPopover
            showEstPointsFirst
            isActive={isActive}
            anchorEl={airdropIconRef.current}
            open={isPromotedPoolPopoverOpen}
            onClose={() => {
              setIsPromotedPoolPopoverOpen(false)
            }}
            headerText={
              <>
                This position is currently <b>earning points</b>
              </>
            }
            pointsLabel={'Total points distributed across the pool per 24H:'}
            estPoints={estimated24hPoints}
            points={new BN(pointsPerSecond, 'hex').muln(24).muln(60).muln(60)}
          />
        </>
      )
    }

    return (
      <>
        <InactivePoolsPopover
          anchorEl={airdropIconRef.current}
          open={isPromotedPoolInactive}
          onClose={() => {
            setIsPromotedPoolInactive(false)
          }}
          isActive={isActive}
          isPromoted={isPromoted}
        />

        <div
          className={classes.actionButton}
          onClick={event => {
            event.stopPropagation()

            if (event.type === 'touchstart') {
              setIsPromotedPoolInactive(!isPromotedPoolInactive)
            }
          }}
          onPointerEnter={() => {
            if (window.matchMedia('(hover: hover)').matches) {
              setIsPromotedPoolInactive(true)
            }
          }}
          onPointerLeave={() => {
            if (window.matchMedia('(hover: hover)').matches) {
              setIsPromotedPoolInactive(false)
            }
          }}
          onTouchStart={event => {
            event.stopPropagation()

            if (event.type === 'touchstart') {
              setIsPromotedPoolInactive(!isPromotedPoolInactive)
              setAllowPropagation(false)
            }
          }}>
          <img
            src={icons.airdropRainbow}
            alt={'Airdrop'}
            style={{
              height: '32px',
              opacity: 0.3,
              filter: 'grayscale(1)'
            }}
          />
        </div>
      </>
    )
  }, [
    isPromoted,
    isActive,
    isPromotedPoolPopoverOpen,
    isPromotedPoolInactive,
    classes.actionButton,
    handleInteraction,
    airdropIconRef,
    estimated24hPoints,
    pointsPerSecond,
    setIsPromotedPoolPopoverOpen,
    setIsPromotedPoolInactive,
    setAllowPropagation
  ])
  return (
    <Grid
      className={classes.root}
      container
      direction='row'
      alignItems='center'
      justifyContent='space-between'>
      <Grid container item className={classes.mdTop} direction='row' wrap='nowrap'>
        <Grid
          container
          item
          className={classes.iconsAndNames}
          alignItems='center'
          wrap='nowrap'
          sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Grid
              container
              item
              className={sharedClasses.icons}
              alignItems='center'
              wrap='nowrap'
              sx={{ width: '100%' }}>
              <img
                className={sharedClasses.tokenIcon}
                src={xToY ? tokenXIcon : tokenYIcon}
                alt={xToY ? tokenXName : tokenYName}
              />
              <TooltipHover text='Reverse tokens'>
                <img
                  className={sharedClasses.arrows}
                  src={SwapList}
                  alt='Arrow'
                  onClick={e => {
                    e.stopPropagation()
                    setXToY(!xToY)
                  }}
                />
              </TooltipHover>
              <img
                className={sharedClasses.tokenIcon}
                src={xToY ? tokenYIcon : tokenXIcon}
                alt={xToY ? tokenYName : tokenXName}
              />
            </Grid>

            <Typography className={sharedClasses.names}>
              {xToY ? tokenXName : tokenYName} - {xToY ? tokenYName : tokenXName}
            </Typography>
          </Box>

          <Box>
            {networkSelector === NetworkType.Mainnet && (
              <Box
                ref={airdropIconRef}
                sx={{
                  marginLeft: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                {promotedIconFragment}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
      <Grid sx={{ width: '100%' }}>
        <Grid
          container
          item
          className={sharedClasses.liquidity}
          sx={{ marginTop: '13px' }}
          justifyContent='center'
          alignItems='center'>
          <Typography className={sharedClasses.infoText}>
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
      </Grid>
      <Grid container item className={classes.mdInfo} direction='row'>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            marginTop: '8px'
          }}>
          <Box sx={{ width: '50%' }}>
            {feeFragment}

            {/* <Hidden mdDown>{feeFragment}</Hidden> */}
          </Box>
          <Box sx={{ width: '50%' }}>{valueFragment}</Box>
        </Box>

        <Grid
          container
          item
          className={classes.minMax}
          justifyContent='space-between'
          alignItems='center'
          wrap='nowrap'>
          <>
            <Typography className={classNames(sharedClasses.greenText, sharedClasses.label)}>
              MIN - MAX
            </Typography>
            <Grid className={sharedClasses.infoCenter} container item justifyContent='center'>
              {isFullRange ? (
                <Typography className={sharedClasses.infoText}>FULL RANGE</Typography>
              ) : (
                <Typography className={sharedClasses.infoText}>
                  {formatNumber(xToY ? min : 1 / max)} - {formatNumber(xToY ? max : 1 / min)}{' '}
                  {xToY ? tokenYName : tokenXName} per {xToY ? tokenXName : tokenYName}
                </Typography>
              )}
            </Grid>
          </>
        </Grid>

        {isLocked && (
          <Grid
            container
            item
            className={classNames(
              sharedClasses.dropdown,
              isLocked ? sharedClasses.dropdownLocked : undefined
            )}
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
