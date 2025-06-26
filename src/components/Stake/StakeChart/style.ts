import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { colors, typography } from '@static/theme'

export const useStyles = makeStyles()((theme: Theme) => ({
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 1210,
    width: '100%',
    background: colors.invariant.component,
    borderRadius: 24,
    [theme.breakpoints.down('md')]: {
      width: '100%'
    },
    [theme.breakpoints.down('sm')]: {
      padding: '16px 0',
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
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
    maxWidth: '100%',
    wordBreak: 'break-word',
    padding: '16px',
    [theme.breakpoints.down('md')]: {
      gap: theme.spacing(0.75)
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: 14,
      gap: theme.spacing(0.5),
      padding: theme.spacing(0, 1),
      marginBottom: 0
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
    [theme.breakpoints.down(515)]: {
      maxWidth: '80px',
      marginRight: 12
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
      marginRight: '16px'
    },
    '& input[type=number]': {
      '-moz-appearance': 'textfield',
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0
      }
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

    marginLeft: -16,
    [theme.breakpoints.down('sm')]: {
      height: 300,
      marginLeft: -8
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
    color: colors.invariant.lightBlue,
    ...typography.heading4,
    [theme.breakpoints.down('sm')]: {
      ...typography.body1
    }
  },
  tooltip: {
    background: colors.invariant.component,
    border: `1px solid ${colors.invariant.lightGrey}`,
    borderRadius: 5,
    padding: 8,
    [theme.breakpoints.down('sm')]: {
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
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    width: '100%',
    '& p': {
      ...typography.heading4,
      color: colors.invariant.text,
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: theme.spacing(1),

      [theme.breakpoints.down('sm')]: {
        ...typography.body1
      }
    }
  },
  lowerTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    marginBottom: theme.spacing(1),
    '& p': {
      color: colors.invariant.text,
      ...typography.heading4,
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center',
      [theme.breakpoints.down('sm')]: {
        ...typography.body1
      }
    }
  }
}))

export default useStyles
