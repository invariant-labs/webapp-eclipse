import { Grid, Hidden, Tooltip, Typography, useMediaQuery } from '@mui/material'
import SwapList from '@static/svg/swap-list.svg'
import { theme } from '@static/theme'
import { formatNumber } from '@utils/utils'
import classNames from 'classnames'
import { useMemo, useState } from 'react'
import { useStyles } from './style'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { initialXtoY, tickerToAddress } from '@utils/utils'
import { NetworkType } from '@store/consts/static'
import lockIcon from '@static/svg/lock.svg'
import unlockIcon from '@static/svg/unlock.svg'

export interface IPositionItem {
  tokenXName: string
  tokenYName: string
  tokenXIcon: string
  tokenYIcon: string
  tokenXLiq: number
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
}

export const PositionItem: React.FC<IPositionItem> = ({
  tokenXName,
  tokenYName,
  tokenXIcon,
  tokenYIcon,
  fee,
  min,
  max,
  valueX,
  valueY,
  isActive = false,
  currentPrice,
  tokenXLiq,
  tokenYLiq,
  network,
  isFullRange,
  isLocked
}) => {
  const { classes } = useStyles()

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

        <Hidden mdUp>{feeFragment}</Hidden>
      </Grid>

      <Grid container item className={classes.mdInfo} direction='row'>
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
