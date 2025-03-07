import { ButtonProps, Button as MuiButton } from '@mui/material'
import useStyles from './styles'
import classNames from 'classnames'

type Props = {
  scheme: 'normal' | 'green' | 'pink' | 'rainbow'
  disabled?: boolean
  height?: string | number
  width?: string | number
  borderRadius?: string | number
  padding?: string | number
  children: React.ReactNode
} & ButtonProps

export const Button = ({
  scheme,
  disabled,
  height,
  width,
  borderRadius,
  padding,
  children,
  ...props
}: Props) => {
  const { classes } = useStyles({ scheme, height, width, borderRadius, padding })

  return (
    <MuiButton
      className={classNames(classes.button, {
        [classes.buttonDisabled]: disabled,
        [classes.buttonRainbowBorder]: scheme === 'rainbow'
      })}
      {...props}>
      {children}
    </MuiButton>
  )
}
