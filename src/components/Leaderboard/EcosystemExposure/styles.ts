import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ exposure: number }>()((_theme, { exposure }) => {
  return {
    mainWrapper: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      maxWidth: '524px',
      width: '98%',
      marginTop: 24,
      gap: 24,
      '& p': {
        color: colors.invariant.text,
        ...typography.heading3
      }
    },
    boxWrapper: {
      alignItems: 'center',
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      borderRadius: '14px',
      width: '100%',
      height: '194px',
      border: '1px solid #EF84F540',
      background: colors.invariant.component
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
      }
    },
    sliderItem: {
      width: 64,
      height: 64,
      borderRadius: '6px'
    },
    darkBackground: {
      width: '100%',
      height: 31,
      backgroundColor: colors.invariant.dark,
      borderRadius: 8
    },
    gradientProgress: {
      height: '100%',
      width: `${exposure}%`,
      background: colors.invariant.pinkGreenLinearGradient,
      borderRadius: 8,
      transition: 'width 0.5s'
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
      flexDirection: 'column',
      gap: 8,
      width: '100%'
    },
    separator: {
      height: '2px',
      width: '100%',
      background: colors.invariant.light
    },
    tooltipTitle: { '& p': { ...typography.body2, color: colors.invariant.textGrey } }
  }
})

export default useStyles
