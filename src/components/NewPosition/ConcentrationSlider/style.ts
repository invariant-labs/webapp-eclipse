import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useThumbStyles = makeStyles()(() => {
  return {
    outerCircle: {
      background: colors.invariant.pinkLinearGradient,
      width: 28,
      height: 28,
      borderRadius: '100%',
      padding: 6,
      boxSizing: 'border-box'
    },
    innerCircle: {
      background: 'linear-gradient(180deg, #FFFFFF 0%, #A2A2A2 100%)',
      width: 16,
      height: 16,
      borderRadius: '100%'
    }
  }
})

export const useSliderStyles = makeStyles<{
  valuesLength: number
  disabledRange: number
}>()((_theme, { disabledRange, valuesLength }) => ({
  root: {
    width: '100%',
    paddingBlock: 13
  },
  thumb: {
    width: 'auto',
    height: 'auto',
    boxShadow: 'none !important'
  },
  rail: {
    background: disabledRange > 0 ? colors.invariant.green : colors.invariant.greenOpacity,
    opacity: 1,
    height: 6
  },
  track: {
    background: colors.invariant.green,
    height: 6,
    border: 'none'
  },

  markLabel: {
    color: colors.invariant.text,
    ...typography.body1,
    marginTop: 10,
    top: 26,

    '&[data-index="0"]': {
      transform: 'translateX(-30%)'
    },

    [`&[data-index="${valuesLength - 1}"]`]: {
      transform: 'translateX(-90%)'
    }
  },
  mark: {
    display: 'none',

    [`&[data-index="${valuesLength - 1}"], &[data-index="0"]`]: {
      display: 'block',
      width: 14,
      height: 14,
      borderRadius: '100%',
      transform: 'translate(-6px, -6px)'
    },

    '&[data-index="0"]': {
      background: disabledRange > 0 ? colors.invariant.lightGrey : colors.invariant.green,
      opacity: 1
    },

    [`&[data-index="${valuesLength - 1}"]`]: {
      background: colors.invariant.greenOpacity
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
