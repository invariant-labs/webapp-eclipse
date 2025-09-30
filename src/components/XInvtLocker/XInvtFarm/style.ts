import { typography, colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    display: 'flex',
    gap: 20,
    borderRadius: 24,
    boxSizing: 'border-box',
    maxWidth: 1040,

    width: '100%',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      height: 'auto',
      maxWidth: 510,
      width: '100%'
    }
  },
  leftBannerWrapper: {
    display: 'flex',
    boxSizing: 'border-box',
    borderRadius: 24,
    maxWidth: 765,
    width: '100%',
    flex: 1,
    background: colors.invariant.component,
    [theme.breakpoints.down('md')]: {
      height: 368,
      flexDirection: 'column',
      paddingBottom: 24
    }
  },
  rightBannerWapper: {
    display: 'flex',
    maxWidth: 320,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    boxSizing: 'border-box',
    padding: 24,
    borderRadius: 24,
    justifyContent: 'space-between',
    background: colors.invariant.component,
    [theme.breakpoints.down('md')]: {
      maxWidth: 510
    },
    '& h5': {
      ...typography.body2,
      color: colors.invariant.textGrey
    }
  },
  valueWrapper: {
    display: 'flex',
    gap: 8,
    '& h3': {
      ...typography.heading1,
      color: colors.invariant.text
    }
  },
  cardsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    borderRadius: 24,
    background: colors.invariant.component
  },
  slider: {
    minWidth: '100%'
  },
  dots: {
    position: 'absolute',
    height: 10,
    width: 188,
    right: 180,
    top: 94,
    overflow: 'visible',
    zIndex: 10,
    transform: 'rotate(90deg)',

    [theme.breakpoints.down('md')]: {
      width: '100%',
      height: 'auto',
      top: 'auto',
      bottom: 16,
      right: 'auto',
      transform: 'none'
    },
    '& li': {
      borderRadius: '50%',
      height: 14,
      width: 14,
      margin: '0 12px',
      background: colors.invariant.newDark,
      border: `2px solid transparent`,
      transition: 'all 0.3s ease',
      position: 'relative',
      '&.slick-active': {
        background: colors.invariant.component,
        border: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -1,
          left: -1,
          right: -1,
          bottom: -1,
          borderRadius: '50%',
          // background: `linear-gradient(to bottom, ${colors.invariant.green}, ${colors.invariant.pink})`,
          background: colors.invariant.green,
          zIndex: -1
        }
      },
      '&': {
        background: colors.invariant.newDark,
        border: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -1,
          left: -1,
          right: -1,
          bottom: -1,
          borderRadius: '50%',
          background: colors.invariant.light,
          zIndex: -1
        }
      },
      '& button': {
        opacity: 0,
        height: '100%',
        width: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        cursor: 'pointer'
      },
      '& button::before': {
        content: '""'
      }
    }
  }
}))

export default useStyles
