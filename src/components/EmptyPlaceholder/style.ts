import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

interface StyleProps {
  newVersion?: boolean
}

export const useStyles = makeStyles<StyleProps>()((theme, { newVersion }) => ({
  container: {
    width: '100%',
    height: '370px',
    zIndex: 14
  },
  root: {
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 25,
    width: '100%',
    height: '100%',
    p: {
      textAlign: 'center'
    }
  },
  img: {
    paddingBottom: 25
  },
  blur: {
    width: '100%',
    height: '370px',
    position: 'absolute',
    zIndex: 13,
    borderRadius: newVersion ? 0 : 10,
    background: newVersion
      ? 'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)'
      : 'rgba(12, 11, 13, 0.8)'
  },
  desc: {
    ...typography.body2,
    fontWeight: 500,
    lineHeight: '20px',
    color: colors.invariant.lightHover
  },
  button: {
    height: 40,
    width: 200,
    marginTop: 20,
    color: colors.invariant.componentBcg,
    ...typography.body1,
    textTransform: 'none',
    borderRadius: 14,
    background: colors.invariant.pinkLinearGradientOpacity,

    '&:hover': {
      background: colors.invariant.pinkLinearGradient,
      boxShadow: '0px 0px 16px rgba(239, 132, 245, 0.35)',
      '@media (hover: none)': {
        background: colors.invariant.pinkLinearGradientOpacity,
        boxShadow: 'none'
      }
    }
  }
}))
