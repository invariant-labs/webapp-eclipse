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

interface IProp {
  onClickClaimFee: () => void
  tokenX: ILiquidityToken
  tokenY: ILiquidityToken
  tokenXPriceData?: TokenPriceData
  tokenYPriceData?: TokenPriceData
  xToY: boolean
  showFeesLoader?: boolean
  poolDetails: PoolDetailsType | null
  showPoolDetailsLoader?: boolean
  poolAddress: PublicKey
  isPreview: boolean
  showPositionLoader?: boolean
  isClosing: boolean
  interval: Intervals
  isLocked?: boolean
  showChangeLiquidityModal: (isAddLiquidity: boolean) => void
}

const SinglePositionInfo: React.FC<IProp> = ({
  onClickClaimFee,
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
  isClosing,
  interval,
  isLocked,
  showChangeLiquidityModal
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
          value={
            tokenX.liqValue * (tokenXPriceData?.price ?? 0) +
            tokenY.liqValue * (tokenYPriceData?.price ?? 0)
          }
          pendingFees={
            tokenX.claimValue * (tokenXPriceData?.price ?? 0) +
            tokenY.claimValue * (tokenYPriceData?.price ?? 0)
          }
          poolApy={convertedApy}
          isLoading={showPositionLoader}
          showPoolDetailsLoader={showPoolDetailsLoader}
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
            isPreview ? (
              <TooltipHover title={"Can't claim fees in preview"}>
                <Button
                  className={classes.claimButton}
                  disabled={tokenX.claimValue + tokenY.claimValue === 0 || isPreview || isClosing}
                  variant='contained'
                  onClick={() => onClickClaimFee()}>
                  Claim
                </Button>
              </TooltipHover>
            ) : (
              <Button
                className={classes.claimButton}
                disabled={tokenX.claimValue + tokenY.claimValue === 0 || isPreview || isClosing}
                variant='contained'
                onClick={() => onClickClaimFee()}>
                Claim
              </Button>
            )
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
