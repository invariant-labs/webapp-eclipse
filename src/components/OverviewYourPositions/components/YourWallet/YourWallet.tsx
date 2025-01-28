import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { useStyles } from './styles'
import { PoolItem } from '../PoolItem/PoolItem'
import { TokenPool } from '@components/OverviewYourPositions/types/types'

interface YourWalletProps {
  pools: TokenPool[]
  onAddToPool?: (poolId: string) => void
}

export const YourWallet: React.FC<YourWalletProps> = ({ pools = [], onAddToPool }) => {
  const { classes } = useStyles()

  const totalValue = useMemo(() => pools.reduce((sum, pool) => sum + pool.value, 0), [pools])

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <Typography className={classes.headerText}>Your Wallet</Typography>
        <Typography className={classes.headerText}>
          ${totalValue.toLocaleString().replace(',', '.')}
        </Typography>
      </Box>

      <Box className={classes.poolsGrid}>
        {pools.map(pool => (
          <PoolItem key={pool.id.toString()} pool={pool} onAddClick={onAddToPool} />
        ))}
      </Box>
    </Box>
  )
}
