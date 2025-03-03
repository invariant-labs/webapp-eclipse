import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    mainWrapper: {
      maxWidth: '524px',
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        maxWidth: '100%'
      }
    },
    header: {
      alignItems: 'center',
      display: 'flex',
      gap: 8,

      '& p': {
        color: colors.invariant.textGrey,
        ...typography.heading4
      },
      '& img': {
        width: 14
      }
    },
    tooltipTitle: { '& p': { ...typography.body2, color: colors.invariant.textGrey } },
    pointsWrapper: {
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 214,
      width: '100%',

      [theme.breakpoints.down('sm')]: {
        maxWidth: '100%'
      },
      '& > *': {
        borderBottom: `1px solid ${colors.invariant.light}`
      },
      '& > *:last-of-type': {
        borderBottom: `0px solid ${colors.invariant.light}`
      }
    },
    boxWrapper: {
      gap: '8px',
      alignItems: 'center',
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '14px',
      width: '100%',
      height: '239px',
      border: '1px solid #EF84F540',
      justifyContent: 'space-between',
      background: '#111931',
      [theme.breakpoints.down('sm')]: {
        height: 'auto'
      }
    },
    section: {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between',
      gap: '24px'
    },

    headerBigText: { ...typography.heading1, color: colors.invariant.text },
    headerSmallText: { ...typography.body1, color: colors.invariant.textGrey },
    tooltipContentPoints: { ...typography.body2, color: colors.invariant.textGrey },
    leaderboardHeaderSectionTitle: { ...typography.heading3, color: colors.white.main },
    tooltip: {
      color: colors.invariant.textGrey,
      ...typography.caption4,
      lineHeight: '24px',
      borderRadius: 14,

      maxWidth: 225,
      fontSize: 16,
      padding: 16,
      background: 'transparent',
      backgroundImage: `linear-gradient(to bottom, ${colors.invariant.component}, ${colors.invariant.component}), linear-gradient(to bottom, ${colors.invariant.green}, ${colors.invariant.pink})`,
      backgroundClip: 'padding-box, border-box',
      backgroundOrigin: 'border-box',
      border: '1px solid transparent'
    },
    icon: {
      height: 40,
      width: 40
    },
    blur: {
      width: 120,
      height: 36,
      borderRadius: 16,
      background: `linear-gradient(90deg, ${colors.invariant.component} 25%, ${colors.invariant.light} 50%, ${colors.invariant.component} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s infinite'
    },
    button: {
      minWidth: '39px',
      height: '24px',
      background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
      borderRadius: '8px',
      fontStyle: 'normal',
      fontWeight: 700,
      fontSize: '12px',
      lineHeight: '15px',
      textTransform: 'none',
      color: colors.invariant.dark,
      '&:hover': {
        background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)'
      }
    },
    tooltipLink: {
      color: colors.invariant.green,
      textDecoration: 'underline'
    }
  }
})

export default useStyles
