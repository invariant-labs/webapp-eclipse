import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { colors, typography } from '@static/theme'

export const useStyles = makeStyles()((theme: Theme) => ({
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
    width: '100%',
    marginTop: theme.spacing(3),
    background: colors.invariant.component,
    borderRadius: 24,
    padding: '24px 0px',
    [theme.breakpoints.down('md')]: {
      width: '100%',
      padding: '20px 0px'
    },
    [theme.breakpoints.down('sm')]: {
      padding: '16px 0px',
      borderRadius: 16
    }
  },
  stakeText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: colors.invariant.text,
    textAlign: 'center',
    ...typography.body3,
    padding: theme.spacing(0, 2),
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
    maxWidth: '100%',
    wordBreak: 'break-word',
    [theme.breakpoints.down('md')]: {
      gap: theme.spacing(0.75)
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: 14,
      gap: theme.spacing(0.5),
      padding: theme.spacing(0, 1)
    }
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
    maxWidth: '100px',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '80px'
    }
  },
  inputProps: {
    textAlign: 'center',
    color: colors.invariant.green,
    fontWeight: 600,
    padding: '4px 6px',
    maxHeight: '32px',
    minWidth: '70px',
    '& .MuiInputAdornment-root': {
      marginRight: '16px' // Add more spacing after the logo
    },
    [theme.breakpoints.down('sm')]: {
      padding: '2px 4px',
      maxHeight: '28px',
      minWidth: '90px'
    }
  },
  chartBox: {
    height: 400,
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      height: 300
    }
  },
  legendContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    gap: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: theme.spacing(1)
    }
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
    gap: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: theme.spacing(1)
    }
  },
  bitzValue: {
    color: colors.invariant.green,
    ...typography.heading4,
    [theme.breakpoints.down('sm')]: {
      ...typography.body1
    }
  },
  sBitzValue: {
    color: colors.invariant.pink,
    ...typography.heading4,
    [theme.breakpoints.down('sm')]: {
      ...typography.body1
    }
  },
  tooltip: {
    background: colors.invariant.component,
    border: `1px solid ${colors.invariant.lightGrey}`,
    borderRadius: 5,
    width: 120,
    padding: 8,
    [theme.breakpoints.down('sm')]: {
      width: 120,
      padding: 6
    }
  },
  tooltipDate: {
    ...typography.caption2,
    color: colors.white.main,
    textAlign: 'center'
  },
  tooltipValue: {
    ...typography.caption1,
    textAlign: 'center'
  }
}))

export default useStyles
