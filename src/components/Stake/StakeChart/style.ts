import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { colors, typography } from '@static/theme'

export const useStyles = makeStyles()((theme: Theme) => ({
  chartContainer: {
    width: '100%',
    marginTop: '72px',
    backgroundColor: colors.invariant.component,
    padding: '24px',
    borderRadius: '24px'
  },
  stakeText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.invariant.text,
    fontWeight: 600,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
    gap: theme.spacing(1)
  },

  inputField: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: colors.invariant.green,
        borderRadius: '8px'
      },
      '&:hover fieldset': {
        borderColor: colors.invariant.green
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.invariant.green
      }
    },
    maxWidth: '100px'
  },
  inputProps: {
    textAlign: 'center',
    color: colors.invariant.green,
    fontWeight: 600,
    padding: '4px 8px',
    width: '70px'
  },
  chartBox: {
    height: 350,
    width: '100%'
  },
  legendContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    gap: theme.spacing(3)
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%'
  },
  greenDot: {
    backgroundColor: colors.invariant.green
  },
  pinkDot: {
    backgroundColor: colors.invariant.pink
  },
  greenText: {
    color: colors.invariant.green,
    ...typography.caption2
  },
  pinkText: {
    color: colors.invariant.pink,
    ...typography.caption2
  },
  valuesContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    gap: theme.spacing(4)
  },
  bitzValue: {
    color: colors.invariant.green,
    fontWeight: 600,
    fontSize: '14px'
  },
  sBitzValue: {
    color: colors.invariant.pink,
    fontWeight: 600,
    fontSize: '14px'
  }
}))

export default useStyles
