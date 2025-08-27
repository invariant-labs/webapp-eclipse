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
      [theme.breakpoints.down('lg')]: {
        flexDirection: 'column'
      }
    },
    headerBigText: { ...typography.heading1, color: colors.invariant.text },
    headerSmallText: { ...typography.body1, color: colors.invariant.textGrey },
    leaderboardHeaderSectionTitle: {
      width: '100%',
      color: colors.invariant.text,
      ...typography.heading4,
      textAlign: 'left',
      marginTop: '56px'
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
      borderBottom: `1px solid ${colors.invariant.light}`,
      '& h2': {
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
