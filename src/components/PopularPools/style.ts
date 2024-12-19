import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    marginBottom: 64
  },
  title: {
    ...typography.heading4,
    color: colors.invariant.text,
    fontWeight: 700
  },
  swiperContainer: {
    background: colors.invariant.component,
    borderRadius: 32,
    position: 'relative'
  },
  swiper: {
    padding: 24
  },
  slide: {
    width: 238
  },
  controlButton: {
    width: 32,
    height: 32,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: `linear-gradient(to bottom, ${colors.invariant.green}, ${colors.invariant.pink})`,
    borderRadius: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer'
  },
  controlButtonPrev: {
    left: -48
  },
  controlButtonNext: {
    right: -48
  },
  controlButtonNextImage: {
    rotate: '180deg'
  },
  pagination: {
    position: 'absolute',
    bottom: -36,
    left: 0,
    right: 0
  },
  horizontal: {
    display: 'flex',
    justifyContent: 'center',
    gap: 24
  },
  bullet: {
    height: 12,
    width: 12,
    background: colors.invariant.newDark,
    borderRadius: '50%',
    border: `1px solid ${colors.invariant.component}`,
    cursor: 'pointer',

    '&:only-child': {
      visibility: 'hidden'
    }
  },
  bulletActive: {
    background: 'transparent',
    backgroundImage: `linear-gradient(to bottom, ${colors.invariant.newDark}, ${colors.invariant.newDark}), linear-gradient(to bottom, ${colors.invariant.green}, ${colors.invariant.pink})`,
    backgroundClip: 'padding-box, border-box',
    backgroundOrigin: 'border-box',
    border: '1px solid transparent'
  }
}))
