import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

interface StyleProps {
  breakpoint: number
  isHiding: boolean
}

export const useStyles = makeStyles<StyleProps>()((theme, { breakpoint, isHiding }) => ({
  mainWrapper: {
    position: 'relative',
    display: 'flex',
    maxWidth: 1210,
    width: '100%',
    height: isHiding ? 0 : 239,
    overflow: 'hidden',
    borderRadius: 14,
    padding: isHiding ? 0 : '16px 24px',
    gap: 24,
    background: colors.invariant.dark,
    marginBottom: isHiding ? 0 : 24,
    border: isHiding ? 'none' : `1px ${colors.invariant.esToken} solid`,
    alignItems: 'center',
    opacity: isHiding ? 0 : 1,
    transition: isHiding
      ? 'height 0.4s ease-out, opacity 0.3s ease-out, padding 0.4s, margin 0.4s, border 0.4s'
      : 'none',
    [theme.breakpoints.down(breakpoint)]: {
      flexDirection: 'column',
      height: isHiding ? 0 : 612,
      maxWidth: 524,
      padding: isHiding ? 0 : '24px'
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
      width: 14,
      zIndex: 2
    }
  },

  newTab: {
    width: 14,
    filter: 'brightness(0)'
  },
  rightWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
      [theme.breakpoints.down(breakpoint)]: {
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
    [theme.breakpoints.down(breakpoint)]: {
      left: '50%',
      transform: 'translateX(-50%)'
    }
  }
}))
