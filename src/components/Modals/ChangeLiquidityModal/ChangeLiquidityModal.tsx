import { Box, Button, Popover, Typography } from '@mui/material'
import useStyles from './style'
import inRangeIcon from '@static/svg/in-range.svg'
import outOfRangeIcon from '@static/svg/out-of-range.svg'
import { useEffect, useMemo, useRef, useState } from 'react'
import { unknownTokenIcon } from '@static/icons'
import { calculatePercentageRatio, formatNumberWithSuffix, numberToString } from '@utils/utils'
import { ILiquidityToken } from '@store/consts/types'
import AddLiquidity from './AddLiquidity/AddLiquidity'
import { BN } from '@coral-xyz/anchor'
import RemoveLiquidity from './RemoveLiquidity/RemoveLiquidity'
import { PublicKey } from '@solana/web3.js'
import { Status } from '@store/reducers/solanaWallet'
import { PoolWithAddress } from '@store/reducers/pools'
import { NetworkType } from '@store/consts/static'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { Tickmap } from '@invariant-labs/sdk-eclipse/lib/market'
import { Tick } from '@invariant-labs/sdk-eclipse/src/market'
import { PlotTickData } from '@store/reducers/positions'
import { closeSmallIcon } from '@static/icons'
import { Add, Remove } from '@mui/icons-material'

export interface IChangeLiquidityModal {
  open: boolean
  isAddLiquidity: boolean
  setIsAddLiquidity: (value: boolean) => void
  tokenX: ILiquidityToken
  tokenY: ILiquidityToken
  xToY: boolean
  inRange: boolean
  min: number
  max: number
  tvl: number
  currentPrice: number
  onClose: () => void
  tokenXAddress: PublicKey
  tokenYAddress: PublicKey
  fee: BN
  leftRange: number
  rightRange: number
  tokens: {
    assetAddress: PublicKey
    balance: BN
    tokenProgram?: PublicKey
    symbol: string
    address: PublicKey
    decimals: number
    name: string
    logoURI: string
    coingeckoId?: string
    isUnknown?: boolean
  }[]
  walletStatus: Status
  allPools: PoolWithAddress[]
  isBalanceLoading: boolean
  currentNetwork: NetworkType
  ticksLoading: boolean
  isTimeoutError: boolean
  getCurrentPlotTicks: () => void
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  getPoolData: (pair: Pair) => void
  setShouldNotUpdateRange: () => void
  autoSwapPoolData: PoolWithAddress | null
  autoSwapTicks: Tick[]
  autoSwapTickMap: Tickmap | null
  isLoadingAutoSwapPool: boolean
  isLoadingAutoSwapPoolTicksOrTickMap: boolean
  ticksData: PlotTickData[]
  changeLiquidity: (
    liquidity: BN,
    slippage: BN,
    isAddLiquidity: boolean,
    xAmount?: BN,
    yAmount?: BN
  ) => void
  swapAndAddLiquidity: (
    xAmount: BN,
    yAmount: BN,
    swapAmount: BN,
    xToY: boolean,
    byAmountIn: boolean,
    estimatedPriceAfterSwap: BN,
    crossedTicks: number[],
    swapSlippage: BN,
    positionSlippage: BN,
    minUtilizationPercentage: BN,
    poolIndex: number,
    liquidity: BN
  ) => void
  success: boolean
  inProgress: boolean
  setChangeLiquiditySuccess: (value: boolean) => void
  positionLiquidity: BN
}

export const ChangeLiquidityModal: React.FC<IChangeLiquidityModal> = ({
  open,
  isAddLiquidity,
  setIsAddLiquidity,
  tokenX,
  tokenY,
  xToY,
  inRange,
  min,
  max,
  tvl,
  currentPrice,
  onClose,
  tokenXAddress,
  tokenYAddress,
  fee,
  leftRange,
  rightRange,
  tokens,
  walletStatus,
  allPools,
  currentNetwork,
  ticksLoading,
  isBalanceLoading,
  getCurrentPlotTicks,
  onConnectWallet,
  onDisconnectWallet,
  getPoolData,
  setShouldNotUpdateRange,
  autoSwapPoolData,
  autoSwapTicks,
  autoSwapTickMap,
  isLoadingAutoSwapPool,
  isLoadingAutoSwapPoolTicksOrTickMap,
  ticksData,
  changeLiquidity,
  swapAndAddLiquidity,
  success,
  inProgress,
  setChangeLiquiditySuccess,
  positionLiquidity
}) => {
  const { classes, cx } = useStyles({ isAddLiquidity })

  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const { tokenXPercentage, tokenYPercentage } = useMemo(
    () =>
      calculatePercentageRatio(
        tokenX.liqValue,
        tokenY.liqValue,
        xToY ? currentPrice : 1 / currentPrice,
        xToY
      ),
    [tokenX, tokenY, currentPrice, xToY]
  )

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current?.offsetWidth)
    }
  }, [ref.current, tokenXPercentage, tokenYPercentage])

  return (
    <Popover
      open={open}
      onClose={onClose}
      classes={{ root: classes.root, paper: classes.paper }}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'center'
      }}
      anchorReference='none'>
      <Box className={classes.container}>
        <Box className={classes.headerContainer}>
          <Typography className={classes.headerTitle}>Change liquidity</Typography>
          <Box className={classes.closeIconContainer} onClick={() => onClose()}>
            <img className={classes.closeIcon} src={closeSmallIcon} alt='Close icon' />
          </Box>
        </Box>
        <Box className={classes.switch}>
          <Box className={classes.marker}></Box>
          <Button
            className={cx(classes.switchButton, { [classes.switchButtonActive]: isAddLiquidity })}
            onClick={() => setIsAddLiquidity(true)}>
            <Add />
            Add liquidity
          </Button>
          <Button
            className={cx(classes.switchButton, { [classes.switchButtonActive]: !isAddLiquidity })}
            onClick={() => setIsAddLiquidity(false)}>
            <Remove />
            Remove liquidity
          </Button>
        </Box>
        <Box className={classes.wrapper}>
          <Typography className={classes.title}>Current position</Typography>
          <Box className={classes.card}>
            <Box className={classes.row}>
              <Box className={cx(classes.stat, classes.statFull)}>
                <Typography className={classes.statTitle}>
                  {xToY ? tokenY.name : tokenX.name} per {xToY ? tokenX.name : tokenY.name}
                </Typography>
                <Box className={classes.statDescription}>
                  {formatNumberWithSuffix(min)} - {formatNumberWithSuffix(max)}
                  <Box className={classes.rangeWrapper} style={{ width }}>
                    <Box
                      className={cx(classes.rangeContainer, {
                        [classes.inRangeContainer]: inRange
                      })}>
                      <img
                        src={inRange ? inRangeIcon : outOfRangeIcon}
                        alt={inRange ? 'in range icon' : 'out of range icon'}
                      />
                      {inRange ? 'In range' : 'Out of range'}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box className={cx(classes.row, classes.rowMobile)}>
              <Box className={cx(classes.stat, classes.statMobile)}>
                <Typography className={classes.statTitle}>TVL</Typography>
                <Box className={cx(classes.statDescription, classes.statDescriptionMobile)}>
                  $
                  {+formatNumberWithSuffix(tvl, { noDecimals: true, decimalsAfterDot: 18 }) < 1000
                    ? (+formatNumberWithSuffix(tvl, {
                        noDecimals: true,
                        decimalsAfterDot: 18
                      })).toFixed(2)
                    : formatNumberWithSuffix(tvl)}
                </Box>
              </Box>
              <Box className={cx(classes.stat, classes.statMobile)}>
                <Typography className={classes.statTitle}>Current price</Typography>
                <Box className={cx(classes.statDescription, classes.statDescriptionMobile)}>
                  {numberToString(currentPrice.toFixed(xToY ? tokenY.decimal : tokenX.decimal))}
                </Box>
              </Box>
              <Box className={cx(classes.stat, classes.statMobile)}>
                <Typography className={classes.statTitle}>Deposit ratio</Typography>
                <Box
                  className={cx(classes.statDescription, classes.statDescriptionMobile)}
                  ref={ref}>
                  <Box className={classes.depositRatioContainer}>
                    <img
                      className={classes.token}
                      src={(xToY ? tokenY.icon : tokenX.icon) || unknownTokenIcon}
                      alt={`${xToY ? tokenY.icon : tokenX.icon} icon`}
                    />
                    {tokenYPercentage}% /
                    <img
                      className={classes.token}
                      src={(xToY ? tokenX.icon : tokenY.icon) || unknownTokenIcon}
                      alt={`${xToY ? tokenX.icon : tokenY.icon} icon`}
                    />
                    {tokenXPercentage}%
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box className={classes.wrapper}>
          {isAddLiquidity ? (
            <AddLiquidity
              tokenFrom={tokenXAddress}
              tokenTo={tokenYAddress}
              fee={fee}
              leftRange={leftRange}
              rightRange={rightRange}
              tokens={tokens}
              walletStatus={walletStatus}
              allPools={allPools}
              isBalanceLoading={isBalanceLoading}
              currentNetwork={currentNetwork}
              ticksLoading={ticksLoading}
              getCurrentPlotTicks={getCurrentPlotTicks}
              onConnectWallet={onConnectWallet}
              onDisconnectWallet={onDisconnectWallet}
              getPoolData={getPoolData}
              setShouldNotUpdateRange={setShouldNotUpdateRange}
              autoSwapPoolData={autoSwapPoolData}
              autoSwapTicks={autoSwapTicks}
              autoSwapTickMap={autoSwapTickMap}
              isLoadingAutoSwapPool={isLoadingAutoSwapPool}
              isLoadingAutoSwapPoolTicksOrTickMap={isLoadingAutoSwapPoolTicksOrTickMap}
              ticksData={ticksData}
              changeLiquidity={changeLiquidity}
              swapAndAddLiquidity={swapAndAddLiquidity}
              success={success}
              inProgress={inProgress}
              setChangeLiquiditySuccess={setChangeLiquiditySuccess}
              tokenXLiquidity={tokenX.liqValue}
              tokenYLiquidity={tokenY.liqValue}
            />
          ) : (
            <RemoveLiquidity
              tokenFrom={tokenXAddress}
              tokenTo={tokenYAddress}
              fee={fee}
              leftRange={leftRange}
              rightRange={rightRange}
              tokenXLiquidity={tokenX.liqValue}
              tokenYLiquidity={tokenY.liqValue}
              tokens={tokens}
              walletStatus={walletStatus}
              allPools={allPools}
              isBalanceLoading={isBalanceLoading}
              currentNetwork={currentNetwork}
              ticksLoading={ticksLoading}
              getCurrentPlotTicks={getCurrentPlotTicks}
              onConnectWallet={onConnectWallet}
              onDisconnectWallet={onDisconnectWallet}
              getPoolData={getPoolData}
              setShouldNotUpdateRange={setShouldNotUpdateRange}
              changeLiquidity={changeLiquidity}
              success={success}
              inProgress={inProgress}
              setChangeLiquiditySuccess={setChangeLiquiditySuccess}
              positionLiquidity={positionLiquidity}
            />
          )}
        </Box>
      </Box>
    </Popover>
  )
}
