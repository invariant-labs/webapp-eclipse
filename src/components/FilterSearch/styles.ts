import { Theme } from '@mui/material'
import { typography, colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ fullWidth: boolean; isTokensSelected: boolean }>()(
  (_theme: Theme, { fullWidth, isTokensSelected }) => ({
    searchBar: {
      minHeight: 32,
      borderRadius: 10,
      marginBottom: 8,
      background: colors.invariant.black,
      border: '1px solid #202946',
      color: colors.invariant.light,
      transition: 'width 0.3s ease-in-out',
      width: fullWidth ? 424 : 221,
      display: 'flex',
      alignItems: 'center'
    },
    searchIcon: {
      width: 17,
      paddingRight: '10px'
    },

    searchResultIcon: {
      width: 36,
      height: 36,
      marginRight: 8,
      borderRadius: '50%'
    },
    paper: {
      width: 392,
      boxShadow: 'none',
      maxWidth: 392,
      padding: '16px 16px 10px 16px',

      marginTop: 8,
      background: colors.invariant.bodyBackground,
      '&::-webkit-scrollbar': {
        width: 6,
        background: colors.invariant.component
      },
      '&::-webkit-scrollbar-thumb': {
        background: colors.invariant.light,
        borderRadius: 6
      }
    },
    avatarChip: {
      width: 14,
      height: 14,
      borderRadius: '50%'
    },
    typographyChip: {
      ...typography.body2,
      color: colors.invariant.text
    },
    boxChip: {
      display: 'flex',
      padding: '6px 4px 6px 4px',
      borderRadius: 8,
      gap: 8,

      height: 26,
      maxHeight: 26,
      justifyContent: 'center',
      alignItems: 'center',
      background: colors.invariant.component
    },
    closeIcon: {
      cursor: 'pointer',
      transition: 'opacity 0.2s ease-in-out',
      '&:hover': {
        opacity: 0.7
      }
    },
    header: {
      position: 'sticky',
      top: 0,
      backgroundColor: 'white',
      zIndex: 10,
      padding: 2
    },
    headerText: {
      ...typography.body2,
      color: colors.invariant.textGrey
    },
    commonTokens: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    },
    divider: {
      background: colors.invariant.light,
      height: 1,
      width: 'fullWidth',
      marginBottom: 16
    },
    tokenContainer: {
      width: '100%',
      height: 54,
      display: 'flex',
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px',
      padding: '8px',
      '&:hover': {
        background: colors.invariant.lightHover2
      }
    },
    liqudityLabel: { ...typography.body2, color: colors.invariant.textGrey },
    tokenLabel: {
      ...typography.heading3
    },
    labelContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 4px 2px 4px'
    },
    addressLabel: {
      ...typography.caption4,
      color: colors.invariant.textGrey
    },
    tokenName: {
      ...typography.caption2,
      color: colors.invariant.textGrey
    },
    balaceLabel: {
      ...typography.body2,
      color: colors.invariant.textGrey
    },
    commonTokenIcon: {
      width: 24,
      borderRadius: '50%'
    },
    commonTokenContainer: {
      justifyContent: 'center',
      cursor: !isTokensSelected ? 'pointer' : 'not-allowed',

      borderRadius: 12,
      height: 24,
      alignItems: 'center',
      display: 'flex',
      padding: '6px 12px 6px 12px',
      gap: 8,
      background: colors.invariant.dark,
      '&:hover': {
        background: colors.invariant.light,
        '@media (hover: none)': {
          background: colors.invariant.newDark
        }
      }
    },
    commonTokenLabel: {
      ...typography.body2,
      color: colors.invariant.text
    },
    tokenAddress: {
      backgroundColor: colors.invariant.newDark,
      borderRadius: 4,
      padding: '2px 4px',
      width: 'min-content',
      height: 'min-content',
      '& a': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        textDecoration: 'none',

        '&:hover': {
          filter: 'brightness(1.2)',
          '@media (hover: none)': {
            filter: 'none'
          }
        },
        '& p': {
          color: colors.invariant.lightGrey,
          ...typography.caption4,
          letterSpacing: '0.03em'
        }
      }
    },
    feeTierLabel: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    },
    feeTierProcent: {
      ...typography.heading3,
      color: colors.invariant.text
    },
    feeTierText: {
      padding: '2px 4px 2px 4px',
      ...typography.caption4,
      color: colors.invariant.textGrey
    }
  })
)

export default useStyles
