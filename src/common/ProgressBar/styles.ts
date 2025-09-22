import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{
  percentage: number
  progressBarColor?: string
  centerTextColor?: string
  height?: string | number
}>()((_theme, { percentage, progressBarColor, centerTextColor, height }) => ({
  darkBackground: {
    marginTop: 8,
    width: '100%',
    height: height ?? 24,
    backgroundColor: colors.invariant.dark,
    borderRadius: 8
  },
  gradientProgress: {
    width: '100%',
    height: height ?? 24,
    background: progressBarColor ?? colors.invariant.pinkGreenLinearGradient,
    borderRadius: 8,
    transition: 'clip-path 0.3s',
    clipPath: `inset(0 ${100 - percentage}% 0 0)`
  },
  barWrapper: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  sliderLabel: {
    display: 'flex',
    ...typography.caption1,
    color: colors.invariant.textGrey
  },
  colorSliderLabel: {
    display: 'flex',
    ...typography.body1,
    color: centerTextColor ?? colors.invariant.green
  }
}))

export default useStyles
