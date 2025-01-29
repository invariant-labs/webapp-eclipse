import { Box, Grid, Typography } from '@mui/material'
import { typography, colors } from '@static/theme'
import { Overview } from './components/Overview/Overview'
import { YourWallet } from './components/YourWallet/YourWallet'
import { useSelector } from 'react-redux'
import { swapTokens } from '@store/selectors/solanaWallet'
import { useProcessedTokens } from './hooks/useProcessedToken'
import { positionsWithPoolsData } from '@store/selectors/positions'
import { DECIMAL, printBN } from '@invariant-labs/sdk-eclipse/lib/utils'
import { ProcessedPool } from './types/types'

export const OverviewYourPositions = () => {
  const handleClaimAll = () => {
    console.log('Claiming all fees')
  }

  const handleAddToPool = (poolId: string) => {
    console.log(`Adding to pool: ${poolId}`)
  }

  const tokensList = useSelector(swapTokens)
  const { processedPools, isLoading } = useProcessedTokens(tokensList)

  const list: any = useSelector(positionsWithPoolsData)

  const data: Pick<
    ProcessedPool,
    'id' | 'fee' | 'tokenX' | 'poolData' | 'tokenY' | 'lowerTickIndex' | 'upperTickIndex'
  >[] = list.map(position => {
    return {
      id: position.id.toString() + '_' + position.pool.toString(),
      poolData: position.poolData,
      lowerTickIndex: position.lowerTickIndex,
      upperTickIndex: position.upperTickIndex,
      fee: +printBN(position.poolData.fee, DECIMAL - 2),
      tokenX: {
        decimal: position.tokenX.decimals,
        coingeckoId: position.tokenX.coingeckoId,
        balance: position.tokenX.balance,
        icon: position.tokenX.logoURI,
        name: position.tokenX.symbol
      },
      tokenY: {
        decimal: position.tokenY.decimals,
        balance: position.tokenY.balance,
        coingeckoId: position.tokenY.coingeckoId,
        icon: position.tokenY.logoURI,
        name: position.tokenY.symbol
      }
    }
  })

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
        <Overview poolAssets={data} isLoading={false} onClaimAll={handleClaimAll} />
        <YourWallet pools={processedPools} onAddToPool={handleAddToPool} isLoading={isLoading} />
      </Box>
    </Box>
  )
}
