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
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column'
      }
    },
    innerSectionContent: {
      display: 'flex',
      gap: 24,
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column'
      },

      [theme.breakpoints.up('lg')]: {
        width: '100%',
        justifyContent: 'space-between',
        marginInline: 48
      }
    },
    headerBigText: {
      ...typography.heading1,
      color: colors.invariant.text,
      [theme.breakpoints.down('lg')]: {
        ...typography.heading3
      }
    },
    headerWrapper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      width: 'fit-content',
      textWrap: 'nowrap'
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
      textAlign: 'left',
      width: '100%',
      ...typography.heading4,
      color: colors.white.main,
      marginTop: '56px'
    },
    topScorersItem: {
      width: 284,
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      gap: 24,
      [theme.breakpoints.up('lg')]: {
        width: 316
      }
    },
    topScorersItemBox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      width: 248,
      border: '2px solid #EF84F580',
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
      background: colors.invariant.component,
      [theme.breakpoints.down('sm')]: {
        boxSizing: 'border-box',
        width: '100%'
      },
      [theme.breakpoints.up('lg')]: {
        paddingLeft: 32,
        paddingRight: 32
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
