import { alpha, Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const caption2styles = {
  ...typography.caption2,
  color: colors.invariant.lightHover,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 1,
  marginRight: 6
}
export const useStyles = makeStyles<{ disableBackgroundColor: boolean }>()(
  (theme: Theme, { disableBackgroundColor }) => ({
    wrapper: {
      position: 'relative',

      [theme.breakpoints.down('md')]: {
        minWidth: 0
      }
    },
    root: {
      width: '100%',
      backgroundColor: disableBackgroundColor ? 'transparent' : colors.invariant.componentBcg,
      borderRadius: 20,
      padding: '6px 12px',
      ...typography.heading3
    },
    inputContainer: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'nowrap'
    },
    positiveDifference: {
      ...typography.tiny1,
      padding: '2px 5px',
      color: colors.invariant.green,
      backgroundColor: `${colors.invariant.green}40`,
      borderRadius: '5px'
    },
    negativeDifference: {
      ...typography.tiny1,
      padding: '2px 5px',
      color: colors.invariant.Error,
      backgroundColor: `${colors.invariant.Error}40`,
      borderRadius: '5px'
    },
    input: {
      color: colors.invariant.light,
      ...typography.heading3,
      width: '100%',
      textAlign: 'left',
      transition: 'all .3s',
      '& ::placeholder': {
        textAlign: 'left'
      }
    },
    innerInput: {
      color: colors.white.main
    },
    balanceWrapper: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'nowrap'
    },
    currency: {
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'nowrap',
      minWidth: 85,
      width: 'fit-content',

      cursor: 'default',
      marginLeft: 12
    },
    percentages: {
      flexShrink: 0,
      width: 'fit-content',
      justifyContent: 'end',
      height: 17,
      alignItems: 'center',
      flexWrap: 'nowrap'
    },
    percentage: {
      ...typography.tiny1,
      borderRadius: 5,
      paddingInline: 5,
      marginRight: 3,
      height: 16,
      lineHeight: '16px',
      display: 'flex',
      marginTop: 1
    },
    currencySymbol: {
      ...typography.heading3,
      color: colors.invariant.light
    },
    noCurrencyText: {
      ...typography.heading3,
      color: colors.white.main,
      cursor: 'default',
      transform: 'scaleX(2)'
    },
    marketPriceBtn: {
      textDecoration: 'none',
      background: 'none',
      outline: 'none',
      border: 'none',
      padding: '2px 4px',
      color: colors.invariant.green,
      ...typography.caption2,
      transition: 'background 300ms ease-in-out',

      '&:hover': {
        background: alpha(colors.invariant.light, 0.3),
        borderRadius: 6,
        padding: '2px 4px',
        cursor: 'pointer'
      }
    },
    estimatedBalance: {
      ...caption2styles
    },
    noData: {
      color: colors.invariant.warning,
      ...typography.caption2,
      cursor: 'default',
      display: 'flex',
      flexDirection: 'row'
    },
    noDataIcon: {
      marginRight: 5,
      height: 9.5,
      width: 9.5,
      border: '1px solid #EFD063',
      color: colors.invariant.warning,
      borderRadius: '50%',
      fontSize: 8,
      lineHeight: '10px',
      fontWeight: 400,
      textAlign: 'center',
      alignSelf: 'center',
      cursor: 'default'
    },
    blocker: {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 11,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(11, 12, 13, 0.88)',
      filter: 'blur(4px) brightness(0.4)',
      borderRadius: 20
    },
    blockedInfoWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 12,
      height: '100%'
    },
    blockedInfo: {
      ...typography.body2,
      color: colors.invariant.lightHover
    },
    loading: {
      width: 15,
      height: 15
    }
  })
)
export default useStyles
