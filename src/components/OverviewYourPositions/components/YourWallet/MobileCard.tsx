import { Box, Typography } from '@mui/material'
import { TokenPool, StrategyConfig } from '@store/types/userOverview'
import { formatNumber2 } from '@utils/utils'

export const MobileCard: React.FC<{
  pool: TokenPool
  classes: any
  renderActions: any
  getStrategy: () => StrategyConfig
}> = ({ pool, classes, renderActions, getStrategy }) => {
  const strategy = getStrategy()
  return (
    <Box className={classes.mobileCard}>
      <Box className={classes.mobileCardHeader}>
        <Box className={classes.mobileTokenInfo}>
          <img src={pool.icon} className={classes.tokenIcon} alt={pool.symbol} />
          <Typography className={classes.tokenSymbol}>{pool.symbol}</Typography>
        </Box>
        <Box className={classes.mobileActionsContainer}>{renderActions(pool, strategy)}</Box>
      </Box>
      <Box className={classes.mobileStatsContainer}>
        <Box className={classes.mobileStatItem}>
          <Typography component='span' className={classes.mobileStatLabel}>
            Amount:
          </Typography>
          <Typography component='span' className={classes.mobileStatValue}>
            {formatNumber2(pool.amount, { twoDecimals: true })}
          </Typography>
        </Box>
        <Box className={classes.mobileStatItem}>
          <Typography component='span' className={classes.mobileStatLabel}>
            Value:
          </Typography>
          <Typography component='span' className={classes.mobileStatValue}>
            ${pool.value.toLocaleString().replace(',', '.')}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
