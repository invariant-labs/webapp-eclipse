import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ onePoolType: boolean }>()((_theme, { onePoolType }) => ({
  swapFlowContainer: {
    maxHeight: 76,
    gap: 16,
    padding: '12px 30px 12px 30px',
    paddingInline: '',
    borderBottom: `1px solid ${colors.invariant.component}`
  },
  tokenContainer: {
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column'
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
  }
}))
