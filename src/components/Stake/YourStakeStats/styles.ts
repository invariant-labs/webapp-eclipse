import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ bgImage?: string }>()((_theme, { bgImage }) => {
  return {
    mainWrapper: {
      maxWidth: 605,
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        maxWidth: '100%'
      }
    },
    header: {
      [theme.breakpoints.down(500)]: {
        display: 'none'
      },
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
    statsTitle: {
      ...typography.heading4,
      color: colors.invariant.text,
      textAlign: 'left',
      width: '100%',
      marginBottom: '16px'
    },
    tooltipTitle: { '& p': { ...typography.body2, color: colors.invariant.textGrey } },
    pointsContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      width: '100%',
      gap: '24px',

      [theme.breakpoints.down(500)]: {
        display: 'flex',
        flexDirection: 'column'
      }
    },
    mobileWrapper: {
      display: 'flex',
      gap: '8px'
    },
    pointsColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      [theme.breakpoints.up(500)]: {
        '& > *:nth-of-type(odd)': {
          borderBottom: `1px solid ${colors.invariant.light}`
        },
        '& > *:nth-of-type(even)': {
          borderBottom: 'none'
        }
      },
      [theme.breakpoints.down(500)]: {
        gap: '24px',
        borderBottom: 'none'
      }
    },
    divider: {
      background: colors.invariant.light,
      width: '1px',
      height: '165px',

      [theme.breakpoints.down(500)]: {
        display: 'none'
      }
    },
    boxLabel: {
      display: 'flex',
      gap: 4
    },
    blurOverlay: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      transform: 'translate(-50%,-50%)',
      top: '50%',
      left: '50%',
      backdropFilter: 'blur(2px)',
      zIndex: '2',
      padding: 4
    },
    boxWrapper: {
      position: 'relative',
      gap: '8px',
      alignItems: 'center',
      padding: '16px 24px',
      display: 'flex',

      flexDirection: 'column',
      borderRadius: '14px',
      width: '100%',
      height: '239px',
      border: '1px solid #EF84F540',
      justifyContent: 'center',
      background: '#111931',
      [theme.breakpoints.down(500)]: {
        height: 'auto',
        padding: '16px 0px',
        background: 'transparent',
        border: 'none'
      }
    },
    valueWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    withButtonWrapper: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: '8px',
      alignItems: 'center'
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
      borderRadius: 16
    },
    button: {
      minWidth: '39px',
      height: '24px',
      background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
      borderRadius: '8px',
      fontWeight: 700,
      fontSize: '12px',
      lineHeight: '15px',
      textTransform: 'none',
      color: colors.invariant.dark,
      '&:hover': {
        background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)'
      }
    },
    itemWrapper: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      padding: '12px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      [theme.breakpoints.down(500)]: {
        alignItems: 'center',

        border: '10px solid transparent',
        borderImage: `url(${bgImage}) 20 fill round`,

        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: 100,
        backgroundImage: `url(${bgImage})`
      }
    },
    tooltipLink: {
      color: colors.invariant.green,
      textDecoration: 'underline'
    }
  }
})

export default useStyles
