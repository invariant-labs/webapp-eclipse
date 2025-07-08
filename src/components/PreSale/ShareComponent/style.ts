import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

type IProps = {
  backgroundImage: string
}

const useStyles = makeStyles<IProps>()((theme, { backgroundImage }) => ({
  popoverRoot: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  background: {
    position: 'fixed',
    inset: 0,
    background: colors.invariant.black,
    opacity: 0.7,
    zIndex: 101
  },
  root: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
    pointerEvents: 'none'
  },
  rootScreenshot: {
    width: 10000,
    height: 10000,
    top: -10000,
    left: -10000,
    bottom: 0,
    right: 0,
    zIndex: -1
  },
  container: {
    width: 480,
    background: `
      radial-gradient(circle at top, rgba(239, 132, 245, 0.25), transparent 75%),
      radial-gradient(circle at bottom, rgba(46, 224, 154, 0.25), transparent 75%),
    #202946
    `,
    padding: 32,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 32,
    position: 'relative',
    pointerEvents: 'all',
    margin: '0 16px',
    boxShadow: 'none',

    '&::before': {
      content: "''",
      position: 'absolute',
      top: 55,
      left: 69,
      right: 69,
      bottom: 55,
      backgroundImage: `url(${backgroundImage})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.3,
      pointerEvents: 'none'
    }
  },
  containerDisplay: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16
  },
  title: {
    fontSize: 64,
    letterSpacing: '-3%',
    lineHeight: '72px',
    color: colors.invariant.pink
  },
  titleDisplay: {
    [theme.breakpoints.down('sm')]: {
      fontSize: 32,
      lineHeight: '36px'
    }
  },
  description: {
    ...typography.heading3,
    color: colors.invariant.text,
    textAlign: 'center'
  },
  descriptionDisplay: {
    [theme.breakpoints.down('sm')]: {
      ...typography.heading4
    }
  },
  allocationContainer: {
    padding: 2,
    width: '100%',
    borderRadius: 12,
    background: `linear-gradient(0deg, ${colors.invariant.green}, ${colors.invariant.pink})`
  },
  allocationWrapper: {
    height: 128,
    background: `
      linear-gradient(to bottom, rgba(239, 132, 245, 0.25), transparent 25%),
      linear-gradient(to top, rgba(46, 224, 154, 0.25), transparent 25%),
    #202946
    `,
    borderRadius: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  allocationWrapperDisplay: {
    [theme.breakpoints.down('sm')]: {
      height: 64
    }
  },
  allocation: {
    fontSize: 48,
    letterSpacing: '-3%',
    lineHeight: '36px',
    color: colors.invariant.text
  },
  allocationDisplay: {
    [theme.breakpoints.down('sm')]: {
      fontSize: 24,
      lineHeight: '28px'
    }
  },
  buttonsContainer: {
    width: '100%',
    display: 'flex',
    gap: 16,

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  buttonContainer: {
    display: 'flex',
    gap: 4
  }
}))

export default useStyles
