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
import unlockIcon from '@static/svg/unlock.svg'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import icons from '@static/icons'
import { addressToTicker } from '@utils/utils'
import {
  NetworkType,
  WETH_CLOSE_POSITION_LAMPORTS_MAIN,
  WETH_CLOSE_POSITION_LAMPORTS_TEST
} from '@store/consts/static'
import { BN } from '@coral-xyz/anchor'

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
  showFeesLoader?: boolean
  userHasStakes?: boolean
  isBalanceLoading: boolean
  isActive: boolean
  network: NetworkType
  isLocked: boolean
  onModalOpen: () => void
  ethBalance: BN
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
  onModalOpen,
  isLocked,
  ethBalance
}) => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { classes } = useStyles()

  const canClosePosition = useMemo(() => {
    if (network === NetworkType.Testnet) {
      return ethBalance.gte(WETH_CLOSE_POSITION_LAMPORTS_TEST)
    } else {
      return ethBalance.gte(WETH_CLOSE_POSITION_LAMPORTS_MAIN)
    }
  }, [ethBalance, network])
  console.log(ethBalance.toString())
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
              {xToY ? tokenX.name : tokenY.name} - {xToY ? tokenY.name : tokenX.name}{' '}
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
              isLocked
                ? 'Closing positions is disabled when position is locked'
                : canClosePosition
                  ? tokenX.claimValue > 0 || tokenY.claimValue > 0
                    ? 'Unclaimed fees will be returned when closing the position'
                    : ''
                  : 'Insufficient ETH to close position'
            }>
            <Button
              className={classes.closeButton}
              disabled={isLocked || !canClosePosition}
              variant='contained'
              onClick={() => {
                if (!userHasStakes) {
                  closePosition()
                } else {
                  setIsModalOpen(true)
                  blurContent()
                }
              }}>
              {canClosePosition ? 'Close position' : 'Lacking ETH'}
            </Button>
          </TooltipHover>
          <Hidden mdUp>
            {!isLocked ? (
              <TooltipHover text={'Lock liquidity'}>
                <Button
                  className={classes.lockButton}
                  disabled={isLocked}
                  variant='contained'
                  onClick={onModalOpen}>
                  <img src={lockIcon} alt='Lock' />
                </Button>
              </TooltipHover>
            ) : (
              <TooltipHover text={'Unlocking liquidity is forbidden'}>
                <Button
                  disabled
                  className={classes.unlockButton}
                  variant='contained'
                  onClick={() => {}}>
                  <img src={unlockIcon} alt='Lock' />
                </Button>
              </TooltipHover>
            )}
          </Hidden>
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
