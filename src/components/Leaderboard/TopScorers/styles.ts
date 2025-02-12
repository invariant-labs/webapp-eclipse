import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    sectionContent: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 24,
      [theme.breakpoints.down('lg')]: {
        flexDirection: 'column'
      }
    },
    headerBigText: {
      ...typography.heading1,
      color: colors.invariant.text,
      [theme.breakpoints.down('lg')]: {
        ...typography.heading2
      }
    },
    headerSmallText: {
      maxWidth: '100%',
      ...typography.body1,
      color: colors.invariant.textGrey,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    leaderboardHeaderSectionTitle: {
      ...typography.heading3,
      color: colors.white.main,
      marginTop: '24px'
    },
    topScorersItem: {
      width: '100%',
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
      background: colors.invariant.component,
      [theme.breakpoints.down('sm')]: {
        boxSizing: 'border-box',
        width: '100%'
      }
    },
    skeleton: {
      borderRadius: 24,
      opacity: 0.7,
      height: 267,
      width: 319,
      [theme.breakpoints.down('md')]: {
        height: 122
      }
    }
  }
})

export default useStyles
