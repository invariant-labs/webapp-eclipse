import { Box, Grid, Hidden, Tooltip, Typography, useMediaQuery } from '@mui/material'
import SwapList from '@static/svg/swap-list.svg'
import { theme } from '@static/theme'
import { formatNumber } from '@utils/utils'
import classNames from 'classnames'
import { useMemo, useRef, useState } from 'react'
import { useDesktopStyles } from './style/desktop'
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
import PositionStatusTooltip from '../components/PositionStatusTooltip'

export const PositionItemDesktop: React.FC<IPositionItem> = ({
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
  const { classes } = useDesktopStyles()
  const { classes: sharedClasses } = useSharedStyles()
  const airdropIconRef = useRef<any>(null)
  const [isPromotedPoolPopoverOpen, setIsPromotedPoolPopoverOpen] = useState(false)

  const isXs = useMediaQuery(theme.breakpoints.down('xs'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

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
          sx={{ width: 90 }}
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
        sx={{
          width: 160,
          [theme.breakpoints.down(1029)]: {
            marginRight: 0
          },
          [theme.breakpoints.down('sm')]: {
            width: 144,
            paddingInline: 6
          }
        }}
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

  const PromotedIcon = () =>
    isPromoted && isActive ? (
      <>
        <div
          onClick={e => e.stopPropagation()}
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
          showEstPointsFirst
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
    ) : (
      <>
        <Tooltip
          enterTouchDelay={0}
          leaveTouchDelay={Number.MAX_SAFE_INTEGER}
          onClick={e => e.stopPropagation()}
          title={
            <>
              <PositionStatusTooltip isActive={isActive} isPromoted={isPromoted} />
            </>
          }
          placement='top'
          classes={{
            tooltip: sharedClasses.tooltip
          }}>
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
        </Tooltip>
      </>
    )

  return (
    <Grid
      className={classes.root}
      container
      direction='row'
      alignItems='center'
      justifyContent='space-between'>
      <Grid container item className={classes.mdTop} direction='row' wrap='nowrap'>
        <Grid container item className={classes.iconsAndNames} alignItems='center' wrap='nowrap'>
          <Grid container item className={sharedClasses.icons} alignItems='center' wrap='nowrap'>
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
        </Grid>
      </Grid>

      <Grid
        container
        item
        className={classes.mdInfo}
        sx={{
          width: 'fit-content',
          flexWrap: 'nowrap',
          [theme.breakpoints.down('lg')]: {
            flexWrap: 'nowrap',
            marginTop: 16,
            width: '100%'
          },
          [theme.breakpoints.down(1029)]: {
            flexWrap: 'wrap'
          }
        }}
        direction='row'>
        <Box sx={{ display: 'flex', alignItems: 'center' }} ref={airdropIconRef}>
          <PromotedIcon />
        </Box>
        <Hidden mdDown>{feeFragment}</Hidden>
        <Grid
          container
          item
          className={sharedClasses.liquidity}
          sx={{ width: 170 }}
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

        <Hidden mdDown>{valueFragment}</Hidden>

        {isLocked && (
          <Grid
            container
            item
            sx={{
              width: 57,
              [theme.breakpoints.down(1029)]: {
                width: '100%',
                marginRight: 0,
                marginTop: 8
              }
            }}
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
