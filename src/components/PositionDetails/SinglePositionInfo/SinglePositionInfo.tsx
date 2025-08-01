import { Box, Button } from '@mui/material'
import { useState } from 'react'
import useStyles from './style'
import { ILiquidityToken, TokenPriceData } from '@store/consts/types'
import { Section } from './Section/Section'
import { PoolDetails } from './PoolDetails/PoolDetails'
import { UnclaimedFees } from './UnclaimedFees/UnclaimedFees'
import { Liquidity } from './Liquidity/Liquidity'
import { Separator } from '@common/Separator/Separator'
import { PositionStats } from './PositionStats/PositionStats'
import { colors } from '@static/theme'
import { PoolDetails as PoolDetailsType } from '@containers/SinglePositionWrapper/SinglePositionWrapper'
import { calculateAPYAndAPR } from '@utils/utils'
import { PublicKey } from '@solana/web3.js'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { Intervals } from '@store/consts/static'
import { Minus } from '@static/componentIcon/Minus'
import { Plus } from '@static/componentIcon/Plus'
import loadingAnimation from '@static/gif/loading.gif'

interface IProp {
  onClickClaimFee: () => void
  onClickCompound: () => void
  tokenX: ILiquidityToken
  tokenY: ILiquidityToken
  tokenXPriceData?: TokenPriceData
  tokenYPriceData?: TokenPriceData
  xToY: boolean
  showFeesLoader?: boolean
  poolDetails: PoolDetailsType | null
  showPoolDetailsLoader?: boolean
  arePointsDistributed: boolean
  points24: number
  poolAddress: PublicKey
  isPreview: boolean
  showPositionLoader?: boolean
  isPromotedLoading: boolean
  isClosing: boolean
  interval: Intervals
  isLocked?: boolean
  showChangeLiquidityModal: (isAddLiquidity: boolean) => void
  isCompundDisabled: boolean
  isSimulating: boolean
}

const SinglePositionInfo: React.FC<IProp> = ({
  onClickClaimFee,
  onClickCompound,
  tokenX,
  tokenY,
  tokenXPriceData,
  tokenYPriceData,
  xToY,
  showFeesLoader = false,
  showPositionLoader = false,
  showPoolDetailsLoader = false,
  poolDetails,
  poolAddress,
  isPreview,
  points24,
  arePointsDistributed,
  isPromotedLoading,
  isClosing,
  interval,
  isLocked,
  showChangeLiquidityModal,
  isCompundDisabled,
  isSimulating
}) => {
  const [isFeeTooltipOpen, setIsFeeTooltipOpen] = useState(false)
  const { classes, cx } = useStyles()

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
  const { convertedApy } = calculateAPYAndAPR(
    poolDetails?.apy ?? 0,
    poolAddress.toString(),
    poolDetails?.volume24 ?? 0,
    poolDetails?.fee,
    poolDetails?.tvl ?? 0
  )

  return (
    <>
      {isFeeTooltipOpen && <Overlay />}
      <Box className={classes.container}>
        <PositionStats
          isPromotedLoading={isPromotedLoading}
          value={
            tokenX.liqValue * (tokenXPriceData?.price ?? 0) +
            tokenY.liqValue * (tokenYPriceData?.price ?? 0)
          }
          pendingFees={
            tokenX.claimValue * (tokenXPriceData?.price ?? 0) +
            tokenY.claimValue * (tokenYPriceData?.price ?? 0)
          }
          poolApy={convertedApy}
          points24={points24}
          arePointsDistributed={arePointsDistributed}
          isLoading={showPositionLoader}
          showPoolDetailsLoader={showPoolDetailsLoader}
          isLocked={isLocked}
        />
        <Separator size='100%' isHorizontal color={colors.invariant.light} />
        <Section
          title='Liquidity'
          item={
            <Box className={classes.liquidityButtons}>
              <Button
                className={cx(classes.liquidityButton, {
                  [classes.liquidityButtonDisabled]: isLocked || isPreview
                })}
                disabled={isLocked || isPreview}
                onClick={() => showChangeLiquidityModal(true)}>
                <Plus />
              </Button>
              <Button
                className={cx(classes.liquidityButton, {
                  [classes.liquidityButtonDisabled]: isLocked || isPreview
                })}
                disabled={isLocked || isPreview}
                onClick={() => showChangeLiquidityModal(false)}>
                <Minus />
              </Button>
            </Box>
          }>
          <Liquidity
            tokenA={
              xToY
                ? {
                    icon: tokenX.icon,
                    ticker: tokenX.name,
                    amount: tokenX.liqValue,
                    decimal: tokenX.decimal,
                    price: tokenXPriceData?.price
                  }
                : {
                    icon: tokenY.icon,
                    ticker: tokenY.name,
                    amount: tokenY.liqValue,
                    decimal: tokenY.decimal,
                    price: tokenYPriceData?.price
                  }
            }
            tokenB={
              xToY
                ? {
                    icon: tokenY.icon,
                    ticker: tokenY.name,
                    amount: tokenY.liqValue,
                    decimal: tokenY.decimal,
                    price: tokenYPriceData?.price
                  }
                : {
                    icon: tokenX.icon,
                    ticker: tokenX.name,
                    amount: tokenX.liqValue,
                    decimal: tokenX.decimal,
                    price: tokenXPriceData?.price
                  }
            }
            isLoading={showPositionLoader}
          />
        </Section>
        <Section
          title='Unclaimed fees'
          item={
            <Box className={classes.feeButtons}>
              <TooltipHover
                title={
                  tokenX.claimValue + tokenY.claimValue === 0 ||
                  isPreview ||
                  isClosing ||
                  isCompundDisabled
                    ? 'Compound not available'
                    : ''
                }>
                <Button
                  className={classes.compoundButton}
                  disabled={
                    tokenX.claimValue + tokenY.claimValue === 0 ||
                    isPreview ||
                    isClosing ||
                    isCompundDisabled ||
                    isSimulating
                  }
                  variant='contained'
                  onClick={onClickCompound}>
                  {isSimulating ? (
                    <img
                      src={loadingAnimation}
                      style={{ height: 25, width: 25, zIndex: 10 }}
                      alt='loading'
                    />
                  ) : (
                    'Compound'
                  )}
                </Button>
              </TooltipHover>
              <TooltipHover title={isPreview ? "Can't claim fees in preview" : ''}>
                <Button
                  className={classes.claimButton}
                  disabled={tokenX.claimValue + tokenY.claimValue === 0 || isPreview || isClosing}
                  variant='contained'
                  onClick={onClickClaimFee}>
                  Claim
                </Button>
              </TooltipHover>
            </Box>
          }>
          <UnclaimedFees
            tokenA={
              xToY
                ? {
                    icon: tokenX.icon,
                    ticker: tokenX.name,
                    amount: tokenX.claimValue,
                    decimal: tokenX.decimal,
                    price: tokenXPriceData?.price
                  }
                : {
                    icon: tokenY.icon,
                    ticker: tokenY.name,
                    amount: tokenY.claimValue,
                    decimal: tokenY.decimal,
                    price: tokenYPriceData?.price
                  }
            }
            tokenB={
              xToY
                ? {
                    icon: tokenY.icon,
                    ticker: tokenY.name,
                    amount: tokenY.claimValue,
                    decimal: tokenY.decimal,
                    price: tokenYPriceData?.price
                  }
                : {
                    icon: tokenX.icon,
                    ticker: tokenX.name,
                    amount: tokenX.claimValue,
                    decimal: tokenX.decimal,
                    price: tokenXPriceData?.price
                  }
            }
            isLoading={showFeesLoader}
          />
        </Section>
        <Section title='Pool details'>
          <PoolDetails
            tvl={poolDetails?.tvl ?? 0}
            volume24={poolDetails?.volume24 ?? 0}
            fee24={poolDetails?.fee24 ?? 0}
            showPoolDetailsLoader={showPoolDetailsLoader}
            interval={interval}
          />
        </Section>
      </Box>
    </>
  )
}

export default SinglePositionInfo
