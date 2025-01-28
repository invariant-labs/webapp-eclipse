import { makeStyles } from 'tss-react/mui'
import { colors, typography } from '@static/theme'

export const useStyles = makeStyles()(() => ({
  container: {
    minWidth: '424px',
    minHeight: '280px',
    borderRadius: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  headerText: {
    ...typography.heading1,
    color: colors.invariant.text
  },
  poolsGrid: {
    marginTop: '24px',
    height: '260px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '6px'
    },
    '&::-webkit-scrollbar-track': {
      background: colors.invariant.newDark
    },
    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.pink,
      borderRadius: '3px'
    }
  }
}))
