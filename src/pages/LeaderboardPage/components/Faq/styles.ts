// style.ts
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    maxWidth: 1072,
    borderRadius: '24px',
    maxHeight: 'fit-content',
    position: 'relative',
    zIndex: 2,
    backgroundColor: `${colors.invariant.component} !important`,
    padding: '24px 32px',
    '&::-webkit-scrollbar': {
      width: '4px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.light,
      borderRadius: '4px'
    }
  }
}))
