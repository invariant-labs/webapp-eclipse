import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => {
  return {
    wrapper: {
      borderRadius: 10,
      backgroundColor: colors.invariant.component,
      padding: '16px 24px 16px 24px',
      flex: '1 1 0%',

      [theme.breakpoints.down('sm')]: {
        padding: '16px 8px  16px 8px '
      }
    },
    sectionTitle: {
      ...typography.heading4,
      color: colors.white.main,
      marginBottom: 24
    },
    depositAmountSectionTitle: {
      ...typography.heading4,
      color: colors.white.main
    },
    sectionWrapper: {
      borderRadius: 8,
      backgroundColor: colors.invariant.component,
      paddingTop: 0,
      width: '100%'
    },
    inputLabel: {
      ...typography.body3,
      lineHeight: '16px',
      color: colors.invariant.light,
      marginBottom: 3
    },
    selects: {
      gap: 12,
      marginBottom: 10
    },
    selectWrapper: {
      flex: '1 1 0%'
    },
    customSelect: {
      width: '100%',
      justifyContent: 'flex-start',
      border: 'none',
      backgroundColor: colors.invariant.componentBcg,
      borderRadius: 13,
      paddingInline: 13,
      height: 44,

      '& .selectArrow': {
        marginLeft: 'auto'
      },

      '&:hover': {
        backgroundColor: colors.invariant.light,
        '@media (hover: none)': {
          backgroundColor: colors.invariant.componentBcg
        }
      }
    },
    addButton: {
      height: '48px',
      width: '100%',
      margin: '30px 0',
      cursor: 'default'
    },
    hoverButton: {
      '&:hover': {
        filter: 'brightness(1.2)',
        boxShadow: `0 0 10px ${colors.invariant.pink}`,
        transition: '.2s all',
        cursor: 'pointer'
      }
    },
    arrows: {
      width: 32,
      cursor: 'pointer',

      '&:hover': {
        filter: 'brightness(2)',
        '@media (hover: none)': {
          filter: 'none'
        }
      }
    },
    connectWalletButton: {
      height: '48px !important',
      borderRadius: '16px',
      width: '100%',
      margin: '30px 0',

      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    sectionContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    },
    allFundsSwitchContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    },
    allFundsText: {
      ...typography.caption2,
      color: colors.white.main
    },
    allFundsInfo: {
      height: 14,
      width: 14,
      border: `1px solid ${colors.invariant.textGrey}`,
      color: colors.invariant.textGrey,
      borderRadius: '50%',
      fontSize: 8,
      lineHeight: '10px',
      textAlign: 'center',
      boxSizing: 'border-box',
      paddingTop: 3,
      userSelect: 'none'
    },
    sliderContainer: {
      height: 20,
      flex: 1,
      marginInline: 24,
      display: 'flex',
      alignItems: 'center'
    }
  }
})

export const useThumbStyles = makeStyles()(() => {
  return {
    outerCircle: {
      background: colors.invariant.pinkLinearGradient,
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

export const useSliderStyles = makeStyles<{ valuesLength: number; disabledRange: number }>()(
  (theme, { disabledRange, valuesLength }) => ({
    root: {
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        marginInline: '16px'
      }
    },
    thumb: {
      width: 'auto',
      height: 'auto',
      boxShadow: 'none !important'
    },
    rail: {
      background:
        disabledRange > 0
          ? `linear-gradient(90deg, ${colors.invariant.lightGrey} 0%, ${
              colors.invariant.lightGrey
            } ${disabledRange}%, ${colors.invariant.green} ${disabledRange + 1}%, ${
              colors.invariant.green
            } 100%)`
          : colors.invariant.green,
      height: 6,
      opacity: 1
    },
    track: {
      background: colors.invariant.lightGrey,
      height: 6
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
      display: 'block',
      width: 12,
      height: 12,
      borderRadius: '100%',
      transform: 'translate(-6px, -6px)',
      background: disabledRange > 0 ? colors.invariant.lightGrey : colors.invariant.green
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
  })
)
