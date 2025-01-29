import { Box, Grid, Typography } from '@mui/material'
import { typography, colors } from '@static/theme'
import { Overview } from './components/Overview/Overview'
import { YourWallet } from './components/YourWallet/YourWallet'
import { useSelector } from 'react-redux'
import { address, swapTokens } from '@store/selectors/solanaWallet'
import { useProcessedTokens } from './hooks/useProcessedToken'
import { positionsWithPoolsData } from '@store/selectors/positions'
import { DECIMAL, getMaxTick, getMinTick, printBN } from '@invariant-labs/sdk-eclipse/lib/utils'
import { IPositionItem } from '@components/PositionsList/types'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse'
import { getX, getY } from '@invariant-labs/sdk-eclipse/lib/math'
import { NetworkType } from '@store/consts/static'
import { calcYPerXPriceBySqrtPrice } from '@utils/utils'
import { ProcessedPool } from './types/types'

export const OverviewYourPositions = () => {
  const poolAssets = [
    {
      id: 1,
      fee: 13.34,
      tokenX: {
        icon: '',
        name: 'BTC'
      },
      tokenY: {
        icon: '',
        name: 'BTCx'
      },
      unclaimedFee: 234.34,
      value: 3454.23
    },
    {
      id: 2,
      fee: 23.34,
      tokenX: {
        icon: '',
        name: 'ETH'
      },
      tokenY: {
        icon: '',
        name: 'BTC'
      },
      unclaimedFee: 234.34,
      value: 3454.23
    },
    {
      id: 3,
      fee: 23.34,
      tokenX: {
        icon: '',
        name: 'SOL'
      },
      tokenY: {
        icon: '',
        name: 'BTC'
      },
      unclaimedFee: 234.34,
      value: 3454.23
    },
    {
      id: 3,
      fee: 23.34,
      tokenX: {
        icon: '',
        name: 'SOL'
      },
      tokenY: {
        icon: '',
        name: 'BTC'
      },
      unclaimedFee: 234.34,
      value: 3454.23
    }
  ]

  const handleClaimAll = () => {
    console.log('Claiming all fees')
  }

  const handleClaimFee = (feeId: number) => {
    // Handle claiming individual fee
    console.log(`Claiming fee: ${feeId}`)
  }

  const handleAddToPool = (poolId: string) => {
    console.log(`Adding to pool: ${poolId}`)
  }

  const tokensList = useSelector(swapTokens)
  const { processedPools, isLoading } = useProcessedTokens(tokensList)

  const list = useSelector(positionsWithPoolsData)
  // const walletAddress = useSelector(address)

  const data: ProcessedPool[] = list.map(position => {
    const lowerPrice = calcYPerXPriceBySqrtPrice(
      calculatePriceSqrt(position.lowerTickIndex),
      position.tokenX.decimals,
      position.tokenY.decimals
    )
    const upperPrice = calcYPerXPriceBySqrtPrice(
      calculatePriceSqrt(position.upperTickIndex),
      position.tokenX.decimals,
      position.tokenY.decimals
    )

    const minTick = getMinTick(position.poolData.tickSpacing)
    const maxTick = getMaxTick(position.poolData.tickSpacing)

    const min = Math.min(lowerPrice, upperPrice)
    const max = Math.max(lowerPrice, upperPrice)

    let tokenXLiq, tokenYLiq

    try {
      tokenXLiq = +printBN(
        getX(
          position.liquidity,
          calculatePriceSqrt(position.upperTickIndex),
          position.poolData.sqrtPrice,
          calculatePriceSqrt(position.lowerTickIndex)
        ),
        position.tokenX.decimals
      )
    } catch (error) {
      tokenXLiq = 0
    }

    try {
      tokenYLiq = +printBN(
        getY(
          position.liquidity,
          calculatePriceSqrt(position.upperTickIndex),
          position.poolData.sqrtPrice,
          calculatePriceSqrt(position.lowerTickIndex)
        ),
        position.tokenY.decimals
      )
    } catch (error) {
      tokenYLiq = 0
    }

    const currentPrice = calcYPerXPriceBySqrtPrice(
      position.poolData.sqrtPrice,
      position.tokenX.decimals,
      position.tokenY.decimals
    )

    const valueX = tokenXLiq + tokenYLiq / currentPrice
    const valueY = tokenYLiq + tokenXLiq * currentPrice

    return {
      id: position.id.toString() + '_' + position.pool.toString(),

      //
      // tokenYName: position.tokenY.symbol,
      // tokenXIcon: position.tokenX.logoURI,
      // tokenYIcon: position.tokenY.logoURI,
      // poolAddress: position.poolData.address,
      // liquidity: position.liquidity,
      // poolData: position.poolData,
      position,
      poolData: position.poolData,
      lowerTickIndex: position.lowerTickIndex,
      upperTickIndex: position.upperTickIndex,
      fee: +printBN(position.poolData.fee, DECIMAL - 2),
      tokenX: {
        decimal: position.tokenX.decimals,
        icon: position.tokenX.logoURI,
        name: position.tokenX.symbol
      },
      tokenY: {
        decimal: position.tokenY.decimals,
        icon: position.tokenY.logoURI,
        name: position.tokenY.symbol
      },
      unclaimedFee: 234.34,
      value: 343.24

      // min,
      // max,
      // position,
      // valueX,
      // valueY,
      // address: walletAddress.toString(),
      // id: position.id.toString() + '_' + position.pool.toString(),
      // isActive: currentPrice >= min && currentPrice <= max,
      // currentPrice,
      // tokenXLiq,
      // tokenYLiq,
      // isFullRange: position.lowerTickIndex === minTick && position.upperTickIndex === maxTick,
      // isLocked: position.isLocked
    }
  })

  // console.log(data)

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
      <Box>
        <Grid
          style={{
            display: 'flex',
            marginBottom: 20
          }}>
          <Typography
            style={{
              color: colors.invariant.text,
              ...typography.heading4,
              fontWeight: 500
            }}>
            Overview
          </Typography>
        </Grid>
      </Box>
      <Box sx={{ display: 'flex', gap: 4 }}>
        <Overview
          poolAssets={data}
          isLoading={false}
          onClaimAll={handleClaimAll}
          onClaimFee={handleClaimFee}
        />
        <YourWallet pools={processedPools} onAddToPool={handleAddToPool} isLoading={isLoading} />
      </Box>
    </Box>
  )
}
