import { Box, Grid, Typography } from '@mui/material'
import { typography, colors, theme } from '@static/theme'
import { YourWallet } from './components/YourWallet/YourWallet'
import { useSelector } from 'react-redux'
import { swapTokens } from '@store/selectors/solanaWallet'
import { useProcessedTokens } from '@store/hooks/userOverview/useProcessedToken'

export const UserOverview = () => {
  const tokensList = useSelector(swapTokens)
  const { processedPools, isLoading } = useProcessedTokens(tokensList)

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
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          [theme.breakpoints.down('lg')]: {
            flexDirection: 'column'
          }
        }}>
        {/* <Overview poolAssets={data} isLoading={false} /> */}
        <YourWallet pools={processedPools} isLoading={isLoading} />
        <YourWallet pools={processedPools} isLoading={isLoading} />
      </Box>
    </Box>
  )
}
