import { keyframes } from '@mui/material'
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

interface StyleProps {
  rotateRight: boolean
}

const useStyles = makeStyles<StyleProps>()((_theme, { rotateRight }) => {
  const rotate = keyframes`
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: ${rotateRight ? 'rotate(-360deg)' : 'rotate(360deg)'}; ;
    }
  `

  return {
    wrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: 36,
      margin: '12px 0'
    },
    separator: {
      width: '100%',
      borderTop: `1px solid ${colors.invariant.light}`
    },
    centered: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    swapArrow: {
      padding: 8,
      width: 16,
      height: 16,
      cursor: 'pointer',
      border: `1px solid ${colors.invariant.light}`,
      borderRadius: '50%',
      backgroundColor: colors.invariant.component,
      transition: 'filter 0.3s ease',
      '&:hover': {
        filter: 'brightness(1.2)'
      }
    },
    rotate: {
      animation: `${rotate} 0.3s ease-in-out`
    }
  }
})

export default useStyles
