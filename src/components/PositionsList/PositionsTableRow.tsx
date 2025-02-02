import {
  Grid,
  TableRow,
  TableCell,
  Button,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material'
import { useCallback, useMemo, useRef, useState } from 'react'
import { MinMaxChart } from './PositionItem/components/MinMaxChart/MinMaxChart'
import { IPositionItem } from './types'
import { makeStyles } from 'tss-react/mui'
import { colors, theme } from '@static/theme'
import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'
import { BN } from '@coral-xyz/anchor'
import icons from '@static/icons'
import { initialXtoY, tickerToAddress, formatNumber } from '@utils/utils'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { usePromotedPool } from './PositionItem/hooks/usePromotedPool'
import { calculatePercentageRatio } from './PositionItem/utils/calculations'
import { useSharedStyles } from './PositionItem/variants/style/shared'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import SwapList from '@static/svg/swap-list.svg'
import { network as currentNetwork } from '@store/selectors/solanaConnection'
import PositionStatusTooltip from './PositionItem/components/PositionStatusTooltip'

const useStyles = makeStyles()((theme: Theme) => ({
  bodyRow: {
    '&:nth-of-type(odd)': {
      background: colors.invariant.component,
      '&:hover': {
        background: `${colors.invariant.component}B0`
      }
    },
    '&:nth-of-type(even)': {
      background: `${colors.invariant.component}80`,
      '&:hover': {
        background: `${colors.invariant.component}90`
      }
    },
    '&:first-of-type td': {
      borderTop: `1px solid ${colors.invariant.light}`
    }
  },
  lastRow: {
    '& td:first-of-type': {
      borderBottomLeftRadius: '24px'
    },
    '& td:last-child': {
      borderBottomRightRadius: '24px'
    }
  },
  bodyCell: {
    background: 'inherit',
    textAlign: 'center',
    borderBottom: `1px solid ${colors.invariant.light} `
  },
  pairNameCell: {
    textAlign: 'left'
  },
  icons: {
    marginRight: 12,
    width: 'fit-content',
    [theme.breakpoints.down('lg')]: {
      marginRight: 12
    }
  },
  tokenIcon: {
    width: 40,
    borderRadius: '100%',
    [theme.breakpoints.down('sm')]: {
      width: 28
    }
  },
  arrows: {
    width: 36,
    marginLeft: 4,
    marginRight: 4,
    [theme.breakpoints.down('lg')]: {
      width: 30
    },
    [theme.breakpoints.down('sm')]: {
      width: 24
    },
    '&:hover': {
      filter: 'brightness(2)'
    }
  },
  names: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    color: colors.invariant.text,
    lineHeight: '40px',
    whiteSpace: 'nowrap',
    width: 180,
    [theme.breakpoints.down('lg')]: {
      lineHeight: '32px',
      width: 'unset'
    }
  },
  infoText: {
    color: colors.invariant.lightGrey,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  activeInfoText: {
    color: colors.invariant.black
  },
  greenText: {
    color: colors.invariant.green,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  fee: {
    background: colors.invariant.light,
    borderRadius: 11,
    height: 36,
    width: 65,
    marginRight: 8
  },
  activeFee: {
    background: colors.invariant.greenLinearGradient
  },
  tooltip: {
    color: colors.invariant.textGrey,
    lineHeight: '24px',
    background: colors.black.full,
    borderRadius: 12,
    fontSize: 14
  },
  actionButton: {
    display: 'inline-flex',
    position: 'relative'
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '36px',
    maxHeight: '36px',
    background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
    borderRadius: '16px',
    color: colors.invariant.dark,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(180deg, #3FF2AB 0%, #25B487 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(46, 224, 154, 0.35)'
    },
    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: '0 2px 8px rgba(46, 224, 154, 0.35)'
    }
  },
  iconsAndNames: {
    width: 'fit-content'
  },
  narrowCell: {
    width: 65
  },
  mediumCell: {
    width: 100
  },
  wideCell: {
    width: 170
  },
  chartCell: {
    width: 230
  },
  actionCell: {
    width: 36
  }
}))

interface Row extends IPositionItem {
  isLastRow: boolean
}
export const PositionTableRow: React.FC<Row> = ({
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
  const { classes } = useStyles()
  const { classes: sharedClasses } = useSharedStyles()
  const [xToY, setXToY] = useState<boolean>(
    initialXtoY(tickerToAddress(network, tokenXName), tickerToAddress(network, tokenYName))
  )
  const airdropIconRef = useRef<any>(null)
  const [isPromotedPoolPopoverOpen, setIsPromotedPoolPopoverOpen] = useState(false)

  const isXs = useMediaQuery(theme.breakpoints.down('xs'))
  const networkSelector = useSelector(currentNetwork)
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

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

  // Reuse existing components and logic for cell contents
  const pairNameContent = (
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
  )

  const handleMouseEnter = useCallback(() => {
    setIsPromotedPoolPopoverOpen(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsPromotedPoolPopoverOpen(false)
  }, [])

  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const handleTooltipEnter = useCallback(() => {
    setIsTooltipOpen(true)
  }, [])

  const handleTooltipLeave = useCallback(() => {
    setIsTooltipOpen(false)
  }, [])

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
          sx={{ width: 65 }}
          className={classNames(sharedClasses.fee, isActive ? sharedClasses.activeFee : undefined)}
          justifyContent='center'
          alignItems='center'>
          <Typography
            className={classNames(
              sharedClasses.infoText,
              isActive ? sharedClasses.activeInfoText : undefined
            )}>
            {fee}%
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
          width: 100,
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
        <Grid className={sharedClasses.infoCenter} container item justifyContent='center'>
          <Typography className={sharedClasses.greenText}>
            {formatNumber(xToY ? valueX : valueY)} {xToY ? tokenXName : tokenYName}
          </Typography>
        </Grid>
      </Grid>
    ),
    [valueX, valueY, tokenXName, classes, isXs, isDesktop, tokenYName, xToY]
  )

  const unclaimedFee = useMemo(
    () => (
      <Grid
        container
        item
        sx={{
          width: 100,
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
        <Grid className={sharedClasses.infoCenter} container item justifyContent='center'>
          <Typography className={sharedClasses.greenText}>345.4$</Typography>
        </Grid>
      </Grid>
    ),
    [valueX, valueY, tokenXName, classes, isXs, isDesktop, tokenYName, xToY]
  )

  const promotedIconContent = useMemo(() => {
    if (isPromoted && isActive) {
      return (
        <>
          <div
            onClick={e => e.stopPropagation()}
            className={classes.actionButton}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
            <img
              src={icons.airdropRainbow}
              alt={'Airdrop'}
              style={{ height: '32px', marginRight: '16px', marginLeft: '16px' }}
            />
          </div>
          <PromotedPoolPopover
            showEstPointsFirst
            isActive={isActive}
            anchorEl={airdropIconRef.current}
            open={isPromotedPoolPopoverOpen}
            onClose={() => setIsPromotedPoolPopoverOpen(false)}
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
      <Tooltip
        open={isTooltipOpen}
        onOpen={() => setIsTooltipOpen(true)}
        onClose={() => setIsTooltipOpen(false)}
        enterTouchDelay={0}
        leaveTouchDelay={0}
        onClick={e => e.stopPropagation()}
        title={
          <div onMouseEnter={handleTooltipEnter} onMouseLeave={handleTooltipLeave}>
            <PositionStatusTooltip isActive={isActive} isPromoted={isPromoted} />
          </div>
        }
        placement='top'
        classes={{
          tooltip: sharedClasses.tooltip
        }}>
        <div
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleTooltipLeave}
          style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src={icons.airdropRainbow}
            alt={'Airdrop'}
            style={{
              height: '32px',
              marginRight: '16px',
              marginLeft: '16px',
              opacity: 0.3,
              filter: 'grayscale(1)'
            }}
          />
        </div>
      </Tooltip>
    )
  }, [
    isPromoted,
    isActive,
    isPromotedPoolPopoverOpen,
    isTooltipOpen,
    handleMouseEnter,
    handleMouseLeave,
    handleTooltipEnter,
    handleTooltipLeave,
    estimated24hPoints,
    pointsPerSecond
  ])

  return (
    <TableRow className={classes.bodyRow}>
      <TableCell className={classes.bodyCell}>{pairNameContent}</TableCell>
      <TableCell className={`${classes.bodyCell} ${classes.narrowCell}`}>{feeFragment}</TableCell>
      <TableCell className={`${classes.bodyCell} ${classes.wideCell}`}>
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
      </TableCell>
      <TableCell className={`${classes.bodyCell} ${classes.mediumCell}`}>{valueFragment}</TableCell>
      <TableCell className={`${classes.bodyCell} ${classes.mediumCell}`}>{unclaimedFee}</TableCell>
      <TableCell className={`${classes.bodyCell} ${classes.chartCell}`}>
        <MinMaxChart min={0.3453} max={0.3853} current={0.36653} />
      </TableCell>
      <TableCell className={`${classes.bodyCell} ${classes.actionCell}`}>
        <Button className={classes.button} />
      </TableCell>
    </TableRow>
  )
}
