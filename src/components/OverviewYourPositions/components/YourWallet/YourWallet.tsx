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
  const debouncedIsLoading = useDebounceLoading(isLoading)

  const totalValue = useMemo(() => pools.reduce((sum, pool) => sum + pool.value, 0), [pools])

  // const shouldShowSkeletons = debouncedIsLoading

  // const renderSkeletons = () => {
  //   return Array(2)
  //     .fill(null)
  //     .map((_, index) => (
  //       <Box key={`skeleton-${index}`} className={classes.skeletonItem}>
  //         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
  //           <Skeleton variant='circular' width={40} height={40} />
  //           <Box sx={{ flex: 1 }}>
  //             <Skeleton variant='text' width='60%' height={24} />
  //             <Skeleton variant='text' width='40%' height={20} />
  //           </Box>
  //         </Box>
  //       </Box>
  //     ))
  // }

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <Typography className={classes.headerText}>Your Wallet</Typography>
        {debouncedIsLoading ? (
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
