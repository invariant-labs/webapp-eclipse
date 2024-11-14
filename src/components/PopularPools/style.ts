import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  title: {
    color: colors.invariant.text,
    ...typography.heading4,
    fontWeight: 500
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
    padding: '24px',
    backgroundColor: colors.invariant.transparentBcg
  }
}))
