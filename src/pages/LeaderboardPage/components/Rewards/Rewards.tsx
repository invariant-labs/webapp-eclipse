import { Box, Button, Typography } from '@mui/material'
import { useStyles } from './styles'
import LaunchIcon from '@mui/icons-material/Launch'
import { colors } from '@static/theme'
import icons from '@static/icons'
import AnimatedButton, { ProgressState } from '@components/AnimatedButton/AnimatedButton'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { status } from '@store/selectors/solanaWallet'
import { Status } from '@store/reducers/solanaWallet'
import { actions as walletActions } from '@store/reducers/solanaWallet'

import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
export const Rewards = () => {
  const { classes } = useStyles()
  const currentUser = useSelector(leaderboardSelectors.currentUser)
  const [progress, setProgress] = useState<ProgressState>('none')
  const walletStatus = useSelector(status)
  const dispatch = useDispatch()
  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])
  return (
    <Box className={classes.infoContainer}>
      <Box style={{ width: 'auto' }}>
        <Typography className={classes.header}>Rewards</Typography>
        {isConnected ? (
          <>
            <Typography className={classes.description}>
              Invariant Points are a rewards program designed to incentivize liquidity providers on
              Invariant. Earn points by providing liquidity and participating in community
              activities. Develop your own liquidity provision strategy and climb to the top of the
              leaderboard. Accumulated points can be used for future exclusive benefits.
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
                <Typography className={classes.pointsValue}>
                  {currentUser?.points ?? 0} points
                </Typography>
                <Box style={{ width: '250px' }}>
                  <AnimatedButton
                    disabled={true}
                    progress={progress}
                    sx={{ width: '100%', marginTop: '64px' }}
                    content='Claim'
                    onClick={() => {}}
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
          </>
        ) : (
          <>
            <Typography
              style={{
                color: colors.invariant.textGrey,
                fontSize: '32px',
                textAlign: 'center',
                letterSpacing: '-3%',
                lineHeight: '36px',
                fontWeight: 400,
                marginTop: '32px'
              }}>
              Find out your eligibility by connecting your Wallet below!
            </Typography>
            <Typography
              style={{
                color: colors.invariant.textGrey,
                fontSize: '24px',
                textAlign: 'center',
                letterSpacing: '-3%',
                lineHeight: '28px',
                fontWeight: 400,
                marginTop: '32px'
              }}>
              You need to connect you Wallet before proceeding to claim your Airdrop!
            </Typography>
            <ChangeWalletButton
              name='Connect wallet'
              onConnect={() => {
                dispatch(walletActions.connect(false))
              }}
              connected={false}
              onDisconnect={() => {}}
              className={classes.connectWalletButton}
            />
          </>
        )}
      </Box>
    </Box>
  )
}
