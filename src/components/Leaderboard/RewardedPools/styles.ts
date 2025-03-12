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
    headerBigText: { ...typography.heading1, color: colors.invariant.text },
    headerSmallText: { ...typography.body1, color: colors.invariant.textGrey },
    leaderboardHeaderSectionTitle: {
      ...typography.heading3,
      color: colors.white.main,
      marginTop: '24px'
    },
    skeleton: {
      borderRadius: 24,
      width: '100%',
      opacity: 0.7,
      height: 275,
      [theme.breakpoints.down('md')]: {
        height: 750
      }
    },
    headerWrapper: {
      width: '100%',

      borderBottom: `2px solid ${colors.invariant.light}`,
      '& h1': {
        paddingLeft: '42px',
        marginBottom: '16px',
        ...typography.heading4,
        color: colors.invariant.textGrey,
        justifySelf: 'self-start'
      }
    }
  }
})

export default useStyles
