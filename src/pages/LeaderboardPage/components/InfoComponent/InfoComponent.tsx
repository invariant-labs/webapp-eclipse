import { Box, Button, Typography } from '@mui/material'
import { useStyles } from './styles'
import Jupi from '@static/png/jupi.png'
import { colors } from '@static/theme'
import './animation.css'

export const InfoComponent = () => {
  const { classes } = useStyles()
  return (
    <Box className={classes.infoContainer}>
      <Box style={{ width: '50%' }}>
        <Typography
          style={{
            color: colors.invariant.text,
            fontSize: '50px',
            fontWeight: '600',
            lineHeight: '40px',
            letterSpacing: '-0.03em',
            maxWidth: '800px'
          }}>
          What are Invariant Points?
        </Typography>

        <Typography
          style={{
            color: colors.invariant.textGrey,
            fontSize: '24px',
            fontWeight: '400',
            lineHeight: '28px',
            letterSpacing: '-0.03em',
            marginTop: '32px',
            maxWidth: '800px'
          }}>
          Invariant Points are a rewards program designed to incentivize liquidity providers on
          Invariant. Earn points by providing liquidity and participating in community activities.
          Develop your own liquidity provision strategy and climb to the top of the leaderboard.
          Accumulated points can be used for future exclusive benefits.
        </Typography>
        <Button className={classes.button} style={{ marginTop: '32px' }}>
          Learn More{' '}
        </Button>
      </Box>
      <Box style={{ width: '40%', marginLeft: '56px' }}>
        <img
          src={Jupi}
          alt='Astronaut flying in space'
          className={`${classes.astronaut} floating-astronaut`}
        />
      </Box>
    </Box>
  )
}
