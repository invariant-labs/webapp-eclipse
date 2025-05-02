import { Grid } from '@mui/material'
import { useStyles } from './style'

export interface IGradientBorder {
  children: React.ReactNode
  borderWidth: number
  borderColor?: string
  opacity?: number
  innerClassName?: string
  backgroundColor?: string
  borderRadius: number
}

const GradientBorder: React.FC<IGradientBorder> = ({
  children,
  borderColor,
  borderWidth,
  opacity,
  innerClassName,
  backgroundColor,
  borderRadius
}) => {
  const { classes, cx } = useStyles({
    borderWidth,
    borderColor,
    opacity,
    backgroundColor,
    borderRadius
  })

  return (
    <Grid container className={classes.rootContainer}>
      <Grid container className={classes.positionAbsolute}>
        <Grid container className={cx(classes.gradientContainer, classes.gradient)} />
      </Grid>

      <Grid
        container
        className={cx(
          classes.gradientContainer,
          classes.noBackground,
          classes.innerContainer,
          innerClassName
        )}
        style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Grid>
    </Grid>
  )
}

export default GradientBorder
