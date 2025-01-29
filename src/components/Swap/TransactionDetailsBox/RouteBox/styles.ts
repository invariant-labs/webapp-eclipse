import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ useTwoPools: boolean }>()((_theme, { useTwoPools }) => ({
  swapFlowContainer: {
    maxHeight: 70,
    margin: '1px',
    gap: 16,
    padding: '12px 30px 12px 30px',
    paddingInline: '',
    background: colors.invariant.component,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10
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
    width: useTwoPools ? 80 : 230
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
