import { Theme } from '@mui/material/styles/createTheme'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',

    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },

    '& .MuiPagination-ul': {
      flexWrap: 'nowrap',
      margin: '10px 0',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },

    '& .MuiPaginationItem-icon': {
      color: colors.black.full
    },

    '& .MuiPaginationItem-page': {
      ...typography.heading4,
      color: colors.invariant.light,
      transition: '300ms',
      '&:hover': {
        color: colors.invariant.lightGrey,
        '@media (hover: none)': {
          color: colors.invariant.light
        }
      }
    },

    '& .MuiPaginationItem-ellipsis': {
      color: colors.invariant.light
    },

    '& .Mui-selected': {
      color: colors.invariant.green,
      '&:hover': {
        color: `${colors.invariant.green} !important`
      }
    },

    '& .MuiPaginationItem-page.Mui-selected': {
      backgroundColor: 'transparent',
      '&:hover': {
        color: colors.invariant.green
      }
    },

    '& li:first-of-type button, li:last-of-type button': {
      backgroundColor: colors.invariant.green,
      minWidth: 40,
      minHeight: 40,
      opacity: 0.8,
      transition: 'opacity 200ms',
      '&:hover': {
        opacity: 1
      },
      '&:disabled': {
        '& .MuiSvgIcon-root': {
          color: colors.invariant.componentBcg
        },

        backgroundColor: colors.invariant.light,
        pointerEvents: 'auto',
        transition: '300ms',
        '&:hover': {
          boxShadow: 'none',
          cursor: 'not-allowed',
          filter: 'brightness(1.15)',
          '@media (hover: none)': {
            filter: 'none'
          }
        }
      }
    },

    '& svg': {
      transform: 'scale(2.2)'
    }
  },

  pagination: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    color: colors.invariant.text,
    margin: '16px 0'
  },

  input: {
    height: 32,
    width: 30,
    fontFamily: 'Mukta',
    background: 'transparent',
    color: colors.invariant.text,
    display: 'flex',
    textAlign: 'center',
    outline: 'none',
    fontSize: 20,
    fontWeight: 700,
    borderRadius: 4,
    border: `3px solid ${colors.invariant.green}`
  },

  controlButton: {
    minWidth: 0,
    width: 40,
    height: 40,
    background: colors.invariant.green,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    cursor: 'pointer',
    opacity: 1,
    transition: 'opacity 300ms ease-in-out',
    padding: 0,

    '&:hover': {
      background: colors.invariant.green,
      opacity: 1
    },

    '&:disabled': {
      zIndex: 1,
      background: colors.invariant.light,
      color: colors.invariant.componentBcg,
      pointerEvents: 'auto',
      transition: '300ms',
      '&:hover': {
        boxShadow: 'none',
        cursor: 'not-allowed',
        filter: 'brightness(1.15)',
        '@media (hover: none)': {
          filter: 'none'
        }
      }
    }
  },

  hiddenSpan: {
    opacity: 0,
    fontSize: 20,
    fontWeight: 700,
    height: 1
  }
}))
