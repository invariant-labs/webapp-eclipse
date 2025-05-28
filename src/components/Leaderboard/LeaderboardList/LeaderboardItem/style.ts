import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    color: colors.white.main,
    display: 'grid',
    gridTemplateColumns: '10% auto 30% 20% 10%',
    padding: '18px 18px',
    height: 69,
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
      gridTemplateColumns: '15% auto 22.5%'
    },

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '15% auto 22.5%',

      '& p': {
        justifyContent: 'flex-start',
        ...typography.caption1
      }
    }
  },
  totalContainer: {
    color: colors.white.main,
    display: 'grid',
    height: 69,
    gridTemplateColumns: '10% auto 16.6% 16.6% 16.6% 10%',
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
      gridTemplateColumns: '15% auto 17.5%'
    },

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '15% auto 17.5%',

      '& p': {
        justifyContent: 'flex-start',
        ...typography.caption1
      },

      padding: '18px 8px'
    }
  },
  address: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: colors.invariant.text
  },
  iconContainer: {
    minWidth: 28,
    maxWidth: 28,
    height: 28,
    marginRight: 3,
    position: 'relative'
  },
  tokenIcon: {
    minWidth: 28,
    maxWidth: 28,
    height: 28,
    marginRight: 3,
    borderRadius: '50%'
  },
  copyWrapper: {
    display: 'flex',
    justifyContent: 'center'
  },
  clipboardIcon: {
    marginLeft: 4,
    width: 18,
    height: '100%',
    cursor: 'pointer',
    color: colors.invariant.lightHover,
    '&:hover': {
      color: colors.invariant.text,

      '@media (hover: none)': {
        color: colors.invariant.lightHover
      }
    }
  },
  header: {
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    background: colors.invariant.component,
    position: 'relative',
    '& p.MuiTypography-root': {
      color: colors.invariant.textGrey,
      ...typography.heading4,
      [theme.breakpoints.down('sm')]: {
        justifyContent: 'flex-start',
        ...typography.caption1
      }
    }
  }
}))
