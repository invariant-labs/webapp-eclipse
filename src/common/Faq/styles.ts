import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    maxWidth: 1210,
    borderRadius: '24px',
    maxHeight: 'fit-content',
    position: 'relative',
    zIndex: 2,

    backgroundColor: `${colors.invariant.component} !important`,
    padding: '24px',
    [theme.breakpoints.down('sm')]: {
      padding: '24px 0px'
    },

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
  },
  accordion: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    position: 'relative',
    '&:before': {
      display: 'none'
    },
    '&.Mui-expanded': {
      '&:last-child': {
        marginBottom: '0px !important'
      },
      '&:first-of-type': {
        marginTop: '0px !important'
      },
      marginBottom: '8px !important',
      marginTop: '8px !important',
      [theme.breakpoints.down('sm')]: {
        marginBottom: '0px !important',
        marginTop: '0px !important'
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        height: '100%',
        transiton: 'all 0.3s ease-in-out',
        width: '100%',
        borderRadius: '24px',
        zIndex: 1,
        background: colors.invariant.pinkGreenLinearGradientOpacity,
        [theme.breakpoints.down('sm')]: {
          borderRadius: 0
        }
      }
    }
  },
  separator: {
    '&:not(:last-child)': {
      borderBottom: `1px solid ${colors.invariant.light}`
    }
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: '1fr 40px',
    alignItems: 'center',
    padding: '24px',
    [theme.breakpoints.down('sm')]: {
      padding: '24px 8px'
    },

    '& .MuiAccordionSummary-content': {
      margin: 0
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
      display: 'flex',
      justifyContent: 'center',
      zIndex: 5,
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        marginLeft: 25
      }
    },
    '& p': {
      color: colors.invariant.text,
      ...typography.heading4
    }
  },
  item: {
    ...typography.body2,
    fontWeight: 400,
    color: colors.invariant.textGrey,
    fontSize: '20px',
    padding: '0px 24px 24px',
    [theme.breakpoints.down('sm')]: {
      padding: '0px 8px 24px'
    },
    '& a': {
      color: colors.invariant.green,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    '& ul': {
      paddingLeft: '32px',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    '& li': {
      marginBottom: theme.spacing(1)
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    },
    '& p': {
      color: colors.invariant.textGrey,
      ...typography.body2,
      opacity: 0.8
    }
  }
}))
