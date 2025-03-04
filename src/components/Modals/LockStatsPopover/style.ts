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
    animatedBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '3px',
      borderRadius: 4,
      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: `0 0 6px 1px ${colors.invariant.pink}`
    },
    statsInnerContainer: {
      display: 'flex',
      width: '38%',
      gap: '16px'
    },
    chartWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: '50%'
    },
    innerChartWrapper: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' },
    chart: {
      height: '100px',
      width: '160px'
    },
    textWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
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
