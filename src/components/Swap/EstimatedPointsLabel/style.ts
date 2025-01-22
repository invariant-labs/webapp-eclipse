import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ isVisible: boolean; width: number }>()(
  (_theme, { isVisible, width }) => ({
    pointsBox: {
      height: 27,
      width: `${width}px`,
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
      transition: 'width 0.7s ease-in-out',
      position: 'relative',
      overflow: 'hidden'
    },

    pointsAmount: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      color: colors.invariant.pink
    },

    contentWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      justifySelf: 'center',
      gap: 4,
      willChange: 'opacity, transform',
      opacity: isVisible ? 1 : 0,
      position: 'absolute',
      transform: `translateY(${isVisible ? '0' : '-100%'})`,
      transition: isVisible
        ? 'opacity 0.7s ease-in-out, transform 0.5s ease-in-out'
        : 'opacity 0.7s ease-in-out 0.7s, transform 0.5s ease-in-out 0.7s',
      whiteSpace: 'nowrap'
    },

    alternativeContent: {
      display: 'flex',
      alignItems: 'center',
      justifySelf: 'anchor-center',

      gap: 4,
      willChange: 'opacity, transform',
      position: 'absolute',
      opacity: isVisible ? 0 : 1,
      transform: `translateY(${isVisible ? '100%' : '0'})`,
      transition: isVisible
        ? 'opacity 0.7s ease-in-out, transform 0.5s ease-in-out'
        : 'opacity 0.7s ease-in-out 0.7s, transform 0.5s ease-in-out 0.7s',
      whiteSpace: 'nowrap'
    },

    grayscaleIcon: {
      filter: 'grayscale(100%)',
      transition: 'filter 0.7s ease-in-out',
      minWidth: '14px',
      minHeight: '14px'
    }
  })
)

export default useStyles
