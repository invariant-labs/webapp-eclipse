import ClosePositionWarning from '@components/Modals/ClosePositionWarning/ClosePositionWarning'
import { Box, Grid, Hidden, Typography } from '@mui/material'
import { blurContent, unblurContent } from '@utils/uiUtils'
import classNames from 'classnames'
import { useMemo, useRef, useState } from 'react'
import { BoxInfo } from './BoxInfo'
import { ILiquidityToken } from './consts'
import useStyles from './style'
import { useNavigate } from 'react-router-dom'
import { TokenPriceData } from '@store/consts/types'

import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import icons from '@static/icons'
import { addressToTicker, ROUTES } from '@utils/utils'
import {
  NetworkType,
  WETH_CLOSE_POSITION_LAMPORTS_MAIN,
  WETH_CLOSE_POSITION_LAMPORTS_TEST
} from '@store/consts/static'
import { BN } from '@coral-xyz/anchor'
import { TooltipGradient } from '@common/TooltipHover/TooltipGradient'
import { Button } from '@common/Button/Button'

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
  const [isFeeTooltipOpen, setIsFeeTooltipOpen] = useState(false)
  const feeRef = useRef<HTMLDivElement>(null)

  const { classes } = useStyles()

  const Overlay = () => (
    <div
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        setIsFeeTooltipOpen(false)
      }}
      className={classes.overlay}
    />
  )

  const canClosePosition = useMemo(() => {
    if (network === NetworkType.Testnet) {
      return ethBalance.gte(WETH_CLOSE_POSITION_LAMPORTS_TEST)
    } else {
      return ethBalance.gte(WETH_CLOSE_POSITION_LAMPORTS_MAIN)
    }
  }, [ethBalance, network])

  return (
    <>
      {isFeeTooltipOpen && <Overlay />}
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
            <Grid className={classes.tickerContainer}>
              <img
                className={classes.icon}
                src={xToY ? tokenX.icon : tokenY.icon}
                alt={xToY ? tokenX.name : tokenY.name}
              />
              <TooltipHover title='Reverse tokens'>
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
            </Grid>
            <Grid className={classes.rangeGrid} sx={{ display: { xs: 'flex', md: 'none' } }}>
              <TooltipGradient
                title={
                  isActive ? (
                    <>
                      The position is <b>active</b> and currently <b>earning a fee</b> as long as
                      the current price is <b>within</b> the position's price range.
                    </>
                  ) : (
                    <>
                      The position is <b>inactive</b> and <b>not earning a fee</b> as long as the
                      current price is <b>outside</b> the position's price range.
                    </>
                  )
                }
                placement='top'
                top={1}
                noGradient>
                <Typography
                  ref={feeRef}
                  onClick={e => {
                    e.stopPropagation()
                    setIsFeeTooltipOpen(prev => !prev)
                  }}
                  className={classNames(
                    classes.text,
                    classes.feeText,
                    isActive ? classes.active : null
                  )}>
                  {fee.toString()}% fee
                </Typography>
              </TooltipGradient>
            </Grid>
          </Grid>

          <Grid className={classes.headerButtons}>
            <Grid className={classes.rangeGrid} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <TooltipGradient
                title={
                  isActive ? (
                    <>
                      The position is <b>active</b> and currently <b>earning a fee</b> as long as
                      the current price is <b>within</b> the position's price range.
                    </>
                  ) : (
                    <>
                      The position is <b>inactive</b> and <b>not earning a fee</b> as long as the
                      current price is <b>outside</b> the position's price range.
                    </>
                  )
                }
                placement='top'
                top={1}
                noGradient>
                <Typography
                  className={classNames(
                    classes.text,
                    classes.feeText,
                    isActive ? classes.active : null
                  )}>
                  {fee.toString()}% fee
                </Typography>
              </TooltipGradient>
            </Grid>
            <TooltipHover
              title={
                isLocked
                  ? 'Closing positions is disabled when position is locked'
                  : canClosePosition
                    ? tokenX.claimValue > 0 || tokenY.claimValue > 0
                      ? 'Unclaimed fees will be returned when closing the position'
                      : ''
                    : 'Insufficient ETH to close position'
              }>
              <Box>
                <Button
                  scheme='green'
                  height={36}
                  padding='0 6px'
                  borderRadius={14}
                  disabled={isLocked || !canClosePosition}
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
              </Box>
            </TooltipHover>
            <Hidden mdUp>
              {!isLocked ? (
                <TooltipHover title={'Lock liquidity'}>
                  <Box>
                    <Button width={45} scheme='green' disabled={isLocked} onClick={onModalOpen}>
                      <img src={icons.lockIcon} alt='Lock' />
                    </Button>
                  </Box>
                </TooltipHover>
              ) : (
                <TooltipHover title={'Unlocking liquidity is forbidden'}>
                  <Box>
                    <Button width={45} scheme='green' disabled onClick={() => {}}>
                      <img src={icons.unlockIcon} alt='Lock' />
                    </Button>
                  </Box>
                </TooltipHover>
              )}
            </Hidden>
            <Hidden smUp>
              <Button
                scheme='pink'
                onClick={() => {
                  const address1 = addressToTicker(network, tokenX.name)
                  const address2 = addressToTicker(network, tokenY.name)

                  navigate(ROUTES.getNewPositionRoute(address1, address2, fee.toString()))
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
              xToY
                ? { ...tokenX, value: tokenX.claimValue }
                : { ...tokenY, value: tokenY.claimValue }
            }
            tokenB={
              xToY
                ? { ...tokenY, value: tokenY.claimValue }
                : { ...tokenX, value: tokenX.claimValue }
            }
            onClickButton={onClickClaimFee}
            showLoader={showFeesLoader}
            isBalanceLoading={isBalanceLoading}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default SinglePositionInfo
