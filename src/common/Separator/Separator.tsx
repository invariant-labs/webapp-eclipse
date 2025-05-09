import { colors } from '@static/theme'
import { useStyles } from './styles'

type Props = {
  size?: number | string
  isHorizontal?: boolean
  color?: string
  margin?: string
}

export const Separator = ({
  size = 'auto',
  isHorizontal = false,
  color = colors.invariant.componentBcg,
  margin = '0'
}: Props) => {
  const { classes } = useStyles({ size, isHorizontal, color, margin })

  return <hr className={classes.separator} />
}
