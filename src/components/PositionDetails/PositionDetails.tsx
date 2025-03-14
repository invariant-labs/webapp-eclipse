import MarketIdLabel from '@components/NewPosition/MarketIdLabel/MarketIdLabel'
import SinglePositionInfo from '@components/PositionDetails/SinglePositionInfo/SinglePositionInfo'
import SinglePositionPlot from '@components/PositionDetails/SinglePositionPlot/SinglePositionPlot'
import { TickPlotPositionData } from '@components/PriceRangePlot/PriceRangePlot'
import Refresher from '@components/Refresher/Refresher'
import { Box, Button, Grid, Hidden, Typography } from '@mui/material'
import backIcon from '@static/svg/back-arrow.svg'
import { NetworkType, REFRESHER_INTERVAL } from '@store/consts/static'
import { PlotTickData } from '@store/reducers/positions'
import { VariantType } from 'notistack'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ILiquidityToken } from './SinglePositionInfo/consts'
import { useStyles } from './style'
import { TokenPriceData } from '@store/consts/types'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import {
  addressToTicker,
  formatNumberWithSuffix,
  initialXtoY,
  parseFeeToPathFee,
  ROUTES
} from '@utils/utils'
import { printBN } from '@utils/utils'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { PublicKey } from '@solana/web3.js'
import icons from '@static/icons'
import { BN } from '@coral-xyz/anchor'
import LockLiquidityModal from '@components/Modals/LockLiquidityModal/LockLiquidityModal'
import { blurContent, unblurContent } from '@utils/uiUtils'
import lockIcon from '@static/svg/lock.svg'
import unlockIcon from '@static/svg/unlock.svg'

interface IProps {
  tokenXAddress: PublicKey
  tokenYAddress: PublicKey
  poolAddress: PublicKey
  copyPoolAddressHandler: (message: string, variant: VariantType) => void
  detailsData: PlotTickData[]
  leftRange: TickPlotPositionData
  rightRange: TickPlotPositionData
  midPrice: TickPlotPositionData
  currentPrice: number
  tokenX: ILiquidityToken
  tokenY: ILiquidityToken
  tokenXPriceData?: TokenPriceData
  tokenYPriceData?: TokenPriceData
  onClickClaimFee: () => void
  lockPosition: () => void
  closePosition: (claimFarmRewards?: boolean) => void
  ticksLoading: boolean
  tickSpacing: number
  fee: BN
  min: number
  max: number
  showFeesLoader?: boolean
  hasTicksError?: boolean
  reloadHandler: () => void
  userHasStakes?: boolean
  onRefresh: () => void
  isBalanceLoading: boolean
  network: NetworkType
  isLocked: boolean
  success: boolean
  inProgress: boolean
  ethBalance: BN
}

const PositionDetails: React.FC<IProps> = ({
  tokenXAddress,
  tokenYAddress,
  poolAddress,
  copyPoolAddressHandler,
  detailsData,
  leftRange,
  rightRange,
  midPrice,
  currentPrice,
  tokenY,
  tokenX,
  tokenXPriceData,
  tokenYPriceData,
  lockPosition,
  onClickClaimFee,
  closePosition,
  ticksLoading,
  tickSpacing,
  fee,
  min,
  max,
  showFeesLoader = false,
  hasTicksError,
  reloadHandler,
  userHasStakes = false,
  onRefresh,
  isBalanceLoading,
  network,
  isLocked,
  success,
  inProgress,
  ethBalance
}) => {
  const { classes } = useStyles()

  const navigate = useNavigate()

  const [xToY, setXToY] = useState<boolean>(
    initialXtoY(tokenXAddress.toString(), tokenYAddress.toString())
  )

  const [isLockPositionModalOpen, setIsLockPositionModalOpen] = useState(false)

  const [refresherTime, setRefresherTime] = useState<number>(REFRESHER_INTERVAL)

  const isActive = midPrice.x >= min && midPrice.x <= max

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (refresherTime > 0) {
        setRefresherTime(refresherTime - 1)
      } else {
        onRefresh()
        setRefresherTime(REFRESHER_INTERVAL)
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [refresherTime])

  const networkUrl = useMemo(() => {
    switch (network) {
      case NetworkType.Mainnet:
        return ''
      case NetworkType.Testnet:
        return '?cluster=testnet'
      case NetworkType.Devnet:
        return '?cluster=devnet'
      default:
        return '?cluster=testnet'
    }
  }, [network])

  const onLockPositionModalClose = () => {
    setIsLockPositionModalOpen(false)
    unblurContent()
  }

  useEffect(() => {
    if (success && !inProgress) {
      onLockPositionModalClose()
    }
  }, [success, inProgress])

  const { value, tokenXLabel, tokenYLabel } = useMemo<{
    value: string
    tokenXLabel: string
    tokenYLabel: string
  }>(() => {
    const valueX = tokenX.liqValue + tokenY.liqValue / currentPrice
    const valueY = tokenY.liqValue + tokenX.liqValue * currentPrice
    return {
      value: `${formatNumberWithSuffix(xToY ? valueX : valueY)} ${xToY ? tokenX.name : tokenY.name}`,
      tokenXLabel: xToY ? tokenX.name : tokenY.name,
      tokenYLabel: xToY ? tokenY.name : tokenX.name
    }
  }, [min, max, currentPrice, tokenX, tokenY, xToY])

  return (
    <Grid container className={classes.wrapperContainer} wrap='nowrap'>
      <LockLiquidityModal
        open={isLockPositionModalOpen}
        onClose={onLockPositionModalClose}
        xToY={xToY}
        tokenX={tokenX}
        tokenY={tokenY}
        onLock={lockPosition}
        fee={`${+printBN(fee, DECIMAL - 2).toString()}% fee`}
        minMax={`${formatNumberWithSuffix(min)}-${formatNumberWithSuffix(max)} ${tokenYLabel} per ${tokenXLabel}`}
        value={value}
        isActive={isActive}
        swapHandler={() => setXToY(!xToY)}
        success={success}
        inProgress={inProgress}
      />
      <Grid className={classes.positionDetails} container item direction='column'>
        <Grid className={classes.backContainer} container>
          <Link to={ROUTES.PORTFOLIO} style={{ textDecoration: 'none' }}>
            <Grid className={classes.back} container item alignItems='center'>
              <img className={classes.backIcon} src={backIcon} alt='Back' />
              <Typography className={classes.backText}>Positions</Typography>
            </Grid>
          </Link>
          <Grid container width='auto' className={classes.marketIdWithRefresher}>
            <Hidden mdUp>
              <MarketIdLabel
                marketId={poolAddress.toString()}
                displayLength={5}
                copyPoolAddressHandler={copyPoolAddressHandler}
                style={{ paddingRight: 8 }}
              />
              {poolAddress.toString() && (
                <TooltipHover title='Open pool in explorer'>
                  <Grid height={'24px'} mr={'12px'}>
                    <a
                      href={`https://eclipsescan.xyz/account/${poolAddress.toString()}${networkUrl}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={event => {
                        event.stopPropagation()
                      }}
                      className={classes.link}>
                      <img width={14} height={14} src={icons.newTab} alt={'Token address'} />
                    </a>
                  </Grid>
                </TooltipHover>
              )}
              <Grid flex={1} justifyItems={'flex-end'}>
                <TooltipHover title='Refresh'>
                  <Refresher
                    currentIndex={refresherTime}
                    maxIndex={REFRESHER_INTERVAL}
                    onClick={() => {
                      onRefresh()
                      setRefresherTime(REFRESHER_INTERVAL)
                    }}
                  />
                </TooltipHover>
              </Grid>
            </Hidden>
          </Grid>
        </Grid>
        <SinglePositionInfo
          fee={+printBN(fee, DECIMAL - 2)}
          onClickClaimFee={onClickClaimFee}
          closePosition={closePosition}
          tokenX={tokenX}
          tokenY={tokenY}
          tokenXPriceData={tokenXPriceData}
          tokenYPriceData={tokenYPriceData}
          xToY={xToY}
          swapHandler={() => setXToY(!xToY)}
          showFeesLoader={showFeesLoader}
          userHasStakes={userHasStakes}
          isBalanceLoading={isBalanceLoading}
          isActive={isActive}
          network={network}
          isLocked={isLocked}
          onModalOpen={() => {
            setIsLockPositionModalOpen(true)
            blurContent()
          }}
          ethBalance={ethBalance}
        />
      </Grid>
      <Grid
        container
        item
        direction='column'
        alignItems='flex-end'
        className={classes.right}
        wrap='nowrap'>
        <Grid className={classes.positionPlotWrapper}>
          <Grid
            container
            item
            direction='row'
            alignItems='center'
            flexDirection='row-reverse'
            className={classes.rightHeaderWrapper}
            mt='22px'
            gap='8px'
            wrap='nowrap'>
            <Hidden mdDown>
              {!isLocked ? (
                <TooltipHover title={'Lock liquidity'}>
                  <Button
                    className={classes.lockButton}
                    disabled={isLocked}
                    variant='contained'
                    onClick={() => {
                      setIsLockPositionModalOpen(true)
                      blurContent()
                    }}>
                    <img src={lockIcon} alt='Lock' />
                  </Button>
                </TooltipHover>
              ) : (
                <TooltipHover title={'Unlocking liquidity is forbidden'}>
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
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Button
                className={classes.button}
                variant='contained'
                onClick={() => {
                  const parsedFee = parseFeeToPathFee(fee)
                  const address1 = addressToTicker(network, tokenXAddress.toString())
                  const address2 = addressToTicker(network, tokenYAddress.toString())

                  const isXtoY = initialXtoY(
                    tokenXAddress.toString() ?? '',
                    tokenYAddress.toString() ?? ''
                  )

                  const tokenA = isXtoY ? address1 : address2
                  const tokenB = isXtoY ? address2 : address1

                  navigate(ROUTES.getNewPositionRoute(tokenA, tokenB, parsedFee))
                }}>
                <span className={classes.buttonText}>+ Add Position</span>
              </Button>
            </Box>
            <Hidden mdDown>
              <TooltipHover title='Refresh'>
                <Grid display='flex' justifyContent='center'>
                  <Refresher
                    currentIndex={refresherTime}
                    maxIndex={REFRESHER_INTERVAL}
                    onClick={() => {
                      onRefresh()
                      setRefresherTime(REFRESHER_INTERVAL)
                    }}
                  />
                </Grid>
              </TooltipHover>
              <Grid
                display={'flex'}
                style={{
                  padding: '8px 8px  0 0px',
                  height: '24px',
                  minWidth: '200px',
                  marginRight: 'auto'
                }}>
                <MarketIdLabel
                  marketId={poolAddress.toString()}
                  displayLength={5}
                  copyPoolAddressHandler={copyPoolAddressHandler}
                />
                {poolAddress.toString() && (
                  <TooltipHover title='Open pool in explorer'>
                    <Grid>
                      <a
                        href={`https://eclipsescan.xyz/account/${poolAddress.toString()}${networkUrl}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={event => {
                          event.stopPropagation()
                        }}
                        className={classes.link}>
                        <img
                          width={14}
                          height={14}
                          src={icons.newTab}
                          alt={'Token address'}
                          style={{ transform: 'translateY(-2px)' }}
                        />
                      </a>
                    </Grid>
                  </TooltipHover>
                )}
              </Grid>
            </Hidden>
          </Grid>
          <SinglePositionPlot
            data={
              detailsData.length
                ? xToY
                  ? detailsData
                  : detailsData.map(tick => ({ ...tick, x: 1 / tick.x })).reverse()
                : Array(100)
                    .fill(1)
                    .map((_e, index) => ({ x: index, y: index, index }))
            }
            leftRange={xToY ? leftRange : { ...rightRange, x: 1 / rightRange.x }}
            rightRange={xToY ? rightRange : { ...leftRange, x: 1 / leftRange.x }}
            midPrice={{
              ...midPrice,
              x: midPrice.x ** (xToY ? 1 : -1)
            }}
            currentPrice={currentPrice ** (xToY ? 1 : -1)}
            tokenY={tokenY}
            tokenX={tokenX}
            ticksLoading={ticksLoading}
            tickSpacing={tickSpacing}
            min={xToY ? min : 1 / max}
            max={xToY ? max : 1 / min}
            xToY={xToY}
            hasTicksError={hasTicksError}
            reloadHandler={reloadHandler}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PositionDetails
