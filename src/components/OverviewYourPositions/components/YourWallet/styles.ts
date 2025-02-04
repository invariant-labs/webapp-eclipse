import { makeStyles } from 'tss-react/mui'
import { colors, typography } from '@static/theme'

export const useStyles = makeStyles()(() => ({
  container: {
    minWidth: '50%',
    maxHeight: '280px',
    borderTopRightRadius: '24px',
    borderBottomRightRadius: '24px',
    padding: 0
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
      width: '6px',
      paddingLeft: '6px'
    },
    '&::-webkit-scrollbar-track': {
      background: colors.invariant.newDark
    },
    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.pink,
      borderRadius: '3px'
    }
  },
  skeletonItem: {
    padding: '16px',
    marginBottom: '16px',
    background: colors.invariant.newDark,
    borderRadius: '16px',
    '& .MuiSkeleton-root': {
      backgroundColor: `${colors.invariant.text}20`
    }
  }
}))
