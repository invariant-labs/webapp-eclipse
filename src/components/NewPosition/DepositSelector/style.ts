import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => {
  return {
    wrapper: {
      borderRadius: 24,
      flexDirection: 'column',
      backgroundColor: colors.invariant.component,
      padding: '16px 24px 16px 24px',
      flex: '1 1 0%',

      [theme.breakpoints.down('sm')]: {
        padding: '16px 8px  16px 8px '
      }
    },
    tooltip: {
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 12,
      paddingRight: 12,
      color: colors.invariant.text,
      ...typography.caption2,
      background: colors.invariant.light,
      borderRadius: 14,
      lineHeight: '24px',
      maxWidth: 255,
      border: `1px solid ${colors.invariant.newDark}`
    },

    autoButton: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0
    },
    autoText: {
      marginRight: 3,
      flex: '0 0 auto'
    },
    infoTooltip: {
      marginLeft: 6,
      marginRight: 6,
      display: 'flex',
      alignItems: 'center'
    },
    tooltipIconWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 12,
      height: 12,
      minWidth: 12,
      minHeight: 12,
      flex: '0 0 auto',
      marginRight: 0
    },
    depositHeader: {
      width: '100%',
      flexDirection: 'column',
      marginBottom: 24,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8
    },
    depositHeaderContainer: {
      height: 30,
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    depositOptions: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 4,
      [theme.breakpoints.down('sm')]: {
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
    sectionTitle: {
      ...typography.heading4,
      color: colors.white.main,
      marginBottom: 24
    },
    subsectionTitle: {
      ...typography.heading4,
      color: colors.white.main
    },
    sectionWrapper: {
      borderRadius: 8,
      backgroundColor: colors.invariant.component,
      paddingTop: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    },
    inputLabel: {
      ...typography.body3,
      lineHeight: '16px',
      color: colors.invariant.light,
      marginBottom: 3
    },
    selects: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
        transition: '.3s all',
        cursor: 'pointer'
      }
    },
    arrows: {
      width: 32,
      cursor: 'pointer',
      transition: '300ms',

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
        color: colors.invariant.textGrey,
        fontWeight: 200,
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
      width: 60,
      height: 26,
      padding: 0,
      [theme.breakpoints.down('sm')]: {
        height: 32
      }
    },
    switchSelected: { color: colors.invariant.text, fontWeight: 700 },
    switchNotSelected: { color: colors.invariant.text, fontWeight: 400 },
    optionsIconBtn: {
      padding: 0,
      margin: 0,
      minWidth: 'auto',
      background: 'none',
      '&:hover': {
        background: 'none'
      },
      '&:disabled': {
        pointerEvents: 'auto',
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
    skeleton: {
      width: 128,
      height: 28,
      borderRadius: 9,
      backgroundColor: colors.invariant.light
    },
    unknownWarning: {
      width: 'fit-content',
      maxWidth: 131,
      alignSelf: 'flex-end',
      textAlign: 'center',
      border: `1px solid ${colors.invariant.lightGrey}`,
      ...typography.caption4,
      color: colors.invariant.lightGrey,
      padding: '5px 8px',
      paddingInline: 8,
      borderRadius: 9
    },
    errorWarning: {
      width: 'fit-content',
      maxWidth: 131,
      textAlign: 'center',
      border: `1px solid ${colors.invariant.Error}`,
      ...typography.caption4,
      color: colors.invariant.Error,
      padding: '5px 8px',
      paddingInline: 8,
      borderRadius: 9
    },
    whiteIcon: {
      filter: 'brightness(0) invert(100%)',
      transition: 'filter 0.7s ease-in-out',
      minWidth: '12px',
      minHeight: '12px'
    },
    grayscaleIcon: {
      filter: 'grayscale(100%)',
      transition: 'filter 0.7s ease-in-out',
      minWidth: '12px',
      minHeight: '12px'
    },
    errorIcon: {
      filter:
        'brightness(0) saturate(100%) invert(45%) sepia(83%) saturate(1283%) hue-rotate(327deg) brightness(98%) contrast(98%)',
      transition: 'filter 0.7s ease-in-out',
      minWidth: '12px',
      minHeight: '12px'
    },
    inputFirst: {
      marginBottom: 10
    },
    inputSecond: {
      marginBottom: 16
    },
    inputWrapper: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      background: colors.invariant.light,
      borderRadius: 20
    },
    checkbox: {
      width: 25,
      height: 25,
      marginLeft: 3,
      marginRight: 3,
      color: colors.invariant.newDark,
      '&.Mui-checked': {
        color: colors.invariant.green
      },
      '& .MuiSvgIcon-root': {
        fontSize: 25
      },
      padding: 0,
      '& .MuiIconButton-label': {
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0
      }
    },
    customIcon: {
      width: 20,
      height: 20,
      border: `1px solid ${colors.invariant.newDark}`,
      borderRadius: 3,
      boxSizing: 'border-box',
      backgroundColor: colors.invariant.component,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    checkboxWrapper: {
      transition: 'width 0.3s ease, opacity 0.3s ease',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center'
    }
  }
})
