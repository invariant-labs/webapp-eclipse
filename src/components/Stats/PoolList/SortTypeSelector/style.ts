import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => {
  return {
    leaderboardTypeBox: {
      position: 'absolute',
      left: 0,
      [theme.breakpoints.down('md')]: {
        marginTop: 20,
        width: '100%',
        position: 'relative'
      }
    },
    firstOption: {
      width: '30%',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      gap: '8px'
    },
    lastOption: {
      width: '30%',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      gap: '8px'
    },
    optionWrapper: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row'
    },
    leaderboardTypeButton: {
      position: 'relative',
      zIndex: 10,
      width: 140,
      height: 32,
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 24,
      paddingRight: 16,
      backgroundColor: colors.invariant.light,
      textDecoration: 'none',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: colors.invariant.light
      }
    },
    leaderboardTypeText: {
      color: colors.invariant.text,
      ...typography.body2
    },
    mobileTypeSwitcherTitle: {
      color: colors.invariant.text,
      ...typography.heading4,
      textAlign: 'center'
    },
    mobileTypeSwitcherSubtitle: {
      color: colors.invariant.textGrey,
      ...typography.body2
    },
    root: {
      background: colors.invariant.component,
      width: 200,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      padding: 16,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flexDirection: 'column',
      gap: 10
    },
    paper: {
      background: 'transparent',
      borderRadius: '16px',
      boxSizing: 'border-box',
      marginTop: '8px',
      boxShadow: `0px 2px 8px ${colors.invariant.black}`
    },
    optionButton: {
      width: 40,
      height: 40,
      outline: 'none',
      border: `1px solid ${colors.invariant.light}`,
      borderRadius: 8,
      padding: 8,
      minWidth: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: colors.invariant.component,
      textDecoration: 'none',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: colors.invariant.newDark,
        cursor: 'pointer'
      },
      ...typography.body2,
      color: colors.invariant.textGrey
    },
    modalTitle: {
      ...typography.heading4,
      color: colors.invariant.text
    },
    selectButton: {
      width: '100%',
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      background: colors.invariant.component,
      textDecoration: 'none',
      textTransform: 'none',
      transition: 'filter 0.3s',
      padding: 12,
      minWidth: 170,
      borderRadius: 9,
      '&:hover': {
        background: colors.invariant.component,
        boxShadow: 'none',
        filter: 'brightness(1.2)'
      },
      ...typography.body2,
      color: colors.invariant.textGrey,

      [theme.breakpoints.down('md')]: {
        border: `1px solid ${colors.invariant.light}`
      }
    },
    active: {
      background: colors.invariant.componentBcg
    }
  }
})
