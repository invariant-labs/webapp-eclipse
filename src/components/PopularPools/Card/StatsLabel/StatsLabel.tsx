import { Grid, Typography } from '@mui/material'
import { useStyles } from './style'

export interface IStatsLabel {
  title: string
  value: string
  disableShadow?: boolean
}

const StatsLabel: React.FC<IStatsLabel> = ({ title, value, disableShadow }) => {
  const { classes } = useStyles({ disableShadow })

  return (
    <Grid container className={classes.container}>
      <Typography className={classes.title}>{title} </Typography>
      <Typography className={classes.value}>{value} </Typography>
    </Grid>
  )
}

export default StatsLabel
