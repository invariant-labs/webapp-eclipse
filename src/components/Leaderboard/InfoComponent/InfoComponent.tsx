import { Box, Typography } from '@mui/material'
import { useStyles } from './styles'
import Jupi from '@static/png/jupi.png'
import './animation.css'
import LaunchIcon from '@mui/icons-material/Launch'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@common/Button/Button'

export const InfoComponent = () => {
  const { classes } = useStyles()
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Box className={classes.infoContainer}>
      <Box style={{ width: 'auto' }}>
        <Typography className={classes.header}>What are Invariant Points?</Typography>

        <Typography className={classes.description}>
          Invariant Points program is designed to incentivize liquidity providers on Invariant. Earn
          points by providing liquidity and participating in community activities. Develop your own
          liquidity provision strategy and climb to the top of the leaderboard. Accumulated points
          can be used for future exclusive benefits.
        </Typography>
        <Box className={classes.linkButtonContainer}>
          <Link
            to='https://docs.invariant.app/docs/invariant_points/overview'
            target='_blank'
            style={{
              textDecoration: 'none'
            }}>
            <Button scheme='green' padding='0 42px'>
              <Box className={classes.learnMoreButton}>
                Learn more <LaunchIcon classes={{ root: classes.clipboardIcon }} />
              </Box>
            </Button>
          </Link>
        </Box>
      </Box>
      <Box
        style={{ width: 'auto', position: 'relative' }}
        sx={{ display: { xs: 'none', md: 'block' } }}>
        {!imageLoaded && (
          <div
            style={{
              width: '332px',
              backgroundColor: 'transparent'
            }}
          />
        )}
        <img
          src={Jupi}
          alt='Astronaut flying in space'
          className={`${classes.astronaut} floating-astronaut`}
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.7s ease-in',
            position: imageLoaded ? 'relative' : 'absolute',
            top: 0,
            left: 0
          }}
          onLoad={() => setImageLoaded(true)}
        />
      </Box>
    </Box>
  )
}
