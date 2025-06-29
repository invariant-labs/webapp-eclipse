import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ hideSelect: boolean; notRoundIcon: boolean }>()(
  (theme, { hideSelect, notRoundIcon }) => ({
    button: {
      posiiton: 'relative',
      width: 'auto',
      textTransform: 'none',
      boxShadow: 'none',
      borderRadius: 12,
      height: 36,
      minWidth: 'auto',
      backgroundColor: colors.invariant.light,
      ...typography.body3,
      padding: '12px 18px',
      transition: '300ms',

      filter: 'brightness(0.8)',

      '&:hover': hideSelect
        ? { backgroundColor: colors.invariant.light, cursor: 'default' }
        : {
            filter: 'brightness(1)',
            backgroundColor: colors.invariant.light,
            '@media (hover: none)': {
              filter: 'brightness(0.8)'
            }
          },

      [theme.breakpoints.down('sm')]: {
        minWidth: 'auto'
      }
    },
    tokenName: {
      position: 'relative',
      top: 1,
      color: colors.white.main
    },
    imageContainer: {
      minWidth: 20,
      maxWidth: 20,
      height: 20,
      marginRight: 5,
      position: 'relative'
    },
    icon: {
      marginRight: 5,
      borderRadius: '50%',
      minWidth: 20,
      height: 20,
      ...(notRoundIcon ? {} : { borderRadius: '100%' })
    },
    warningIcon: {
      position: 'absolute',
      width: 12,
      height: 12,
      bottom: -6,
      right: -6
    }
  })
)
export default useStyles
