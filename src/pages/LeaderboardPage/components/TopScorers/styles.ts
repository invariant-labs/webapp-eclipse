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
      [theme.breakpoints.down('lg')]: {
        flexDirection: 'column'
      }
    },
    headerBigText: { ...typography.heading1, color: colors.invariant.text },
    headerSmallText: { ...typography.body1, color: colors.invariant.textGrey },
    leaderboardHeaderSectionTitle: { ...typography.heading3, color: colors.white.main },
    topScorersItem: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      gap: 24
    },
    topScorersItemBox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      width: 267,
      border: '2px solid #EF84F580',
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 24,
      paddingRight: 24,
      background: colors.invariant.component
    }
  }
})

export default useStyles
