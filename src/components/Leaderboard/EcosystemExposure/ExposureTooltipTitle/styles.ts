import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ isFinished: boolean }>()((_theme, { isFinished }) => {
  return {
    tooltipWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    },
    header: {
      display: 'flex',
      justifyContent: 'flex-start',
      gap: 8,
      '& img': {
        width: 50,
        borderRadius: '6px'
      }
    },
    title: {
      width: 232,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      '& p': {
        ...typography.heading4,
        color: colors.invariant.text
      }
    },
    progressWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      '& p': {
        ...typography.body2,
        color: colors.invariant.textGrey
      },
      '& img': {
        width: 24,
        filter: !isFinished ? 'grayscale(100%)' : 'none',
        opacity: !isFinished ? 0.2 : 1
      }
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 8px',
      '& p': {
        ...typography.body2,
        color: colors.invariant.text
      },
      '& img': {
        width: 11
      }
    },
    description: {
      ...typography.body2,
      color: colors.invariant.textGrey
    }
  }
})

export default useStyles
