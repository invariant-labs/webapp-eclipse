import { alpha } from '@mui/material'
import { colors, theme, typography } from '@static/theme'
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
    [theme.breakpoints.down('sm')]: {
      padding: '24px 12px'
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
      margin: '0px !important',
      '&::after': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        height: '100%',
        padding: '0px 10px',
        transiton: 'all 0.3s ease-in-out',
        width: '100%',
        borderRadius: '24px',
        zIndex: 1,
        background:
          'linear-gradient(90deg, rgba(46, 224, 154, 0.15) 0%, rgba(46, 224, 154, 0) 50%), linear-gradient(90deg, rgba(239, 132, 245, 0) 50%, rgba(239, 132, 245, 0.15) 100%), #202946;',
        opacity: 0.5
      }
    },
    '&:not(:last-child)': {
      borderBottom: `1px solid ${colors.invariant.light}`
    }
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: '1fr 40px',
    alignItems: 'center',
    padding: '16px 2px',
    '& .MuiAccordionSummary-content': {
      margin: 0
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    '& p': {
      color: colors.invariant.text,
      fontSize: '16px',
      fontWeight: 500
    }
  },
  item: {
    zIndex: 5,
    '& a': {
      color: '#2EE09A',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    '& ul': {
      paddingLeft: theme.spacing(2),
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
      fontWeight: 400,
      lineHeight: '20px',
      fontSize: '16px',
      opacity: 0.8
    }
  }
}))
