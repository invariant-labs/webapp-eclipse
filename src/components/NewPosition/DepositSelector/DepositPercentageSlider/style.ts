import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useThumbStyles = makeStyles<{ disabled: boolean }>()((_theme, { disabled }) => {
  return {
    outerCircle: {
      background: disabled ? colors.invariant.light : colors.invariant.pinkLinearGradient,
      width: 22,
      height: 22,
      borderRadius: '100%',
      padding: 5,
      boxSizing: 'border-box'
    },
    innerCircle: {
      background: 'linear-gradient(180deg, #FFFFFF 0%, #A2A2A2 100%)',
      width: 12,
      height: 12,
      borderRadius: '100%'
    }
  }
})

export const useSliderStyles = makeStyles<{
  depositPercentage: number
  disabled: boolean
}>()((_theme, { depositPercentage, disabled }) => ({
  root: {
    width: '100%'
  },
  thumb: {
    width: 'auto',
    height: 'auto',
    boxShadow: 'none !important'
  },
  rail: {
    background: disabled
      ? colors.invariant.lightGrey
      : `linear-gradient(90deg, ${colors.invariant.green} 0%, ${
          colors.invariant.green
        } ${depositPercentage}%, ${colors.invariant.light} ${depositPercentage + 1}%, ${
          colors.invariant.light
        } 100%)`,
    height: 6,
    opacity: 1
  },
  markLabel: {
    color: colors.invariant.text,
    ...typography.body1,
    marginTop: 10,
    top: 26
  },
  mark: {
    display: 'block',
    width: 12,
    height: 12,
    borderRadius: '100%',
    transform: 'translate(-6px, -6px)',

    '&[data-index="0"]': {
      background: disabled ? colors.invariant.lightGrey : colors.invariant.green
    },

    '&[data-index="1"]': {
      background: disabled
        ? colors.invariant.lightGrey
        : depositPercentage >= 50
          ? colors.invariant.green
          : colors.invariant.light
    },

    '&[data-index="2"]': {
      background: disabled
        ? colors.invariant.lightGrey
        : depositPercentage >= 100
          ? colors.invariant.green
          : colors.invariant.light
    }
  },
  valueLabel: {
    padding: '2px 15px',
    width: 300,
    height: 17,
    position: 'absolute',
    margin: 0,
    top: -8,
    borderRadius: 7,
    background: colors.invariant.light,
    maxWidth: '100%',

    '& span': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: colors.invariant.text,
      ...typography.caption1,
      minWidth: 28
    },

    '&::before': {
      display: 'none'
    }
  },
  valueLabelLabel: {
    width: 300,
    background: colors.invariant.pink
  },
  valueLabelCircle: {
    width: 120,
    background: colors.invariant.pink
  },
  valueLabelOpen: {
    width: 200,
    background: colors.invariant.pink
  }
}))
