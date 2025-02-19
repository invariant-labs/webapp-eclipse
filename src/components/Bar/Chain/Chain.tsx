import { useStyles } from './style'
import icons from '@static/icons'
import { BarButton } from '../BarButton/BarButton'

export const Chain = () => {
  const { classes } = useStyles()

  return (
    <BarButton>
      <img className={classes.barButtonIcon} src={icons.Eclipse} alt='Chain icon' />
    </BarButton>
  )
}
