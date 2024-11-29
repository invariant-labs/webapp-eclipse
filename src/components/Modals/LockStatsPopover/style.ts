import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    popover: {
      marginTop: 'max(calc(50vh - 350px), 0px)',
      marginLeft: 'calc(50vw - 751px)',
      borderRadius: '20px !important',
      [theme.breakpoints.down('sm')]: {
        display: 'flex',
        marginLeft: 'auto',
        justifyContent: 'center'
      }
    },
    chart: {
      height: '100px',
      width: '160px'
    },

    backgroundContainer: {
      background: colors.invariant.component,
      width: 652,
      [theme.breakpoints.down(671)]: {
        maxWidth: '100vw'
      }
    },
    statsContainer: {
      width: '100%',
      padding: 24,
      display: 'flex',

      [theme.breakpoints.down(671)]: {
        flexDirection: 'column'
      }
    },
    paper: {
      background: 'transparent',
      maxWidth: 671,
      maxHeight: '100vh',
      borderRadius: 20,
      '&::-webkit-scrollbar': {
        width: 6,
        background: colors.invariant.component
      },
      '&::-webkit-scrollbar-thumb': {
        background: colors.invariant.light,
        borderRadius: 6
      }
    },
    chartSection: {
      flex: '1',
      display: 'flex',
      gap: 16
    },
    chartSectionColumn: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    },
    pieChart: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    },
    chartTitle: {
      ...typography.body1,
      color: colors.invariant.text
    },
    description: {
      ...typography.caption2,
      color: colors.invariant.textGrey
    }
  }
})

export default useStyles
