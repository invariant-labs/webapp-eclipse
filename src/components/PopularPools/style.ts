import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
  title: {
    color: colors.invariant.text,
    ...typography.heading4,
    fontWeight: 500
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    padding: '24px',
    backgroundColor: colors.invariant.transparentBcg,
    flexWrap: 'nowrap'
  }
}))
