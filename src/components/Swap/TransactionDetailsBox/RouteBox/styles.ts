import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ onePoolType: boolean }>()((_theme, { onePoolType }) => ({
  swapFlowContainer: {
    maxHeight: 76,
    gap: 16,
    padding: '12px 30px 12px 30px',
    paddingInline: '',
    borderBottom: `1px solid ${colors.invariant.component}`,
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative'
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
    gap: 5,
    alignItems: 'center'
  },
  routeIcon: {
    width: onePoolType ? 80 : 230
  },

  routeLabel: {
    ...typography.caption4,
    color: colors.invariant.text
  },
  tokenIcon: {
    width: 24,
    borderRadius: '50%'
  },
  tokenLabel: {
    ...typography.heading4,
    color: colors.invariant.textGrey
  },
  tokenLabelSkeleton: {
    width: 40
  },
  loader: {
    height: 52,
    padding: '12px 30px 12px 30px',
    borderBottom: `1px solid ${colors.invariant.component}`,
    background: colors.invariant.componentBcg,
    opacity: 0,
    transitionDuration: '0.3s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  isLoading: {
    opacity: 1
  }
}))
