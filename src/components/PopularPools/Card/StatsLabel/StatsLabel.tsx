import { Box, Grid, Skeleton, Typography } from '@mui/material'
import { useStyles } from './style'
import { PopularPoolData } from '@containers/PopularPoolsWrapper/PopularPoolsWrapper'
import GradientBorder from '@components/GradientBorder/GradientBorder'
import { colors } from '@static/theme'
import cardBackgroundBottom from '@static/png/cardBackground1.png'
import cardBackgroundTop from '@static/png/cardBackground2.png'
import icons from '@static/icons'
import SwapList from '@static/svg/swap-list.svg'
import { shortenAddress } from '@utils/uiUtils'

export interface IStatsLabel {
  title: string
  value: string
}

const StatsLabel: React.FC<IStatsLabel> = ({ title, value }) => {
  const { classes } = useStyles()

  return (
    <Grid container className={classes.container}>
      <Typography className={classes.title}>{title} </Typography>
      <Typography className={classes.value}>{value} </Typography>
    </Grid>
  )
}

export default StatsLabel
