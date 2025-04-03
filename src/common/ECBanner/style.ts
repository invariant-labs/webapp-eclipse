import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

interface StyleProps {
  page: 'overview' | 'points'
}

export const useStyles = makeStyles<StyleProps>()((theme, { page }) => ({
  mainWrapper: {
    position: 'relative',
    display: 'flex',
    maxWidth: page === 'points' ? 1072 : 1145,
    width: '100%',
    height: 239,
    borderRadius: 14,
    padding: '16px 24px',
    gap: 24,
    background: colors.invariant.dark,
    marginBottom: 24,
    border: `1px #A0FEA040 solid`,
    alignItems: 'center',
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      height: 612,
      maxWidth: 524,
      padding: '24px'
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%'
    }
  },
  closeIcon: {
    zIndex: 1,
    padding: '16px 24px',
    right: 0,
    top: 0,
    width: 12,
    position: 'absolute',
    cursor: 'pointer'
  },

  leftWrapper: {
    display: 'flex',
    maxWidth: 310,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    '& span': {
      textAlign: 'center',
      ...typography.caption2,
      color: colors.invariant.textGrey
    }
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    textAlign: 'center',
    ...typography.body1,
    color: colors.invariant.text,

    '& img': {
      display: 'flex',
      cursor: 'pointer',
      width: 14
    }
  },

  newTab: {
    width: 14,
    filter: 'brightness(0)'
  },
  rightWrapper: {
    display: 'flex',
    gap: 24
  },
  buttonSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    '& span': {
      display: 'flex',
      maxWidth: 310,
      textAlign: 'center',
      ...typography.caption2,
      color: colors.invariant.textGrey,
      [theme.breakpoints.down('lg')]: {
        minWidth: 256
      }
    }
  },
  arrowRight: {
    width: 16,
    filter: 'brightness(0)'
  },
  cardSection: {
    position: 'relative',
    display: 'flex'
  },

  card: {
    bottom: 0,
    right: 0,

    position: 'absolute',
    [theme.breakpoints.down('lg')]: {
      left: '50%',
      transform: 'translateX(-50%)'
    }
  }
}))
