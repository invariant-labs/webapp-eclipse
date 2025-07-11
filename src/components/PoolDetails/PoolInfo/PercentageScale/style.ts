import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{
  leftPercentage: number
  colorLeft: string
  colorRight: string
}>()((theme, { leftPercentage, colorLeft, colorRight }) => ({
  icon: {
    borderRadius: '100%',
    height: 36,
    width: 36,
    [theme.breakpoints.down(1040)]: {
      height: 28,
      width: 28
    }
  },
  dot: {
    backgroundColor: colors.invariant.textGrey,
    borderRadius: '100%',
    height: 10,
    width: 10
  },
  scaleContainer: {
    backgroundColor: colorRight,
    height: 6,
    flex: 1,
    position: 'relative'
  },
  leftScale: {
    backgroundColor: colorLeft,
    height: 6,
    width: `${leftPercentage}%`, // Fixed usage of leftPercentage
    position: 'absolute',
    borderRadius: 6,
    left: 0,
    top: 0
  },
  leftDot: {
    position: 'absolute',
    left: -5,
    top: -2,
    zIndex: 1,
    backgroundColor: colorLeft || colors.invariant.textGrey
  },
  rightDot: {
    position: 'absolute',
    right: -5,

    top: -2,
    zIndex: 1,
    backgroundColor: colorRight || colors.invariant.textGrey
  }
}))

export default useStyles
