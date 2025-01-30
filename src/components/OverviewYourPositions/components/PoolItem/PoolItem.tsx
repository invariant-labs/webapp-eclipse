import React from 'react'
import { Box, Typography } from '@mui/material'
import icons from '@static/icons'
import { usePoolItemStyles } from './styles'
import { useNavigate } from 'react-router-dom'
import { TokenPool } from '@store/types/userOverview'
import { STRATEGIES } from '@store/consts/userStrategies'

interface PoolItemProps {
  pool: TokenPool
  onAddClick?: (poolId: string) => void
}

export const PoolItem: React.FC<PoolItemProps> = ({ pool }) => {
  const navigate = useNavigate()
  const { classes } = usePoolItemStyles()

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = icons.unknownToken
  }

  const strategy = STRATEGIES.find(
    s => s.tokenSymbolA === pool.symbol || s.tokenSymbolB === pool?.symbol
  )

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
        onClick={() => {
          navigate(
            `/newPosition/${strategy?.tokenSymbolA}/${strategy?.tokenSymbolB}/${strategy?.feeTier}`
          )
        }}>
        <img src={icons.plusIcon} height={24} width={24} alt='Add' />
      </Box>
    </Box>
  )
}
