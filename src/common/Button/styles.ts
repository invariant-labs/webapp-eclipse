import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'
import { FontData } from './Button'
import { alpha } from '@mui/material'

type StyleProps = {
  scheme: 'normal' | 'green' | 'pink' | 'rainbow' | 'grey'
  height?: string | number
  width?: string | number
  fontData?: FontData
  borderRadius?: string | number
  padding?: string | number
  margin?: string | number
  gap?: string | number
}

const getStyles = (scheme: 'normal' | 'green' | 'pink' | 'rainbow' | 'grey') => {
  switch (scheme) {
    case 'normal':
      return {
        background: colors.invariant.normal,
        color: colors.invariant.text,
        backgroundHover: colors.invariant.light,
        boxShadow: colors.invariant.light
      }
    case 'green':
      return {
        background: colors.invariant.greenLinearGradient,
        color: colors.invariant.newDark,
        backgroundHover: colors.invariant.greenLinearGradient,
        boxShadow: 'rgba(46, 224, 154, 0.5)'
      }
    case 'pink':
      return {
        background: colors.invariant.pinkLinearGradient,
        color: colors.invariant.newDark,
        backgroundHover: colors.invariant.pinkLinearGradient,
        boxShadow: 'rgba(239, 132, 245, 0.5)'
      }
    case 'rainbow':
      return {
        color: colors.invariant.text,
        boxShadow: colors.invariant.light
      }
    case 'grey':
      return {
        background: colors.invariant.greyLinearGradinet,
        color: colors.invariant.dark,
        backgroundHover: colors.invariant.greyLinearGradinet,
        boxShadow: alpha('#A9B6BF', 0.25)
      }
  }
}

const useStyles = makeStyles<StyleProps>()(
  (_theme, { scheme, height, width, borderRadius, padding, margin, fontData, gap }) => ({
    button: {
      zIndex: 1,
      gap: gap ?? 0,
      height: height ?? 40,
      width: width ?? 'auto',
      minWidth: 0,
      margin: margin ?? '0',
      padding: padding ?? '0 12px',
      background: getStyles(scheme).background,
      color: getStyles(scheme).color,
      borderRadius: borderRadius ?? 14,
      textTransform: 'none',
      ...(fontData ? fontData : typography.body1),
      '&:hover': {
        boxShadow: `0 0 12px ${getStyles(scheme).boxShadow}`,
        ...(scheme === 'rainbow' ? {} : { background: getStyles(scheme).backgroundHover })
      },

      '&.Mui-disabled': {
        pointerEvents: 'auto',
        color: colors.invariant.textGrey,
        boxShadow: 'none',
        background: colors.invariant.light,
        cursor: 'not-allowed'
      }
    },

    buttonRainbowBorder: {
      border: '2px solid transparent',
      backgroundImage: `linear-gradient(${colors.invariant.normal}, ${colors.invariant.normal}), linear-gradient(0deg, ${colors.invariant.green}, ${colors.invariant.pink})`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    }
  })
)

export default useStyles
