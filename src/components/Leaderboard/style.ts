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
      width: '100%',
      gap: 24
    },
    progressWrapper: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      gap: '24px',
      [theme.breakpoints.down('lg')]: {
        flexDirection: 'column'
      }
    },
    leaderboardHeaderSectionTitle: {
      textAlign: 'left',
      width: '100%',
      ...typography.heading4,
      color: colors.white.main,
      [theme.breakpoints.down('lg')]: {
        maxWidth: 605
      }
    },
    rewardedPoolsWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing(2),
      width: '100%'
    },
    leaderBoardWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      maxWidth: 1210,

      [theme.breakpoints.up('lg')]: {
        width: 1210
      },

      [theme.breakpoints.between('md', 'lg')]: {
        width: '100%'
      },

      [theme.breakpoints.down('md')]: {
        width: '100%'
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    }
  }
})

export default useStyles
