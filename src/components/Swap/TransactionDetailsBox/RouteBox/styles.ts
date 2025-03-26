import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ onePoolType: boolean }>()((theme, { onePoolType }) => ({
  swapFlowContainer: {
    maxHeight: 76,
    gap: 16,
    padding: '12px 18px 12px 18px',
    paddingInline: '',
    borderBottom: `1px solid ${colors.invariant.component}`,
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',

    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center'
    }
  },
  tokenContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: 52,
    width: 52
  },
  arrowContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center'
  },
  routeIcon: {
    width: onePoolType ? 80 : 230
  },

  routeLabel: {
    ...typography.caption2,
    color: colors.invariant.text
  },
  tokenIcon: {
    width: 26,
    borderRadius: '50%'
  },
  tokenLabel: {
    fontSize: 16,
    color: colors.invariant.textGrey
  },
  tokenLabelSkeleton: {
    width: 40
  },
  loader: {
    padding: '12px 18px 12px 18px',
    borderBottom: `1px solid ${colors.invariant.component}`,
    background: colors.invariant.componentBcg,
    opacity: 0,
    transitionDuration: '0.3s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 1,
    left: 0,
    right: 0,
    bottom: 0,

    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center'
    }
  },
  isLoading: {
    opacity: 1
  }
}))
