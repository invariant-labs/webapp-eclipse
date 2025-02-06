import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ percentage: number }>()((theme, { percentage }) => ({
  wrapper: {
    backgroundColor: colors.invariant.component,
    borderRadius: 24,
    padding: 24,
    color: colors.invariant.text
  },
  innerWrapper: {
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
    borderRadius: 8
  },
  pointsLabel: {
    backgroundColor: colors.invariant.light,
    borderRadius: 8,
    padding: '8px 16px',
    gap: 4,
    minWidth: '120px',
    height: 32,
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500,
    justifyContent: 'center',
    '& p': {
      ...typography.caption2,
      fontSize: '1rem',
      fontWeight: 500
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
    ...typography.caption1,
    color: colors.invariant.textGrey
  }
}))

export const useStylesPointsLabel = makeStyles()(() => ({
  rootBackground: {
    zIndex: 10,
    width: '100vw',
    height: '100vh',
    position: 'absolute',
    top: 0,
    left: 0
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
    zIndex: 11,
    width: 'calc(100vw - 32px)',
    left: '50%',
    transform: 'translateX(-50%)'
  }
}))
