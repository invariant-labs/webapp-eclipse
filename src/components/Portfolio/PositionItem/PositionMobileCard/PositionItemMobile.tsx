import { Box, Button, Grid, Skeleton, Typography } from '@mui/material'
import { formatNumberWithSuffix } from '@utils/utils'
import { useEffect, useMemo, useState } from 'react'
import { useMobileStyles } from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { initialXtoY, tickerToAddress } from '@utils/utils'
import { swapListIcon, warning2Icon, warningIcon } from '@static/icons'
import { useSelector } from 'react-redux'
import { useTokenValues } from '@store/hooks/positionList/useTokenValues'
import { singlePositionData } from '@store/selectors/positions'
import { blurContent, unblurContent } from '@utils/uiUtils'
import PositionViewActionPopover from '@components/Modals/PositionViewActionPopover/PositionViewActionPopover'
import LockLiquidityModal from '@components/Modals/LockLiquidityModal/LockLiquidityModal'
import { lockerState } from '@store/selectors/locker'
import { ILiquidityToken } from '@store/consts/types'
import { ISinglePositionData } from '@components/Portfolio/Overview/Overview/Overview'
import { IPositionItem } from '@store/consts/types'
import { MinMaxChart } from '../components/MinMaxChart/MinMaxChart'
import { ReactFitty } from 'react-fitty'

interface IPositionItemMobile extends IPositionItem {
  setAllowPropagation: React.Dispatch<React.SetStateAction<boolean>>
  handleLockPosition: (index: number) => void
  handleClosePosition: (index: number) => void
  handleClaimFee: (index: number, isLocked: boolean) => void
  createNewPosition: () => void
  shouldDisable: boolean
  openPosition: () => void
}

export const PositionItemMobile: React.FC<IPositionItemMobile> = ({
  tokenXName,
  tokenYName,
  tokenXIcon,
  isUnknownX,
  isUnknownY,
  tokenYIcon,
  fee,
  min,
  max,
  position,
  id,
  isFullRange,
  setAllowPropagation,
  isActive = false,
  currentPrice,
  tokenXLiq,
  tokenYLiq,
  network,
  unclaimedFeesInUSD = { value: 0, loading: false, isClaimAvailable: false },
  handleLockPosition,
  handleClosePosition,
  handleClaimFee,
  shouldDisable,
  createNewPosition,
  openPosition
}) => {
  const { classes, cx } = useMobileStyles()

  const positionSingleData: ISinglePositionData | undefined = useSelector(
    singlePositionData(id ?? '')
  )

  const [isLockPositionModalOpen, setIsLockPositionModalOpen] = useState(false)

  useEffect(() => {
    if (isLockPositionModalOpen) {
      blurContent()
    } else {
      unblurContent()
    }
  }, [isLockPositionModalOpen])

  useEffect(() => {
    const PROPAGATION_ALLOW_TIME = 500

    const handleClickOutside = () => {
      setTimeout(() => {
        setAllowPropagation(true)
      }, PROPAGATION_ALLOW_TIME)
    }

    if (isLockPositionModalOpen) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isLockPositionModalOpen])

  useEffect(() => {
    setAllowPropagation(!isLockPositionModalOpen)
  }, [isLockPositionModalOpen])

  const [xToY, setXToY] = useState<boolean>(
    initialXtoY(tickerToAddress(network, tokenXName), tickerToAddress(network, tokenYName))
  )

  const [isActionPopoverOpen, setActionPopoverOpen] = useState<boolean>(false)

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setActionPopoverOpen(true)
  }

  const handleClose = () => {
    unblurContent()
    setActionPopoverOpen(false)
  }

  const { tokenValueInUsd, tokenXPercentage, tokenYPercentage } = useTokenValues({
    currentPrice,
    id,
    position,
    tokenXLiq,
    tokenYLiq,
    positionSingleData,
    xToY
  })

  const topSection = useMemo(
    () => (
      <Grid container sx={{ width: '100%', marginBottom: 2 }}>
        <Grid item xs={5}>
          <TooltipHover
            title={
              isActive ? (
                <>
                  The position is <b>active</b> and currently <b>earning a fee</b>
                </>
              ) : (
                <>
                  The position is <b>inactive</b> and <b>not earning a fee</b>
                </>
              )
            }
            placement='top'
            increasePadding
            fullSpan>
            <Grid
              container
              className={cx(classes.fee, isActive ? classes.activeFee : undefined)}
              justifyContent='center'
              alignItems='center'>
              <Typography
                className={cx(classes.infoText, isActive ? classes.activeInfoText : undefined)}>
                {fee}% fee
              </Typography>
            </Grid>
          </TooltipHover>
        </Grid>

        <Grid item xs={7} paddingLeft={'16px'}>
          {unclaimedFeesInUSD.loading ? (
            <Skeleton
              variant='rectangular'
              width='100%'
              height={36}
              sx={{ borderRadius: '10px' }}
            />
          ) : (
            <Grid
              container
              justifyContent='center'
              alignItems='center'
              className={classes.fee}
              sx={{ width: '100%' }}>
              <Box className={classes.unclaimedFeeContainer}>
                <Typography className={classes.infoText}>Unclaimed Fee</Typography>
                <Typography className={classes.greenText}>
                  ${formatNumberWithSuffix(unclaimedFeesInUSD.value.toFixed(2))}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Grid>
    ),
    [fee, isActive, unclaimedFeesInUSD]
  )

  const middleSection = useMemo(
    () => (
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={6}>
          {tokenValueInUsd.loading ? (
            <Skeleton
              variant='rectangular'
              width='100%'
              height={36}
              sx={{ borderRadius: '10px' }}
            />
          ) : (
            <div>
              {tokenValueInUsd.priceWarning ? (
                <TooltipHover title='The price might not be shown correctly' fullSpan>
                  <Grid
                    container
                    className={classes.value}
                    alignItems='center'
                    justifyContent='center'>
                    <Box gap={'8px'} display={'flex'} alignItems={'center'}>
                      <Typography className={classes.infoText}>Value</Typography>

                      <Typography className={classes.greenText}>
                        ${formatNumberWithSuffix(tokenValueInUsd.value)}
                      </Typography>

                      <img src={warning2Icon} width={14} />
                    </Box>
                  </Grid>
                </TooltipHover>
              ) : (
                <Grid
                  container
                  className={classes.value}
                  alignItems='center'
                  justifyContent='center'>
                  <Box gap={'8px'} display={'flex'} alignItems={'center'}>
                    <Typography className={classes.infoText}>Value</Typography>

                    <Typography className={classes.greenText}>
                      ${formatNumberWithSuffix(tokenValueInUsd.value)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </div>
          )}
        </Grid>

        <Grid item xs={6}>
          <Grid container alignItems='center' className={classes.value} justifyContent='center'>
            <Typography className={classes.infoText}>
              {tokenXPercentage === 100 && (
                <span>
                  {tokenXPercentage}% {xToY ? tokenXName : tokenYName}
                </span>
              )}
              {tokenYPercentage === 100 && (
                <span>
                  {tokenYPercentage}% {xToY ? tokenYName : tokenXName}
                </span>
              )}
              {tokenYPercentage !== 100 && tokenXPercentage !== 100 && (
                <span>
                  {tokenXPercentage}% {xToY ? tokenXName : tokenYName} - {tokenYPercentage}%{' '}
                  {xToY ? tokenYName : tokenXName}
                </span>
              )}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    ),
    [tokenValueInUsd, tokenXPercentage, tokenYPercentage, xToY]
  )

  const chartSection = useMemo(
    () => (
      <Grid container justifyContent='center' margin={'0 auto'} width={'80%'}>
        <MinMaxChart
          isFullRange={isFullRange}
          min={Number(xToY ? min : 1 / max)}
          max={Number(xToY ? max : 1 / min)}
          current={
            xToY ? currentPrice : currentPrice !== 0 ? 1 / currentPrice : Number.MAX_SAFE_INTEGER
          }
        />
      </Grid>
    ),
    [min, max, currentPrice, xToY]
  )

  const { value, tokenXLabel, tokenYLabel } = useMemo<{
    value: string
    tokenXLabel: string
    tokenYLabel: string
  }>(() => {
    const valueX = tokenXLiq + tokenYLiq / currentPrice
    const valueY = tokenYLiq + tokenXLiq * currentPrice
    return {
      value: `${formatNumberWithSuffix(xToY ? valueX : valueY)} ${xToY ? tokenXName : tokenYName}`,
      tokenXLabel: xToY ? tokenXName : tokenYName,
      tokenYLabel: xToY ? tokenYName : tokenXName
    }
  }, [min, max, currentPrice, tokenXName, tokenYName, tokenXLiq, tokenYLiq, xToY])

  const { success, inProgress } = useSelector(lockerState)

  return (
    <Grid className={classes.root} container direction='column'>
      <LockLiquidityModal
        open={isLockPositionModalOpen}
        onClose={() => setIsLockPositionModalOpen(false)}
        xToY={xToY}
        tokenX={{ name: tokenXName, icon: tokenXIcon, liqValue: tokenXLiq } as ILiquidityToken}
        tokenY={{ name: tokenYName, icon: tokenYIcon, liqValue: tokenYLiq } as ILiquidityToken}
        onLock={() => handleLockPosition(positionSingleData?.positionIndex ?? 0)}
        fee={`${fee}% fee`}
        minMax={`${formatNumberWithSuffix(xToY ? min : 1 / max)}-${formatNumberWithSuffix(xToY ? max : 1 / min)} ${tokenYLabel} per ${tokenXLabel}`}
        value={value}
        isActive={isActive}
        swapHandler={() => setXToY(!xToY)}
        success={success}
        inProgress={inProgress}
      />
      <PositionViewActionPopover
        shouldDisable={shouldDisable}
        anchorEl={anchorEl}
        handleClose={handleClose}
        open={isActionPopoverOpen}
        isLocked={positionSingleData?.isLocked ?? false}
        unclaimedFeesInUSD={unclaimedFeesInUSD}
        claimFee={() =>
          handleClaimFee(
            positionSingleData?.positionIndex ?? 0,
            positionSingleData?.isLocked ?? false
          )
        }
        closePosition={() => handleClosePosition(positionSingleData?.positionIndex ?? 0)}
        onLockPosition={() => setIsLockPositionModalOpen(true)}
        createPosition={createNewPosition}
        onManagePosition={openPosition}
      />
      <Grid container item className={classes.mdTop}>
        <Grid container item className={classes.iconsAndNames}>
          <Box display='flex' alignItems={'center'} flex='1'>
            <Grid container item className={classes.icons}>
              <Grid display='flex' position='relative'>
                <img
                  className={classes.tokenIcon}
                  src={xToY ? tokenXIcon : tokenYIcon}
                  alt={xToY ? tokenXName : tokenYName}
                />
                {(xToY ? isUnknownX : isUnknownY) && (
                  <img className={classes.warningIcon} src={warningIcon} />
                )}
              </Grid>
              <TooltipHover title='Reverse tokens'>
                <img
                  className={classes.arrows}
                  src={swapListIcon}
                  alt='Arrow'
                  onClick={e => {
                    e.stopPropagation()
                    setXToY(!xToY)
                  }}
                />
              </TooltipHover>
              <Grid display='flex' position='relative'>
                <img
                  className={classes.tokenIcon}
                  src={xToY ? tokenYIcon : tokenXIcon}
                  alt={xToY ? tokenYName : tokenXName}
                />
                {(xToY ? isUnknownY : isUnknownX) && (
                  <img className={classes.warningIcon} src={warningIcon} />
                )}
              </Grid>
            </Grid>
            <Box className={classes.tickersContainer}>
              <Typography className={classes.names} component={ReactFitty} maxSize={28}>
                {xToY ? tokenXName : tokenYName} - {xToY ? tokenYName : tokenXName}
              </Typography>
            </Box>
          </Box>

          <Box className={classes.actionButtonContainer}>
            <Button
              className={classes.button}
              onClick={e => {
                e.stopPropagation()
                handleClick(e)
              }}>
              ...
            </Button>
          </Box>
        </Grid>
      </Grid>

      {topSection}
      {middleSection}
      {chartSection}
    </Grid>
  )
}
