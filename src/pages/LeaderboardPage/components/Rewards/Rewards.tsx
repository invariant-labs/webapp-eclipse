import { Box, Button, Typography } from '@mui/material'
import { useStyles } from './styles'
import LaunchIcon from '@mui/icons-material/Launch'
import { colors } from '@static/theme'
import icons from '@static/icons'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { status } from '@store/selectors/solanaWallet'
import { Status } from '@store/reducers/solanaWallet'
import { actions as walletActions } from '@store/reducers/solanaWallet'

import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import { Link } from 'react-router-dom'
import { BN } from '@coral-xyz/anchor'
import { LEADERBOARD_DECIMAL } from '@pages/LeaderboardPage/config'
import { formatNumberWithCommas, printBN } from '@utils/utils'
export const Rewards = () => {
  const { classes } = useStyles()
  const currentUser = useSelector(leaderboardSelectors.currentUser)
  const walletStatus = useSelector(status)
  const dispatch = useDispatch()
  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])
  return (
    <Box className={classes.infoContainer}>
      <Box style={{ width: 'auto' }}>
        <Typography className={classes.header}>Rewards</Typography>
        <>
          <Typography className={classes.description}>
            Invariant Points are a rewards program designed to incentivize liquidity providers on
            Invariant. Earn points by providing liquidity and participating in community activities.
            Develop your own liquidity provision strategy and climb to the top of the leaderboard.
            Accumulated points can be used for future exclusive benefits.
          </Typography>
          <Box sx={{ marginTop: '32px' }}>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <img src={icons.airdrop} style={{ height: '32px', marginRight: '16px' }} />
              <Typography
                style={{
                  color: colors.invariant.textGrey,
                  fontSize: '20px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  letterSpacing: '-3%'
                }}>
                You currently have:
              </Typography>
            </Box>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '32px'
              }}>
              <Typography className={classes.pointsValue}>
                {currentUser
                  ? formatNumberWithCommas(
                      printBN(new BN(currentUser.points, 'hex'), LEADERBOARD_DECIMAL)
                    )
                  : 0}{' '}
                points
              </Typography>
              <Box style={{ width: '250px' }}>
                <Box>
                  <ChangeWalletButton
                    isDisabled={isConnected}
                    name={!isConnected ? 'Connect Wallet' : 'Claim'}
                    onConnect={() => {
                      dispatch(walletActions.connect(false))
                    }}
                    connected={false}
                    onDisconnect={() => {}}
                    className={classes.connectWalletButton}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          <Typography
            className={classes.description}
            style={{
              display: 'flex',
              justifyItems: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              marginTop: '32px'
            }}>
            If you want to learn more about rewards and points distribution, check out our docs.
            <Link
              to='https://docs.invariant.app/docs/invariant_points/mechanism'
              target='_blank'
              style={{ textDecoration: 'none' }}>
              <Button className={classes.button} style={{ marginTop: '16px' }}>
                Learn More <LaunchIcon classes={{ root: classes.clipboardIcon }} />
              </Button>
            </Link>
          </Typography>
        </>
      </Box>
    </Box>
  )
}
