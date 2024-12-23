import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{
  borderWidth: number
  borderColor?: string
  opacity?: number
  backgroundColor?: string
  borderRadius: number
}>()((_theme, { borderWidth, borderColor, opacity, backgroundColor, borderRadius }) => ({
  rootContainer: {
    position: 'relative',
    width: '100%'
  },
  gradientContainer: {
    boxSizing: 'border-box',
    borderRadius: `calc((${borderWidth}px / 2) + ${borderRadius}px)`,
    padding: borderWidth ?? 1
  },
  gradient: {
    background:
      borderColor ??
      `linear-gradient(to bottom, ${colors.invariant.green}, ${colors.invariant.pink})`,
    opacity: opacity ?? 1,

    '&::before': {
      content: '""',
      position: 'absolute',
      top: borderWidth ?? 1,
      left: borderWidth ?? 1,
      right: borderWidth ?? 1,
      bottom: borderWidth ?? 1,
      borderRadius: borderRadius ?? 10,
      background: backgroundColor ?? colors.invariant.bodyBackground,
      maskComposite: 'exclude'
    }
  },
  positionAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: colors.invariant.transparentBcg,
    borderRadius: `calc((${borderWidth}px / 2) + ${borderRadius}px)`
  },
  innerContainer: {
    borderRadius: borderRadius ?? 10,
    overflow: 'visible'
  },
  noBackground: {
    background: 'transparent'
  }
}))
