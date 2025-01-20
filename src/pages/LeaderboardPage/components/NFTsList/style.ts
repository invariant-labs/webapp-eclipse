import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'
import pinkBackground from '@static/png/nftBackgroundPink.png'
import greenBackground from '@static/png/nftBackgroundGreen.png'

export const useStyles = makeStyles<{ isEven: boolean }>()((_theme, { isEven }) => ({
  container: {
    maxWidth: 1072,
    padding: '0 24px',
    borderRadius: '24px',
    backgroundImage: isEven ? `url(${pinkBackground})` : `url(${greenBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },
  number: {
    color: colors.invariant.text,
    marginRight: 16
  },
  subtitle: {
    ...typography.heading4,
    color: colors.invariant.textGrey,
    textAlign: 'center',
    marginLeft: 10
  },
  title: {
    ...typography.heading1,
    fontSize: 40,
    color: colors.invariant.text,
    textAlign: 'center'
  },
  button: {
    height: 44,
    background: colors.invariant.light,
    ...typography.body1,
    color: colors.invariant.textGrey,
    textTransform: 'none',
    borderRadius: 16,

    '&:hover': {
      background: colors.invariant.lightHover2,
      '@media (hover: none)': {
        background: colors.invariant.light
      }
    }
  },
  label: {
    backgroundColor: colors.invariant.light,
    padding: '14px 16px',
    borderRadius: 16,
    width: 282,

    p: {
      ...typography.body2,
      textAlign: 'center',
      color: colors.invariant.text
    }
  },
  pink: {
    color: colors.invariant.pink,
    ...typography.body1
  }
}))
export default useStyles
