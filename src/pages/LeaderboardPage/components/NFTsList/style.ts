import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'
import pinkBackground from '@static/png/nftBackgroundPink.png'
import greenBackground from '@static/png/nftBackgroundGreen.png'

export const useStylesList = makeStyles()(theme => ({
  container: {
    marginInline: 40,

    [theme.breakpoints.down('sm')]: {
      marginInline: 8
    }
  },
  list: {
    paddingRight: 32,

    [theme.breakpoints.down('md')]: {
      paddingRight: 12
    }
  },
  scrollbarThumb: {
    backgroundColor: `${colors.invariant.pink} !important`,
    borderRadius: 5,
    width: 8
  },
  scrollbarTrack: {
    background: `${colors.invariant.light} !important`,
    borderRadius: 5,
    width: '8px !important'
  },
  scrollbarView: {
    overflowX: 'hidden !important' as any,

    '&::-webkit-scrollbar': {
      width: 6,
      background: colors.invariant.component
    },
    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.pink,
      borderRadius: 6
    }
  },
  root: {
    display: 'none'
  },
  scrollbar: {
    margin: '72px auto 72px'
  }
}))

export const useStyles = makeStyles<{ isEven: boolean }>()((theme, { isEven }) => ({
  container: {
    padding: 24,
    borderRadius: 12,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    background: isEven ? colors.invariant.darkGreenGradient : colors.invariant.darkPinkGradient,
    zIndex: 2
  },
  innerContainer: {
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    }
  },
  background: {
    position: 'absolute',
    zIndex: -1,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '12px',
    backgroundImage: isEven ? `url(${greenBackground})` : `url(${pinkBackground})`
  },
  number: {
    color: colors.invariant.text,
    marginRight: 16,
    fontSize: 48,
    fontWeight: 700,
    lineHeight: '36px'
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
    width: 200,
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
    },
    '&:disabled': {
      background: colors.invariant.light,
      ...typography.body1,
      color: colors.invariant.textGrey,
      textTransform: 'none'
    }
  },
  label: {
    backgroundColor: colors.invariant.light,
    padding: '8px 16px',
    borderRadius: 16,
    width: 282,

    p: {
      ...typography.body2,
      textAlign: 'center',
      color: colors.invariant.text,
      lineHeight: '24px'
    },
    span: {
      color: isEven ? colors.invariant.green : colors.invariant.pink,
      ...typography.body1,
      lineHeight: '24px'
    }
  }
}))
export default useStyles
