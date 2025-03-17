import SinglePositionInfo from '@components/PositionDetails/SinglePositionInfo/SinglePositionInfo'
import SinglePositionPlot from '@components/PositionDetails/SinglePositionPlot/SinglePositionPlot'
import { TickPlotPositionData } from '@components/PriceRangePlot/PriceRangePlot'
import { Box } from '@mui/material'
import {
  NetworkType,
  REFRESHER_INTERVAL,
  WETH_CLOSE_POSITION_LAMPORTS_MAIN,
  WETH_CLOSE_POSITION_LAMPORTS_TEST
} from '@store/consts/static'
import { PlotTickData } from '@store/reducers/positions'
import { VariantType } from 'notistack'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ILiquidityToken } from './SinglePositionInfo/consts'
import { useStyles } from './style'
import { TokenPriceData } from '@store/consts/types'
import { addressToTicker, formatNumberWithSuffix, initialXtoY, ROUTES } from '@utils/utils'
import { printBN } from '@utils/utils'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import LockLiquidityModal from '@components/Modals/LockLiquidityModal/LockLiquidityModal'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { PoolDetails } from '@containers/SinglePositionWrapper/SinglePositionWrapper'
import { PositionHeader } from './PositionHeader/PositionHeader'
import ClosePositionWarning from '@components/Modals/ClosePositionWarning/ClosePositionWarning'

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
  poolDetails: PoolDetails | null
  onGoBackClick: () => void
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
  network,
  isLocked,
  success,
  inProgress,
  ethBalance,
  onGoBackClick,
  poolDetails
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

  const hasEnoughETH = useMemo(() => {
    if (network === NetworkType.Testnet) {
      return ethBalance.gte(WETH_CLOSE_POSITION_LAMPORTS_TEST)
    } else {
      return ethBalance.gte(WETH_CLOSE_POSITION_LAMPORTS_MAIN)
    }
  }, [ethBalance, network])

  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
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
        tokenA={
          xToY
            ? { icon: tokenX.icon, ticker: tokenY.name }
            : { icon: tokenY.icon, ticker: tokenX.name }
        }
        tokenB={
          xToY
            ? { icon: tokenY.icon, ticker: tokenX.name }
            : { icon: tokenX.icon, ticker: tokenY.name }
        }
        fee={+printBN(fee, DECIMAL - 2)}
        isPromoted={false}
        poolAddress={poolAddress.toString()}
        networkUrl={networkUrl}
        isLocked={isLocked}
        isActive={isActive}
        hasEnoughETH={hasEnoughETH}
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
          const address1 = addressToTicker(network, tokenX.name)
          const address2 = addressToTicker(network, tokenY.name)

          navigate(ROUTES.getNewPositionRoute(address1, address2, fee.toString()))
        }}
        onRefreshClick={() => onRefresh()}
        onGoBackClick={() => onGoBackClick()}
        onLockClick={() => {
          setIsLockPositionModalOpen(true)
          blurContent()
        }}
        copyPoolAddressHandler={copyPoolAddressHandler}
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
          />
        </Box>
      </Box>
    </Box>
  )
}

export default PositionDetails
