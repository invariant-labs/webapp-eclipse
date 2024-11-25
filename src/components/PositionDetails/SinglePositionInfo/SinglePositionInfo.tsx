import ClosePositionWarning from '@components/Modals/ClosePositionWarning/ClosePositionWarning'
import { Button, Grid, Hidden, Tooltip, Typography } from '@mui/material'
import { blurContent, unblurContent } from '@utils/uiUtils'
import classNames from 'classnames'
import { useMemo, useState } from 'react'
import { BoxInfo } from './BoxInfo'
import { ILiquidityToken } from './consts'
import useStyles from './style'
import { useNavigate } from 'react-router-dom'
import { TokenPriceData } from '@store/consts/types'
import lockIcon from '@static/svg/lock.svg'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import icons from '@static/icons'
import { addressToTicker, formatNumber } from '@utils/utils'
import { NetworkType } from '@store/consts/static'
import LockLiquidityModal from '@components/Modals/LockLiquidityModal/LockLiquidityModal'
import { lockerState } from '@store/selectors/locker'
import { useSelector } from 'react-redux'

interface IProp {
  fee: number
  onClickClaimFee: () => void
  closePosition: (claimFarmRewards?: boolean) => void
  tokenX: ILiquidityToken
  tokenY: ILiquidityToken
  tokenXPriceData?: TokenPriceData
  tokenYPriceData?: TokenPriceData
  xToY: boolean
  swapHandler: () => void
  lockPosition: () => void
  showFeesLoader?: boolean
  userHasStakes?: boolean
  isBalanceLoading: boolean
  isActive: boolean
  network: NetworkType
  min: number
  max: number
  currentPrice: number
}

const SinglePositionInfo: React.FC<IProp> = ({
  fee,
  onClickClaimFee,
  closePosition,
  tokenX,
  tokenY,
  tokenXPriceData,
  tokenYPriceData,
  xToY,
  swapHandler,
  showFeesLoader = false,
  userHasStakes = false,
  isBalanceLoading,
  isActive,
  network,
  min,
  max,
  currentPrice,
  lockPosition
}) => {
  const navigate = useNavigate()
  const { success, inProgress } = useSelector(lockerState)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLockPositionModalOpen, setIsLockPositionModalOpen] = useState(false)
  const { classes } = useStyles()

  const onLockPosirionModalClose = () => {
    setIsLockPositionModalOpen(false)
    unblurContent()
  }

  const { value, tokenXLabel, tokenYLabel } = useMemo<{
    value: string
    tokenXLabel: string
    tokenYLabel: string
  }>(() => {
    const valueX = tokenX.liqValue + tokenY.liqValue / currentPrice
    const valueY = tokenY.liqValue + tokenX.liqValue * currentPrice
    return {
      value: `${formatNumber(xToY ? valueX : valueY)} ${xToY ? tokenX.name : tokenY.name}`,
      tokenXLabel: xToY ? tokenX.name : tokenY.name,
      tokenYLabel: xToY ? tokenY.name : tokenX.name
    }
  }, [min, max, currentPrice, tokenX, tokenY, xToY])

  return (
    <Grid className={classes.root}>
      <ClosePositionWarning
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          unblurContent()
        }}
        onClose={() => {
          closePosition()
          setIsModalOpen(false)
          unblurContent()
        }}
        onClaim={() => {
          closePosition(true)
          setIsModalOpen(false)
          unblurContent()
        }}
      />
      <LockLiquidityModal
        open={isLockPositionModalOpen}
        onClose={onLockPosirionModalClose}
        xToY={xToY}
        tokenX={tokenX}
        tokenY={tokenY}
        onLock={lockPosition}
        fee={`${fee.toString()}% fee`}
        minMax={`${formatNumber(min)}-${formatNumber(max)} ${tokenYLabel} per ${tokenXLabel}`}
        value={value}
        isActive={isActive}
        swapHandler={swapHandler}
        success={success}
        inProgress={inProgress}
      />
      <Grid className={classes.header}>
        <Grid className={classes.iconsGrid}>
          <img
            className={classes.icon}
            src={xToY ? tokenX.icon : tokenY.icon}
            alt={xToY ? tokenX.name : tokenY.name}
          />
          <TooltipHover text='Reverse tokens'>
            <img
              className={classes.arrowIcon}
              src={icons.swapListIcon}
              alt='Reverse tokens'
              onClick={swapHandler}
            />
          </TooltipHover>
          <img
            className={classes.icon}
            src={xToY ? tokenY.icon : tokenX.icon}
            alt={xToY ? tokenY.name : tokenX.name}
          />
          <Grid className={classes.namesGrid}>
            <Typography className={classes.name}>
              {xToY ? tokenX.name : tokenY.name} - {xToY ? tokenY.name : tokenX.name}
            </Typography>
          </Grid>
          <Grid className={classes.rangeGrid} sx={{ display: { xs: 'flex', md: 'none' } }}>
            <Tooltip
              title={
                isActive ? (
                  <>
                    The position is <b>active</b> and currently <b>earning a fee</b> as long as the
                    current price is <b>within</b> the position's price range.
                  </>
                ) : (
                  <>
                    The position is <b>inactive</b> and <b>not earning a fee</b> as long as the
                    current price is <b>outside</b> the position's price range.
                  </>
                )
              }
              placement='top'
              classes={{
                tooltip: classes.tooltip
              }}>
              <Typography
                className={classNames(
                  classes.text,
                  classes.feeText,
                  isActive ? classes.active : null
                )}>
                {fee.toString()}% fee
              </Typography>
            </Tooltip>
          </Grid>
        </Grid>

        <Grid className={classes.headerButtons}>
          <Grid className={classes.rangeGrid} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Tooltip
              title={
                isActive ? (
                  <>
                    The position is <b>active</b> and currently <b>earning a fee</b> as long as the
                    current price is <b>within</b> the position's price range.
                  </>
                ) : (
                  <>
                    The position is <b>inactive</b> and <b>not earning a fee</b> as long as the
                    current price is <b>outside</b> the position's price range.
                  </>
                )
              }
              placement='top'
              classes={{
                tooltip: classes.tooltip
              }}>
              <Typography
                className={classNames(
                  classes.text,
                  classes.feeText,
                  isActive ? classes.active : null
                )}>
                {fee.toString()}% fee
              </Typography>
            </Tooltip>
          </Grid>
          <TooltipHover
            text={
              tokenX.claimValue > 0 || tokenY.claimValue > 0
                ? 'Unclaimed fees will be returned when closing the position'
                : ''
            }>
            <Button
              className={classes.closeButton}
              variant='contained'
              onClick={() => {
                if (!userHasStakes) {
                  closePosition()
                } else {
                  setIsModalOpen(true)
                  blurContent()
                }
              }}>
              Close position
            </Button>
          </TooltipHover>
          <TooltipHover text={'Lock liquidity'}>
            <Button
              className={classes.lockButton}
              variant='contained'
              onClick={() => {
                setIsLockPositionModalOpen(true)
                blurContent()
              }}>
              <img src={lockIcon} alt='Lock' />
            </Button>
          </TooltipHover>
          <Hidden smUp>
            <Button
              className={classes.button}
              variant='contained'
              onClick={() => {
                const address1 = addressToTicker(network, tokenX.name)
                const address2 = addressToTicker(network, tokenY.name)

                navigate(`/newPosition/${address1}/${address2}/${fee}`)
              }}>
              <span className={classes.buttonText}>+ Add Position</span>
            </Button>
          </Hidden>
        </Grid>
      </Grid>
      <Grid className={classes.bottomGrid}>
        <BoxInfo
          title={'Liquidity'}
          tokenA={
            xToY
              ? { ...tokenX, value: tokenX.liqValue, price: tokenXPriceData?.price }
              : { ...tokenY, value: tokenY.liqValue, price: tokenYPriceData?.price }
          }
          tokenB={
            xToY
              ? { ...tokenY, value: tokenY.liqValue, price: tokenYPriceData?.price }
              : { ...tokenX, value: tokenX.liqValue, price: tokenXPriceData?.price }
          }
          showBalance
          swapHandler={swapHandler}
          isBalanceLoading={isBalanceLoading}
        />
        <BoxInfo
          title={'Unclaimed fees'}
          tokenA={
            xToY ? { ...tokenX, value: tokenX.claimValue } : { ...tokenY, value: tokenY.claimValue }
          }
          tokenB={
            xToY ? { ...tokenY, value: tokenY.claimValue } : { ...tokenX, value: tokenX.claimValue }
          }
          onClickButton={onClickClaimFee}
          showLoader={showFeesLoader}
          isBalanceLoading={isBalanceLoading}
        />
      </Grid>
    </Grid>
  )
}

export default SinglePositionInfo
