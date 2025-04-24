import { ButtonProps, Button as MuiButton } from '@mui/material'
import useStyles from './styles'
import classNames from 'classnames'
export type FontData = {
  fontSize: number
  lineHeight: string
  fontWeight: number
}
type Props = {
  scheme: 'normal' | 'green' | 'pink' | 'rainbow'
  disabled?: boolean
  margin?: string | number
  height?: string | number
  fontData?: FontData
  width?: string | number
  borderRadius?: string | number
  padding?: string | number
  children: React.ReactNode
} & ButtonProps

export const Button = ({
  scheme,
  disabled,
  height,
  margin,
  width,
  fontData,
  borderRadius,
  padding,
  children,
  ...props
}: Props) => {
  const { classes } = useStyles({ scheme, height, width, borderRadius, padding, margin, fontData })

  return (
    <MuiButton
      disabled={disabled}
      className={classNames(classes.button, {
        [classes.buttonRainbowBorder]: scheme === 'rainbow'
      })}
      {...props}>
      {children}
    </MuiButton>
  )
}
