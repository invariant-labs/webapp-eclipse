import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ isVisible: boolean; width: number; isChanging: boolean }>()(
  (_theme, { isVisible, width, isChanging }) => ({
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
      transition: 'width 0.3s ease-in-out',
      position: 'relative',
      overflow: 'hidden'
    },
    boostPoints: {
      height: '14px',
      width: '12px'
    },
    infoCircle: {
      width: '15px',
      marginLeft: '5px'
    },
    boostWrapper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      marginLeft: '8px'
    },
    pointsAmount: {
      borderRight: '1px solid #3A466B',
      paddingRight: '10px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: colors.invariant.pink
    },
    pointsValue: {
      width: '50px',
      textAlign: 'center',
      transition: 'filter 0.3s ease-in-out',
      filter: isChanging ? 'blur(10px)' : 'blur(0)'
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
        ? 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
        : 'opacity 0.3s ease-in-out 0.3s, transform 0.3s ease-in-out 0.3s',
      whiteSpace: 'nowrap'
    },

    alternativeContent: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      gap: 4,
      willChange: 'opacity, transform',
      position: 'absolute',
      opacity: isVisible ? 0 : 1,
      transform: `translateY(${isVisible ? '100%' : '0'})`,
      transition: isVisible
        ? 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
        : 'opacity 0.3s ease-in-out 0.3s, transform 0.3s ease-in-out 0.3s',
      whiteSpace: 'nowrap'
    },

    grayscaleIcon: {
      filter: 'grayscale(100%)',
      transition: 'filter 0.3s ease-in-out',
      minWidth: '12px',
      minHeight: '12px'
    }
  })
)

export default useStyles
