import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    sectionContent: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 24,
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column'
      }
    },
    headerBigText: { ...typography.heading1, color: colors.invariant.text },
    headerSmallText: { ...typography.body1, color: colors.invariant.textGrey },
    leaderboardHeaderSectionTitle: { ...typography.heading3, color: colors.white.main },
    tooltip: {
      color: colors.invariant.textGrey,
      ...typography.caption4,
      lineHeight: '24px',
      borderRadius: 14,
      width: 'fit-content',
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
    }
  }
})

export default useStyles
