import { Grid } from '@mui/material'
import useStyles from './style'
import { BitzNumbers } from './BitzNumbers/BitzNumbers'
import { BitzChart } from './BitzChart/BitzChart'
import { BitzMarketData } from '@store/reducers/sBitz'

interface BitzStatsProps {
  isLoading: boolean
  stats: BitzMarketData
}

export const BitzStats: React.FC<BitzStatsProps> = ({ isLoading, stats }) => {
  const { classes } = useStyles()
  return (
    <Grid className={classes.wrapper}>
      <BitzChart
        isLoading={isLoading}
        bitzAmount={stats.bitzAmount ?? 0}
        sbitzAmount={stats.sBitzAmount ?? 0}
        totalSupply={stats.totalSupply ?? 0}
      />
      <BitzNumbers
        isLoading={isLoading}
        marketCap={stats.marketCap ?? 0}
        supply={stats.sBitzSupply ?? 0}
        holder={stats.holders ?? 0}
      />
    </Grid>
  )
}
