import { Box, Button, Typography } from '@mui/material'
import { useStyles } from './styles'
import LaunchIcon from '@mui/icons-material/Launch'
import { colors } from '@static/theme'
import icons from '@static/icons'
import AnimatedButton, { ProgressState } from '@components/AnimatedButton/AnimatedButton'
import { useState } from 'react'
export const Rewards = () => {
  const { classes } = useStyles()
  const [progress, setProgress] = useState<ProgressState>('none')

  return (
    <Box className={classes.infoContainer}>
      <Box style={{ width: 'auto' }}>
        <Typography className={classes.header}>Rewards</Typography>

        <Typography className={classes.description}>
          Invariant Points are a rewards program designed to incentivize liquidity providers on
          Invariant. Earn points by providing liquidity and participating in community activities.
          Develop your own liquidity provision strategy and climb to the top of the leaderboard.
          Accumulated points can be used for future exclusive benefits.
        </Typography>
        <Box style={{ marginTop: '64px' }}>
          <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={icons.airdrop} style={{ height: '48px', marginRight: '24px' }} />
            <Typography
              style={{
                color: colors.invariant.textGrey,
                fontSize: '32px',
                fontWeight: 400,
                lineHeight: '36px',
                letterSpacing: '-3%'
              }}>
              You have now:
            </Typography>
          </Box>
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
            <Typography className={classes.pointsValue}>123,321,32 points</Typography>
            <Box style={{ width: '250px' }}>
              <AnimatedButton
                progress={progress}
                sx={{ width: '100%', marginTop: '64px' }}
                content='Claim'
                onClick={() => {
                  setProgress('progress')
                  setTimeout(() => {
                    setTimeout(() => {
                      setProgress('approvedWithSuccess')
                      setTimeout(() => {
                        setProgress('success')
                        setTimeout(() => {
                          setProgress('none')
                        }, 1000)
                      }, 1000)
                    }, 3000)
                  }, 2000)
                }}
              />
            </Box>
          </Box>
        </Box>
        <Typography className={classes.description} style={{ marginTop: '64px' }}>
          If you want to learn more about point system, read about them in our Docs.
          <Button className={classes.button} style={{ marginTop: '32px' }}>
            Learn More <LaunchIcon classes={{ root: classes.clipboardIcon }} />
          </Button>
        </Typography>
      </Box>
    </Box>
  )
}
