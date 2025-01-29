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
  routeIcon: {
    width: useTwoPools ? 80 : 230
  },
  arrowContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center'
  },
  routeLabel: {
    ...typography.tiny2,
    color: colors.invariant.text
  },
  tokenLabel: {
    ...typography.body1,
    color: colors.invariant.textGrey
  },
  tokenContinaer: {
    display: 'flex',
    flexDirection: 'column'
  }
}))
