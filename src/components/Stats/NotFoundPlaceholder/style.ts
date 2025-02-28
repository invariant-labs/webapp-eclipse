import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    title: {
      ...typography.heading2,
      color: colors.invariant.text
    },
    subtitle: {
      ...typography.body3,
      color: colors.invariant.textGrey,
      marginTop: 24
    },

    img: {
      paddingBottom: 37
    },
    container: {
      background:
        'linear-gradient(360deg, rgba(32, 41, 70, 0.8) 0%, rgba(17, 25, 49, 0.8) 100%), linear-gradient(180deg, #010514 0%, rgba(1, 5, 20, 0) 100%)',

      borderBottom: `1px solid ${colors.invariant.light}`
    }
  }
})

export default useStyles
