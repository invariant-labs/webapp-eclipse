import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => {
  return {
    wrapper: {
      borderRadius: 10,
      backgroundColor: colors.invariant.component,
      padding: '16px 24px 16px 24px',
      flex: '1 1 0%',

      [theme.breakpoints.down('sm')]: {
        padding: '16px 8px  16px 8px '
      }
    },
    depositHeader: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        justifyContent: 'center'
      }
    },
    depositOptions: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 2,
      [theme.breakpoints.down('sm')]: {
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
    sectionTitle: {
      ...typography.heading4,
      color: colors.white.main
    },
    sectionWrapper: {
      borderRadius: 8,
      backgroundColor: colors.invariant.component,
      paddingTop: 0,
      width: '100%'
    },
    inputLabel: {
      ...typography.body3,
      lineHeight: '16px',
      color: colors.invariant.light,
      marginBottom: 3
    },
    selects: {
      gap: 12,
      marginBottom: 10
    },
    selectWrapper: {
      flex: '1 1 0%'
    },
    customSelect: {
      width: '100%',
      justifyContent: 'flex-start',
      border: 'none',
      backgroundColor: colors.invariant.componentBcg,
      borderRadius: 13,
      paddingInline: 13,
      height: 44,

      '& .selectArrow': {
        marginLeft: 'auto'
      },

      '&:hover': {
        backgroundColor: colors.invariant.light,
        '@media (hover: none)': {
          backgroundColor: colors.invariant.componentBcg
        }
      }
    },
    addButton: {
      height: '48px',
      width: '100%',
      margin: '30px 0',
      cursor: 'default'
    },
    hoverButton: {
      '&:hover': {
        filter: 'brightness(1.2)',
        boxShadow: `0 0 10px ${colors.invariant.pink}`,
        transition: '.2s all',
        cursor: 'pointer'
      }
    },
    arrows: {
      width: 32,
      cursor: 'pointer',

      '&:hover': {
        filter: 'brightness(2)',
        '@media (hover: none)': {
          filter: 'none'
        }
      }
    },
    connectWalletButton: {
      height: '48px !important',
      borderRadius: '16px',
      width: '100%',
      margin: '30px 0',

      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    switchDepositTypeContainer: {
      position: 'relative',
      width: 'fit-content',
      backgroundColor: colors.invariant.dark,
      borderRadius: 10,
      overflow: 'hidden',
      display: 'inline-flex',
      height: 26,
      [theme.breakpoints.down('sm')]: {
        height: 32
      }
    },
    switchDepositTypeMarker: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '50%',
      backgroundColor: colors.invariant.light,
      borderRadius: 10,
      transition: 'all 0.3s ease',
      zIndex: 1
    },
    switchDepositTypeButtonsGroup: { position: 'relative', zIndex: 2, display: 'flex' },
    switchDepositTypeButton: {
      ...typography.caption1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      textTransform: 'none',
      border: 'none',
      borderRadius: 10,
      zIndex: 2,
      '&.Mui-selected': {
        backgroundColor: 'transparent'
      },
      '&:hover': {
        backgroundColor: 'transparent'
      },
      '&.Mui-selected:hover': {
        backgroundColor: 'transparent'
      },
      '&:disabled': {
        color: colors.invariant.componentBcg,
        pointerEvents: 'auto',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 'none',
          cursor: 'not-allowed',
          filter: 'brightness(1.15)',
          '@media (hover: none)': {
            filter: 'none'
          }
        }
      },
      letterSpacing: '-0.03em',
      width: 46,
      height: 26
    },
    switchSelected: { colort: colors.invariant.text, fontWeight: 700 },
    switchNotSelected: { color: colors.invariant.component, fontWeight: 400 },
    optionsIconBtn: {
      padding: 0,
      margin: 0,
      minWidth: 'auto',
      background: 'none',
      '&:hover': {
        background: 'none'
      }
    },
    unknownWarning: {
      width: 'fit-content',
      border: `1px solid ${colors.invariant.lightHover}`,
      ...typography.caption2,
      color: colors.invariant.lightHover,
      padding: '5px 8px',
      paddingInline: 8,
      borderRadius: 9
    },
    grayscaleIcon: {
      filter: 'grayscale(100%)',
      transition: 'filter 0.7s ease-in-out',
      minWidth: '12px',
      minHeight: '12px'
    }
  }
})
