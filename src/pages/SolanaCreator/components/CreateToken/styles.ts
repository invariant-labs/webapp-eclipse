import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    pageWrapper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '24px',
      width: '100%',
      padding: '10px'
    },
    input: {
      padding: '11px 12px',
      width: '100%',
      minHeight: '32px',
      boxSizing: 'border-box',
      ...typography.body2,
      outline: 'none',
      marginRight: -8,
      fontFamily: 'Mukta',
      outlineStyle: 'none',
      fontSize: 16,
      backgroundColor: colors.invariant.newDark,
      color: colors.invariant.lightGrey,
      borderRadius: 8,
      cursor: 'pointer',
      '&::placeholder': {
        color: colors.invariant.textGrey
      },
      '&:focus': {
        color: colors.white.main
      }
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    columnInput: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: '100%'
    },

    row: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '10px',
      [theme.breakpoints.up('sm')]: {
        flexDirection: 'row'
      }
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      gap: '24px',
      height: 'fit-content',
      background: colors.invariant.component,
      borderRadius: '24px'
    },

    tokenCost: {
      display: 'flex',
      alignItems: 'center',
      color: colors.invariant.text,
      gap: '10px'
    },
    inputsWrapper: {
      display: 'flex',
      flexDirection: 'column'
    },
    inputContainer: {
      height: '110px',
      display: 'flex',
      flexDirection: 'column'
    },
    button: {
      color: colors.invariant.dark,
      ...typography.body1,
      textTransform: 'none',
      borderRadius: 14,
      height: 40,
      minWidth: 130,
      paddingInline: 0,
      background:
        'linear-gradient(180deg, rgba(239, 132, 245, 0.8) 0%, rgba(156, 62, 189, 0.8) 100%)',
      '&:hover': {
        background: 'linear-gradient(180deg, #EF84F5 0%, #9C3EBD 100%)',
        boxShadow: '0px 0px 16px rgba(239, 132, 245, 0.35)'
      },
      '&:disabled': {
        background: colors.invariant.light,
        color: colors.invariant.componentBcg
      }
    },
    headerTitle: {
      fontFamily: 'Mukta',
      fontStyle: 'normal',
      fontWeight: 700,
      fontSize: '20px',
      lineHeight: '24px',
      display: 'flex',
      alignSelf: 'flex-start',
      letterSpacing: '-0.03em',
      color: colors.invariant.text
    },
    buttonText: {
      WebkitPaddingBefore: '2px'
    },
    creatorMainContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '24px',
      paddingTop: '24px',
      width: '100%',
      [theme.breakpoints.up('md')]: {
        flexDirection: 'row'
      }
    }
  }
})

export default useStyles
