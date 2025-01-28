import React from 'react'
import { Box, Typography } from '@mui/material'
import icons from '@static/icons'
import { usePoolItemStyles } from './styles'
import { TokenPool } from '@components/OverviewYourPositions/types/types'

interface PoolItemProps {
  pool: TokenPool
  onAddClick?: (poolId: string) => void
}

export const PoolItem: React.FC<PoolItemProps> = ({ pool, onAddClick }) => {
  const { classes } = usePoolItemStyles()

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = icons.unknownToken
  }

  return (
    <Box className={classes.container}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={pool.icon}
          className={classes.tokenIcon}
          onError={handleImageError}
          alt={pool.symbol}
        />
      </Box>

      <Box sx={{ justifySelf: 'flex-start' }}>
        <Typography className={classes.tokenSymbol}>{pool.symbol}</Typography>
      </Box>

      <Box className={classes.statsContainer}>
        <Typography className={classes.statsLabel}>Value</Typography>
        <Typography className={classes.statsValue}>
          {pool.value.toLocaleString().replace(',', '.')} USD
        </Typography>
      </Box>

      <Box className={classes.statsContainer}>
        <Typography className={classes.statsLabel}>Amount</Typography>
        <Typography className={classes.statsValue}>{pool.amount.toFixed(3)}</Typography>
      </Box>

      <Box
        sx={{ display: 'flex', alignItems: 'center' }}
        className={classes.actionIcon}
        onClick={() => onAddClick?.(pool.id)}>
        <img src={icons.plusIcon} height={24} width={24} alt='Add' />
      </Box>
    </Box>
  )
}
