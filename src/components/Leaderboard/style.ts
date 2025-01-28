import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    pageWrapper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%'
    },
    leaderBoardWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      width: '1072px',

      [theme.breakpoints.between('lg', 'xl')]: {
        width: '1072px'
      },

      [theme.breakpoints.between('md', 'lg')]: {
        width: '800px'
      },

      [theme.breakpoints.down('md')]: {
        width: '85vw'
      },

      [theme.breakpoints.up('xl')]: {
        width: '1120px'
      }
    }
  }
})

export default useStyles
