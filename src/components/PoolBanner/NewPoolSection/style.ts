import { typography, colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  newPoolWrapper: {
    position: 'relative',
    width: '100%',
    background: `linear-gradient(to left, #111931 20%, #2776ca27 80%)`,
    borderRadius: 24,
    boxSizing: 'border-box',
    flex: '1 1 0',
    display: 'flex',
    padding: '16px 24px',
    boxShadow: '3px 0px 8px rgba(0, 0, 0, 0.2)',
    [theme.breakpoints.up('md')]: {
      maxWidth: 480
    },
    [theme.breakpoints.down('md')]: {
      boxShadow: '2px 5px 8px rgba(0, 0, 0, 0.49)'
    },
    [theme.breakpoints.down(430)]: {
      justifyContent: 'center'
    }
  },
  poolDescriptionWrapper: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',

    gap: 20,
    justifyContent: 'center',
    '& span': {
      ...typography.caption2,
      color: colors.invariant.textGrey,
      zIndex: 1
    }
  },
  titleWrapper: {
    display: 'flex',
    gap: 8,
    alignContent: 'center',
    '& h1': {
      ...typography.body1,
      color: colors.invariant.green
    },
    '& h2': {
      ...typography.body1,
      color: colors.invariant.text
    },
    '& img': {
      width: 14
    }
  },
  usdcImg: {
    position: 'absolute',
    top: 0,
    right: 0
  }
}))

export default useStyles
