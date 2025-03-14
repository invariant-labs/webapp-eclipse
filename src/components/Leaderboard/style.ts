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
      ...typography.heading3,
      color: colors.white.main
    },
    rewardedPoolsWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing(3),
      width: '100%'
    },
    leaderBoardWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      maxWidth: '1072px',

      [theme.breakpoints.up('lg')]: {
        width: '1072px'
      },

      [theme.breakpoints.between('md', 'lg')]: {
        width: '800px'
      },

      [theme.breakpoints.down('md')]: {
        width: '85vw'
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    }
  }
})

export default useStyles
