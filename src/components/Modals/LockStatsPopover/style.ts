import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    popover: {
      pointerEvents: 'none',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        padding: '16px'
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
    leftWrapper: {
      display: 'flex',
      width: '38%',
      gap: '16px'
    },
    leftInnerWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    },
    statsContainer: {
      width: '100%',
      padding: 24,
      display: 'flex',
      gap: '16px',

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
      textAlign: 'center',
      ...typography.body1,
      color: colors.invariant.text
    },
    description: {
      ...typography.caption2,
      color: colors.invariant.textGrey
    },
    separator: {
      width: '2px',
      backgroundColor: colors.invariant.light,
      alignSelf: 'stretch'
    },
    rightWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: '50%'
    },
    chartsWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%'
    },
    chartWrapper: {
      display: 'flex',
      alignItems: 'center'
    },
    barWrapper: {
      width: '40%',
      marginLeft: '60px',
      position: 'relative'
    },
    progress: {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '3px',
      borderRadius: 4,
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
})

export default useStyles
