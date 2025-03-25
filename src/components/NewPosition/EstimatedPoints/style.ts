import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ percentage: number }>()((theme, { percentage }) => ({
  wrapper: {
    backgroundColor: colors.invariant.component,
    borderRadius: 24,
    padding: 24,
    color: colors.invariant.text,

    [theme.breakpoints.down('sm')]: {
      padding: '16px 8px'
    }
  },
  innerWrapper: {
    display: 'flex',
    gap: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    }
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'left'
  },

  darkBackground: {
    marginTop: 8,
    marginBottom: 8,
    width: '100%',
    height: 24,
    backgroundColor: colors.invariant.dark,
    borderRadius: 8
  },
  gradientProgress: {
    width: `${percentage}%`,
    height: 24,
    background: colors.invariant.pinkGreenLinearGradient,
    borderRadius: 8,
    transition: 'width 0.3s'
  },
  infoPink: {
    width: 14,
    marginLeft: '-2px',
    marginRight: '4px',
    marginBottom: '-2px'
  },
  pointsLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    backgroundColor: colors.invariant.light,
    borderRadius: 8,
    padding: '8px 16px',
    gap: 4,
    minWidth: '120px',
    height: 32,
    fontWeight: 500,
    '& p': {
      ...typography.caption2,
      fontSize: '1rem',
      fontWeight: 500
    },
    '& img': {
      height: '16px',
      marginLeft: '-8px'
    }
  },
  pinkText: {
    color: colors.invariant.pink
  },
  questionButton: {
    margin: 0,
    border: 'none',
    textDecoration: 'none',
    background: 'none',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  link: {
    textDecoration: 'underline',
    textDecorationStyle: 'solid',
    textDecorationThickness: 'auto'
  },
  description: {
    ...typography.body2,
    marginTop: 12,
    color: colors.invariant.textGrey,
    letterSpacing: '-0.03em'
  },
  leftHeaderItems: {
    flexDirection: 'column',
    alignItems: 'flex-start',

    gap: theme.spacing(1)
  },
  warningWrapper: {
    display: 'flex',
    marginTop: '16px',
    alignItems: 'center',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginTop: '24px'
    }
  },
  barWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1)
  },
  estimatedPointsLabel: {
    whiteSpace: 'nowrap',
    ...typography.heading4,
    fontSize: '18px'
  },
  headerWrapper: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  estimatedPoints: {
    ...typography.body1,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }
  },
  warningText: {
    color: colors.invariant.warning,
    ...typography.body3,
    [theme.breakpoints.down('md')]: {
      ...typography.body2
    }
  },
  sliderLabel: {
    display: 'flex',
    ...typography.caption1,
    color: colors.invariant.textGrey
  }
}))

export const useStylesPointsLabel = makeStyles()(() => ({
  rootBackground: {
    zIndex: 13,
    width: '100vw',
    height: '100vh',
    position: 'absolute',
    top: 0,
    left: 0
  },
  infoCircle: {
    width: '15px',
    marginLeft: '5px'
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    whiteSpace: 'nowrap',
    backgroundColor: colors.invariant.light,
    padding: '2px 8px',
    borderRadius: 8,
    marginLeft: 16
  },
  text: {
    ...typography.caption2,
    color: colors.invariant.text,
    fontWeight: 500
  },
  pointsAmount: {
    ...typography.caption1,
    color: colors.invariant.pink,
    minWidth: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 500
  },
  modal: {
    position: 'absolute',
    zIndex: 14,
    width: 'calc(100vw - 32px)',
    left: '50%',
    transform: 'translateX(-50%)'
  }
}))
