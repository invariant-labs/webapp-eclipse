import { makeStyles } from 'tss-react/mui'
import React from 'react'
import GreenWaves from '@static/png/greenWavesFromTop.webp'
import PurpleWaves from '@static/png/purpleWavesFromBottom.webp'

const useStyles = makeStyles<{ isVisible: boolean }>()((_theme, { isVisible }) => ({
  waveImage: {
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'center',
    '& img': {
      width: '100%',
      position: 'absolute',
      objectFit: 'cover',
      zIndex: 0
    }
  },
  topWave: {
    width: '100%',
    position: 'absolute',
    top: 0,
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    left: 0,
    '& img': {
      borderTopLeftRadius: 24
    }
  },
  bottomWave: {
    width: '100%',
    position: 'absolute',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    bottom: 0,
    left: 0,
    '& img': {
      borderBottomRightRadius: 24
    }
  }
}))

interface AnimatedWavesProps {
  wavePosition: 'top' | 'bottom'
  isAnimating?: boolean
}

const AnimatedWaves: React.FC<AnimatedWavesProps> = ({ wavePosition, isAnimating = false }) => {
  const { classes } = useStyles({ isVisible: isAnimating })

  const renderWaves = (position: 'top' | 'bottom', imageSrc: string) => (
    <div
      className={`${classes.waveImage} ${classes[`${position}Wave`]}`}
      style={{ alignItems: position === 'top' ? 'flex-start' : 'flex-end' }}>
      <img src={imageSrc} alt={`${position === 'top' ? 'Purple' : 'Green'} waves`} />
    </div>
  )

  return (
    <>
      {wavePosition === 'top' ? renderWaves('top', GreenWaves) : renderWaves('bottom', PurpleWaves)}
    </>
  )
}

export default AnimatedWaves
