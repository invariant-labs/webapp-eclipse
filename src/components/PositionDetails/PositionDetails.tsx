import SinglePositionInfo from '@components/PositionDetails/SinglePositionInfo/SinglePositionInfo'
import SinglePositionPlot from '@components/PositionDetails/SinglePositionPlot/SinglePositionPlot'
import { TickPlotPositionData } from '@common/PriceRangePlot/PriceRangePlot'
import { Box, Fade, useMediaQuery } from '@mui/material'
import {
  ADDRESSES_TO_REVERT_TOKEN_PAIRS,
  Intervals,
  NetworkType,
  REFRESHER_INTERVAL,
  USDC_MAIN,
  USDT_MAIN,
  WETH_CLOSE_POSITION_LAMPORTS_MAIN,
  WETH_CLOSE_POSITION_LAMPORTS_TEST
} from '@store/consts/static'
import { PlotTickData } from '@store/reducers/positions'
import { VariantType } from 'notistack'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStyles } from './style'
import { ILiquidityToken, INavigatePosition, TokenPriceData } from '@store/consts/types'
import {
  addressToTicker,
  formatNumberWithSuffix,
  initialXtoY,
  parseFeeToPathFee,
  ROUTES
} from '@utils/utils'
import { printBN } from '@utils/utils'
import { DECIMAL, getMaxTick, getMinTick } from '@invariant-labs/sdk-eclipse/lib/utils'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import LockLiquidityModal from '@components/Modals/LockLiquidityModal/LockLiquidityModal'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { PoolDetails } from '@containers/SinglePositionWrapper/SinglePositionWrapper'
import { PositionHeader } from './PositionHeader/PositionHeader'
import ClosePositionWarning from '@components/Modals/ClosePositionWarning/ClosePositionWarning'
import { Information } from '@components/Information/Information'
import { theme } from '@static/theme'
import { eyeYellowIcon } from '@static/icons'
import { DesktopNavigation } from './Navigation/DesktopNavigation/DesktopNavigation'
import { PaginationList } from '@common/Pagination/Pagination/Pagination'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/navigation'

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
  network: NetworkType
  isLocked: boolean
  success: boolean
  inProgress: boolean
  ethBalance: BN
  poolDetails: PoolDetails | null
  onGoBackClick: () => void
  showPoolDetailsLoader: boolean
  isPromoted: boolean
  points24: number
  isPreview: boolean
  showPositionLoader?: boolean
  isPromotedLoading: boolean
  shouldDisable: boolean
  pricesLoading: boolean
  previousPosition: INavigatePosition | null
  nextPosition: INavigatePosition | null
  positionId: string
  paginationData: {
    totalPages: number
    currentPage: number
  }
  interval: Intervals
  handleChangePagination: (page: number) => void
}

const PositionDetails: React.FC<IProps> = ({
  tokenXAddress,
  shouldDisable,
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
  network,
  isLocked,
  success,
  inProgress,
  ethBalance,
  isPreview,
  onGoBackClick,
  poolDetails,
  showPoolDetailsLoader,
  isPromoted,
  showPositionLoader = false,
  points24,
  isPromotedLoading,
  pricesLoading,
  previousPosition,
  nextPosition,
  positionId,
  paginationData,
  interval,
  handleChangePagination
}) => {
  const { classes } = useStyles()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const isMd = useMediaQuery(theme.breakpoints.down('lg'))
  const navigate = useNavigate()

  const [xToY, setXToY] = useState<boolean>(
    initialXtoY(tokenXAddress.toString(), tokenYAddress.toString())
  )

  const [isLockPositionModalOpen, setIsLockPositionModalOpen] = useState(false)

  const [refresherTime, setRefresherTime] = useState<number>(REFRESHER_INTERVAL)

  const [showPreviewInfo, setShowPreviewInfo] = useState(false)
  const [connectWalletDelay, setConnectWalletDelay] = useState(false)
  const location = useLocation()
  const dispatch = useDispatch()
  const isActive = midPrice.x >= min && midPrice.x <= max

  useEffect(() => {
    setXToY(initialXtoY(tokenXAddress.toString(), tokenYAddress.toString()))
  }, [tokenXAddress.toString(), tokenYAddress.toString()])

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

  const hasEnoughETH = useMemo(() => {
    if (network === NetworkType.Testnet) {
      return ethBalance.gte(WETH_CLOSE_POSITION_LAMPORTS_TEST)
    } else {
      return ethBalance.gte(WETH_CLOSE_POSITION_LAMPORTS_MAIN)
    }
  }, [ethBalance, network])

  const [isModalOpen, setIsModalOpen] = useState(false)

  const isFullRange = useMemo(
    () =>
      leftRange.index === getMinTick(tickSpacing) && rightRange.index === getMaxTick(tickSpacing),
    [tickSpacing, leftRange, rightRange]
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      setConnectWalletDelay(true)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (isPreview && connectWalletDelay) {
      setShowPreviewInfo(true)
    } else {
      setShowPreviewInfo(false)
    }
  }, [isPreview, connectWalletDelay])

  const usdcPrice = useMemo(() => {
    if (tokenX === null || tokenY === null) return null

    const revertDenominator = initialXtoY(tokenXAddress.toString(), tokenYAddress.toString())

    if (
      tokenXAddress.equals(USDC_MAIN.address) ||
      tokenYAddress.equals(USDC_MAIN.address) ||
      tokenXAddress.equals(USDT_MAIN.address) ||
      tokenYAddress.equals(USDT_MAIN.address)
    ) {
      return null
    }

    const shouldDisplayPrice =
      ADDRESSES_TO_REVERT_TOKEN_PAIRS.includes(tokenXAddress.toString()) ||
      ADDRESSES_TO_REVERT_TOKEN_PAIRS.includes(tokenYAddress.toString())
    if (!shouldDisplayPrice) {
      return null
    }

    const ratioToDenominator = revertDenominator ? midPrice.x : 1 / midPrice.x
    const denominatorPrice = revertDenominator ? tokenYPriceData?.price : tokenXPriceData?.price

    if (!denominatorPrice) {
      return null
    }

    return {
      token: revertDenominator ? tokenX.name : tokenY.name,
      price: ratioToDenominator * denominatorPrice
    }
  }, [midPrice.x, pricesLoading])

  return (
    <Box display='flex' flexDirection={'column'} flex={1}>
      <Information mb={3} transitionTimeout={300} shouldOpen={showPreviewInfo}>
        <Box className={classes.information}>
          <img src={eyeYellowIcon} alt='Eye' style={{ minWidth: 24 }} />
          {isSm
            ? `Viewing someone else's position. Wallet actions unavailable.`
            : `You are currently watching someone else's position. Connect your wallet or go to
              portfolio to see your positions.`}
        </Box>
      </Information>
      <Box position='relative'>
        <Fade
          in={(!!nextPosition || !!previousPosition) && !isMd}
          timeout={300}
          unmountOnExit
          mountOnEnter>
          <Box>
            <DesktopNavigation
              position={previousPosition}
              direction='left'
              onClick={() => {
                if (!previousPosition) return
                navigate(ROUTES.getPositionRoute(previousPosition.id))
              }}
              disabled={!previousPosition}
            />
          </Box>
        </Fade>
        <Box className={classes.mainContainer}>
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
          <PositionHeader
            isClosing={shouldDisable}
            tokenA={
              xToY
                ? { icon: tokenX.icon, ticker: tokenX.name }
                : { icon: tokenY.icon, ticker: tokenY.name }
            }
            tokenB={
              xToY
                ? { icon: tokenY.icon, ticker: tokenY.name }
                : { icon: tokenX.icon, ticker: tokenX.name }
            }
            fee={+printBN(fee, DECIMAL - 2)}
            isPromoted={isPromoted}
            poolAddress={poolAddress.toString()}
            networkUrl={networkUrl}
            isLocked={isLocked}
            isActive={isActive}
            hasEnoughETH={hasEnoughETH}
            hasFees={tokenX.claimValue + tokenY.claimValue > 0}
            onReverseTokensClick={() => setXToY(!xToY)}
            onClosePositionClick={() => {
              if (!userHasStakes) {
                closePosition()
              } else {
                setIsModalOpen(true)
                blurContent()
              }
            }}
            onAddPositionClick={() => {
              const address1 = addressToTicker(network, tokenXAddress.toString())
              const address2 = addressToTicker(network, tokenYAddress.toString())
              const parsedFee = parseFeeToPathFee(fee)
              const isXtoY = initialXtoY(tokenXAddress.toString(), tokenYAddress.toString())
              const tokenA = isXtoY ? address1 : address2
              const tokenB = isXtoY ? address2 : address1

              dispatch(actions.setNavigation({ address: location.pathname }))
              navigate(ROUTES.getNewPositionRoute(tokenA, tokenB, parsedFee))
            }}
            onRefreshClick={() => onRefresh()}
            onGoBackClick={() => onGoBackClick()}
            onLockClick={() => {
              setIsLockPositionModalOpen(true)
              blurContent()
            }}
            copyPoolAddressHandler={copyPoolAddressHandler}
            isPreview={showPreviewInfo}
            nextPosition={nextPosition}
            previousPosition={previousPosition}
          />
          <Box className={classes.container}>
            <Box className={classes.leftSide}>
              <SinglePositionInfo
                onClickClaimFee={onClickClaimFee}
                tokenX={tokenX}
                tokenY={tokenY}
                tokenXPriceData={tokenXPriceData}
                tokenYPriceData={tokenYPriceData}
                xToY={xToY}
                showFeesLoader={showFeesLoader}
                poolDetails={poolDetails}
                showPoolDetailsLoader={showPoolDetailsLoader}
                showPositionLoader={showPositionLoader}
                arePointsDistributed={isActive && isPromoted}
                points24={points24}
                poolAddress={poolAddress}
                isPreview={showPreviewInfo}
                isPromotedLoading={isPromotedLoading}
                isClosing={shouldDisable}
                interval={interval}
                isLocked={isLocked}
              />
            </Box>
            <Box className={classes.rightSide}>
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
                isFullRange={isFullRange}
                usdcPrice={usdcPrice}
                positionId={positionId}
              />
            </Box>
          </Box>
        </Box>
        <Fade
          in={(!!nextPosition || !!previousPosition) && !isMd}
          timeout={300}
          unmountOnExit
          mountOnEnter>
          <Box>
            <DesktopNavigation
              position={nextPosition}
              direction='right'
              onClick={() => {
                if (!nextPosition) return
                navigate(ROUTES.getPositionRoute(nextPosition.id))
              }}
              disabled={!nextPosition}
            />
          </Box>
        </Fade>
      </Box>
      <Fade in={!!(previousPosition || nextPosition)}>
        <Box className={classes.paginationWrapper}>
          <PaginationList
            pages={paginationData.totalPages}
            defaultPage={paginationData.currentPage + 1}
            handleChangePage={handleChangePagination}
            variant='center'
            page={paginationData.currentPage}
          />
        </Box>
      </Fade>
    </Box>
  )
}

export default PositionDetails
