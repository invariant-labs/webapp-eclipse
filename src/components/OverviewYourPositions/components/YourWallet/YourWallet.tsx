import React, { useMemo } from 'react'
import { Box, Typography, Skeleton } from '@mui/material'
import { useStyles } from './styles'
import { PoolItem } from '../PoolItem/PoolItem'
import { TokenPool } from '@store/types/userOverview'
import { useDebounceLoading } from '@store/hooks/userOverview/useDebounceLoading'

interface YourWalletProps {
  pools: TokenPool[]
  isLoading: boolean
  onAddToPool?: (poolId: string) => void
}

export const YourWallet: React.FC<YourWalletProps> = ({ pools = [], onAddToPool, isLoading }) => {
  const { classes } = useStyles()
  const totalValue = useMemo(() => pools.reduce((sum, pool) => sum + pool.value, 0), [pools])

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <Typography className={classes.headerText}>Your Wallet</Typography>
        {isLoading ? (
          <Skeleton variant='text' width={120} height={32} />
        ) : (
          <Typography className={classes.headerText}>
            ${totalValue.toLocaleString().replace(',', '.')}
          </Typography>
        )}
      </Box>

      <Box className={classes.poolsGrid}>
        {pools.map(pool => (
          <PoolItem key={pool.id.toString()} pool={pool} onAddClick={onAddToPool} />
        ))}
      </Box>
    </Box>
  )
}
