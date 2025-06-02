import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ exposure: number }>()((_theme, { exposure }) => {
  return {
    skeletonExp: {
      display: 'flex',
      justifyContent: 'center',
      gap: '6px',
      alignItems: 'center',
      flexDirection: 'row',
      width: '100%'
    },

    mainWrapper: {
      maxWidth: 605,
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        maxWidth: '100%'
      }
    },
    exposureWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    boxWrapper: {
      gap: '8px',
      alignItems: 'center',
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '14px',
      width: '100%',
      height: '239px',
      border: '1px solid #EF84F540',
      justifyContent: 'space-between',
      background: '#111931',
      [theme.breakpoints.down('sm')]: {
        padding: '16px 8px'
      }
    },
    header: {
      alignItems: 'center',
      display: 'flex',
      gap: 8,

      '& p': {
        color: colors.invariant.textGrey,
        ...typography.heading4
      },
      '& img': {
        width: 14
      }
    },
    sliderWrapper: {
      display: 'flex',

      width: 320,
      [theme.breakpoints.down('sm')]: {
        width: 240
      }
    },
    slider: {
      minWidth: '100%',

      '& .slick-slide': {
        paddingTop: '10px',
        display: 'flex',
        justifyContent: 'center'
      },

      '& .slick-arrow': {
        height: '20px',
        [theme.breakpoints.down('sm')]: {
          height: '30px'
        }
      },
      '& .slick-arrow::before': {
        fontSize: '20px',
        [theme.breakpoints.down('sm')]: {
          fontSize: '34px'
        }
      },
      '& .slick-prev': {
        left: -20,
        [theme.breakpoints.down('sm')]: {
          left: -21
        }
      },
      '& .slick-next': {
        right: -20,
        [theme.breakpoints.down('sm')]: {
          right: -21
        }
      },
      '& .slick-next.slick-disabled, & .slick-prev.slick-disabled': {
        filter: 'grayscale(100%)',
        opacity: 0.2
      },
      '.slick-prev::before, .slick-next::before': {
        display: 'none !important',
        content: '""" !important"'
      }
    },

    sliderItem: {
      width: 64,
      height: 64,
      borderRadius: '6px'
    },
    darkBackground: {
      width: '100%',
      height: 28,
      backgroundColor: colors.invariant.dark,
      border: `2px solid ${colors.invariant.component}`,

      borderRadius: 8
    },
    gradientProgress: {
      height: '100%',
      width: `${exposure}%`,
      background: colors.invariant.pinkGreenLinearGradient,
      border: `${exposure > 0 ? 2 : 0}px solid ${colors.invariant.component}`,
      borderRadius: 8,
      transition: 'width 0.3s'
    },
    expLabel: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      '& p': {
        ...typography.caption1,
        color: colors.invariant.textGrey
      }
    },
    expWrapper: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      gap: '6px',
      width: '100%',
      '& h5': {
        ...typography.body1,
        color: colors.invariant.text
      },
      '& span': {
        color: colors.invariant.pink
      }
    },
    separator: {
      height: '2px',
      width: '100%',
      background: colors.invariant.light
    },
    checkIcon: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 24,
      height: 24
    },

    tooltipTitle: { '& p': { ...typography.body2, color: colors.invariant.textGrey } }
  }
})

export default useStyles
