import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    height: '100%',
    backgroundColor: colors.invariant.component,
    padding: 8,
    borderRadius: 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 12,

    [theme.breakpoints.up('sm')]: {
      padding: 24
    }
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  header: {
    ...typography.heading4,
    color: colors.white.main
  },
  plot: {
    width: '100%',
    height: 255,
    backgroundColor: colors.invariant.component,
    borderRadius: 10,

    [theme.breakpoints.down('sm')]: {
      height: 253
    }
  },
  statsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  statsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,

    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row'
    }
  },
  value: {
    color: colors.white.main
  },
  valuePercentagePlus: {
    color: colors.invariant.green
  },
  valuePercentageMinus: {
    color: colors.invariant.Error
  },
  concentrationContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  concentrationValue: {
    fontSize: 20,
    fontWeight: 400,
    color: colors.white.main
  }
}))

export default useStyles
