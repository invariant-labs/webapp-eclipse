import { Box, Grid, Typography } from '@mui/material'
import { typography, colors } from '@static/theme'
import { Overview } from './components/Overview/Overview'
import { YourWallet } from './components/YourWallet/YourWallet'
import { useSelector } from 'react-redux'
import { swapTokens } from '@store/selectors/solanaWallet'
import { useProcessedTokens } from './hooks/useProcessedToken'

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
  const { processedPools } = useProcessedTokens(tokensList)

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
          poolAssets={poolAssets}
          isLoading={false}
          onClaimAll={handleClaimAll}
          onClaimFee={handleClaimFee}
        />
        <YourWallet pools={processedPools} onAddToPool={handleAddToPool} />
      </Box>
    </Box>
  )
}
