import { Box, Typography } from '@mui/material'
import { warningIcon } from '@static/icons'
import { TokenPool, StrategyConfig } from '@store/types/userOverview'
import { formatNumberWithoutSuffix } from '@utils/utils'
import { useStyles } from './styles'
import { ActionButtons } from './ActionButtons/ActionButtons'
import { NetworkType } from '@store/consts/static'

export const MobileCard: React.FC<{
  pool: TokenPool
  getStrategy: () => StrategyConfig
  currentNetwork: NetworkType
}> = ({ pool, getStrategy, currentNetwork }) => {
  const { classes } = useStyles({})
  const strategy = getStrategy()
  return (
    <Box className={classes.mobileCard}>
      <Box className={classes.mobileCardHeader}>
        <Box className={classes.mobileTokenInfo} sx={{ position: 'relative' }}>
          <img src={pool.icon} className={classes.tokenIcon} alt={pool.symbol} />
          {pool.isUnknown && <img className={classes.warningIcon} src={warningIcon} />}

          <Typography className={classes.tokenSymbol}>{pool.symbol}</Typography>
        </Box>
        <Box className={classes.mobileActionsContainer}>
          <ActionButtons pool={pool} strategy={strategy} currentNetwork={currentNetwork} />
        </Box>
      </Box>
      <Box className={classes.mobileStatsContainer}>
        <Box className={classes.mobileStatItem}>
          <Typography component='span' className={classes.mobileStatLabel}>
            Amount:
          </Typography>
          <Typography component='span' className={classes.mobileStatValue}>
            {formatNumberWithoutSuffix(pool.amount)}
          </Typography>
        </Box>
        <Box className={classes.mobileStatItem}>
          <Typography component='span' className={classes.mobileStatLabel}>
            Value:
          </Typography>
          <Typography component='span' className={classes.mobileStatValue}>
            ${pool.value.toFixed(2).toLocaleString().replace(',', '.')}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
