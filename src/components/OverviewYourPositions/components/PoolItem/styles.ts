import { makeStyles } from 'tss-react/mui'
import { colors, typography } from '@static/theme'

export const usePoolItemStyles = makeStyles()(() => ({
  container: {
    width: '380px',
    height: '56px',
    marginTop: '12px',
    borderRadius: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: colors.invariant.component
  },
  tokenIcon: {
    minWidth: 28,
    maxWidth: 28,
    height: 28,
    marginRight: 8,
    borderRadius: '50%',
    objectFit: 'cover'
  },
  tokenSymbol: {
    ...typography.heading4,
    color: colors.invariant.text,
    textAlign: 'left'
  },
  statsContainer: {
    backgroundColor: colors.invariant.light,
    display: 'flex',
    padding: '4px 12px',
    borderRadius: '6px',
    gap: '16px'
  },
  statsLabel: {
    ...typography.caption1,
    color: colors.invariant.textGrey
  },
  statsValue: {
    ...typography.caption1,
    color: colors.invariant.green
  },
  actionIcon: {
    height: 32,
    background: 'none',
    width: 32,
    padding: 0,
    margin: 0,
    border: 'none',

    color: colors.invariant.black,
    textTransform: 'none',

    transition: 'filter 0.2s linear',

    '&:hover': {
      filter: 'brightness(1.2)',
      cursor: 'pointer',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  }
}))
