import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    color: colors.white.main,
    display: 'grid',
    gridTemplateColumns: '5% 40% 20% 20% 10%',
    padding: '18px 18px',
    backgroundColor: colors.invariant.component,
    borderBottom: `1px solid ${colors.invariant.light}`,
    whiteSpace: 'nowrap',
    maxWidth: '100%',

    '& p': {
      ...typography.heading4,
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center'
    },
    '& p:last-child': {
      justifyContent: 'flex-end'
    },

    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'auto 15%  17.5%  12.5% 120px'
    },

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '32.5% 17.5% 35% 15% ',

      '& p': {
        justifyContent: 'flex-start',
        ...typography.caption1
      }
    }
  },

  header: {
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    background: colors.invariant.component,
    position: 'relative',
    '& p': {
      color: colors.invariant.textGrey,
      ...typography.body1,
      fontWeight: 400

      // [theme.breakpoints.down('sm')]: {
      //   ...typography.caption2
      // }
    }
  }
}))
