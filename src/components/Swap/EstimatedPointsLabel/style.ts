import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ isVisible: boolean }>()((_theme, { isVisible }) => ({
  pointsBox: {
    height: 27,
    minWidth: isVisible ? '110px' : '160px',
    padding: '0px 8px',
    borderRadius: 8,
    backgroundColor: colors.invariant.component,
    color: colors.invariant.textGrey,
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'none',
    willChange: 'width',
    gap: 4,
    transition: isVisible ? 'all 0.7s ease-in-out' : 'min-width 0.7s ease-in-out',
    position: 'relative',
    overflow: 'hidden'
  },

  pointsAmount: {
    color: colors.invariant.pink
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    width: '100%',
    left: 8,
    position: 'absolute',
    willChange: 'opacity, transform',
    opacity: isVisible ? 1 : 0,
    transform: `translateY(${isVisible ? '0' : '-100%'})`,
    transition: isVisible
      ? 'opacity 0.7s ease-in-out, transform 0.5s ease-in-out'
      : 'opacity 0.7s ease-in-out 0.7s, transform 0.5s ease-in-out 0.7s'
  },
  alternativeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    width: '100%',
    left: 8,
    position: 'absolute',
    willChange: 'opacity, transform',
    opacity: isVisible ? 0 : 1,
    transform: `translateY(${isVisible ? '100%' : '0'})`,
    transition: isVisible
      ? 'opacity 0.7s ease-in-out, transform 0.5s ease-in-out'
      : 'opacity 0.7s ease-in-out 0.7s, transform 0.5s ease-in-out 0.7s'
  },
  grayscaleIcon: {
    filter: 'grayscale(100%)',
    transition: 'filter 0.7s ease-in-out',
    minWidth: '14px',
    minHeight: '14px'
  }
}))

export default useStyles
