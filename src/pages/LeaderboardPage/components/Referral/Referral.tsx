import { Box, Button, Grid, Input, Typography } from '@mui/material'
import { useStyles } from './styles'
import { Link } from 'react-router-dom'
import icons from '@static/icons'
import classNames from 'classnames'
import { useState } from 'react'
import LaunchIcon from '@mui/icons-material/Launch'

export const Referral = () => {
  const { classes } = useStyles()

  const [inputValue, setInputValue] = useState('')

  return (
    <Box className={classes.container}>
      <Box className={classes.innerContainer}>
        <Typography className={classes.header}>Referral Code</Typography>
        <Box>
          <Typography className={classes.subtitle}>
            <img src={icons.airdropGray} style={{ height: '24px', marginRight: '24px' }} />
            You’ve got referral points:
          </Typography>
          <Typography className={classes.points}> {12345} points</Typography>
          <Link
            to='https://docs.invariant.app/docs/invariant_points/mechanism'
            target='_blank'
            style={{ textDecoration: 'none' }}>
            <Button className={classNames(classes.button, classes.green)}>
              Share on
              <img src={icons.xIconBlack} />
            </Button>
          </Link>
        </Box>
        <Box>
          <Typography className={classes.description}>
            Invariant Points are a rewards program designed to incentivize liquidity providers on
            Invariant. Earn points by providing liquidity and participating in community activities.
            Develop your own liquidity provision strategy and climb to the top of the leaderboard.
            Accumulated points can be used for future exclusive benefits.
          </Typography>

          <Grid container mt={4}>
            <Grid className={classes.column}>
              <Typography className={classes.subtitle}>Your individual code</Typography>
              <input
                className={classNames(classes.input)}
                value={'https://invariant.app/points/referral'}
                disabled
              />
              <Link
                to='https://docs.invariant.app/docs/invariant_points/mechanism'
                target='_blank'
                style={{ textDecoration: 'none' }}>
                <Button className={classNames(classes.button, classes.green)}>
                  Share on
                  <img src={icons.xIconBlack} />
                </Button>
              </Link>
            </Grid>
            <div className={classNames(classes.verticalDivider)} />
            <Grid className={classes.column}>
              <Typography className={classes.subtitle}>
                Paste here your friend’s referral code
              </Typography>
              <input
                className={classNames(classes.input)}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder='Paste here your friend’s referral code'
              />
              <Link
                to='https://docs.invariant.app/docs/invariant_points/mechanism'
                target='_blank'
                style={{ textDecoration: 'none' }}>
                <Button className={classNames(classes.button, classes.pink)}>
                  Confirm Referral Code
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Box>
        <Grid container flexDirection={'column'} gap={2}>
          <Typography className={classes.description}>
            If you want to learn more about point system, read about them in our Docs.
          </Typography>
          <Link
            to='https://docs.invariant.app/docs/invariant_points/mechanism'
            target='_blank'
            style={{ textDecoration: 'none' }}>
            <Button className={classNames(classes.button, classes.green)}>
              Learn more
              <LaunchIcon classes={{ root: classes.clipboardIcon }} />
            </Button>
          </Link>
        </Grid>
      </Box>
    </Box>
  )
}
