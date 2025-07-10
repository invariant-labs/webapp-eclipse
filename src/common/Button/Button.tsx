import { ButtonProps, Button as MuiButton } from '@mui/material'
import useStyles from './styles'
export type FontData = {
  fontSize: number
  lineHeight: string
  fontWeight: number
}
type Props = {
  scheme: 'normal' | 'green' | 'pink' | 'rainbow' | 'grey'
  disabled?: boolean
  margin?: string | number
  height?: string | number
  fontData?: FontData
  width?: string | number
  borderRadius?: string | number
  padding?: string | number
  children: React.ReactNode
  gap?: string | number
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
  gap,
  ...props
}: Props) => {
  const { classes, cx } = useStyles({
    scheme,
    height,
    width,
    borderRadius,
    padding,
    margin,
    fontData,
    gap
  })

  return (
    <MuiButton
      disabled={disabled}
      className={cx(classes.button, {
        [classes.buttonRainbowBorder]: scheme === 'rainbow'
      })}
      {...props}>
      {children}
    </MuiButton>
  )
}
