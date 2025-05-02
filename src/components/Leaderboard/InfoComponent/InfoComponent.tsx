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
          The Invariant Points Program rewards liquidity providers and active community members.
          Earn points by adding liquidity, swapping, and creating content about Invariant. Watch for
          pool boosts to earn even more. Develop your strategy, climb the leaderboard, and unlock
          access to exclusive future rewards.
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
            transition: 'opacity 0.3s ease-in',
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
