import { colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{
  imagePosition: 'left' | 'right'
  imageOffsetTop: number
  imageOffsetSide: number
}>()((_theme, { imagePosition, imageOffsetTop }) => ({
  container: {
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '130px',
    background: colors.invariant.component,
    borderRadius: '24px',
    padding: '24px',
    boxSizing: 'border-box',
    maxWidth: '100%',
    [theme.breakpoints.down('lg')]: {
      height: 'auto',
      minHeight: '110px',
      padding: '20px'
    },

    [theme.breakpoints.down('md')]: {
      maxWidth: '100%',
      minHeight: '90px',
      padding: '16px'
    },

    [theme.breakpoints.down('sm')]: {
      minHeight: '80px',
      padding: '12px',
      borderRadius: '16px'
    }
  },
  titleWhite: {
    color: colors.invariant.text
  },
  titlePink: {
    color: colors.invariant.pink
  },
  titleGreen: {
    color: colors.invariant.green
  },
  contentContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%'
  },
  title: {
    fontSize: '48px',
    lineHeight: '1.2',
    textAlign: 'center',
    fontWeight: 700,
    color: colors.invariant.text,

    [theme.breakpoints.down('lg')]: {
      fontSize: '36px'
    },

    [theme.breakpoints.down('md')]: {
      fontSize: '30px'
    },

    [theme.breakpoints.down('sm')]: {
      fontSize: '24px'
    }
  },
  subtitle: {
    fontSize: '20px',
    lineHeight: '1.2',
    fontWeight: 400,
    textAlign: 'center',
    color: colors.invariant.textGrey,
    marginTop: '12px',

    [theme.breakpoints.down('lg')]: {
      fontSize: '18px',
      marginTop: '8px'
    },

    [theme.breakpoints.down('md')]: {
      fontSize: '16px',
      marginTop: '6px'
    },

    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
      marginTop: '4px'
    }
  },
  imageContainer: {
    position: 'absolute',
    transform: 'translate(0, -50%)',
    top: `${imageOffsetTop}%`,
    [imagePosition === 'right' ? 'right' : 'left']: '8px',

    [theme.breakpoints.down('sm')]: {
      [imagePosition === 'right' ? 'right' : 'left']: '4px',
      transform: 'translate(0, -50%) scale(0.7)'
    }
  },
  responsiveImage: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',

    [theme.breakpoints.down('lg')]: {
      maxWidth: '90px',
      maxHeight: '75px'
    },

    [theme.breakpoints.down('md')]: {
      maxWidth: '70px',
      maxHeight: '60px'
    }
  }
}))

export default useStyles
