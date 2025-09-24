import { typography, colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      height: 'auto',
      gap: 16
    }
  },
  valueWrapper: {
    border: ` 1px solid ${colors.invariant.light}`,
    padding: '8px 12px',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    '& h3': {
      ...typography.heading4,
      color: colors.invariant.text
    }
  },
  claimValue: {
    padding: '8px 12px 0px',
    justifyContent: 'space-between'
  },
  claimWrapper: {
    border: ` 1px solid ${colors.invariant.light}`,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'space-between',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    '& h3': {
      ...typography.heading4,
      color: colors.invariant.text
    }
  }
}))

export default useStyles
