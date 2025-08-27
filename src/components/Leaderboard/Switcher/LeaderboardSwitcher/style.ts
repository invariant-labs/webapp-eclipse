import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => {
  return {
    leaderboardTypeBox: {
      position: 'absolute',
      left: 0,
      [theme.breakpoints.down(960)]: {
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
    }
  }
})
