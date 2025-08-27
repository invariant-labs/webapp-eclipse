import { useStyles } from './styles'

export function EmptyRow() {
  const { classes } = useStyles()

  return <div className={classes.emptyRow}></div>
}
