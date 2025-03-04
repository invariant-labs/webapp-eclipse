import { Box, Button, Grid, Typography } from '@mui/material'
import { useStyles } from './styles'
import LaunchIcon from '@mui/icons-material/Launch'
import icons from '@static/icons'
import { useMemo } from 'react'
import { Status } from '@store/reducers/solanaWallet'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import { Link } from 'react-router-dom'
import { BN } from '@coral-xyz/anchor'
import { formatNumberWithCommas, printBN, removeAdditionalDecimals } from '@utils/utils'
import RewardsList from './RewardsList/RewardsList'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import { CurrentUser } from '@store/reducers/leaderboard'
import { PublicKey } from '@solana/web3.js'

interface ClaimProps {
  walletStatus: Status
  currentUser: CurrentUser
  onConnectWallet: () => void
  userAddress: PublicKey
}

export const Claim: React.FC<ClaimProps> = ({
  walletStatus,
  currentUser,
  onConnectWallet,
  userAddress
}) => {
  const { classes } = useStyles()

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])
  return (
    <Grid position='relative'>
      <Box className={classes.infoContainer}>
        <Box style={{ width: 'auto' }}>
          <Typography className={classes.header}>Claim</Typography>
          <>
            <Typography className={classes.description}>
              Invariant Points program is designed to incentivize liquidity providers on Invariant.
              Earn points by providing liquidity and participating in community activities. Develop
              your own liquidity provision strategy and climb to the top of the leaderboard.
              Accumulated points can be used for future exclusive benefits.
            </Typography>
            <Box sx={{ marginTop: '32px' }}>
              <Box className={classes.airdropLabel}>
                <img src={icons.airdrop} style={{ height: '32px', marginRight: '16px' }} />
                <Typography>You currently have:</Typography>
              </Box>
              <Box className={classes.pointsWrapper}>
                <Typography className={classes.pointsValue}>
                  {currentUser
                    ? removeAdditionalDecimals(
                        formatNumberWithCommas(
                          printBN(new BN(currentUser.total?.points, 'hex'), LEADERBOARD_DECIMAL)
                        ),
                        2
                      )
                    : 0}{' '}
                  points
                </Typography>
                <Box style={{ width: '250px' }}>
                  <Box>
                    <ChangeWalletButton
                      isDisabled={isConnected}
                      name={!isConnected ? 'Connect Wallet' : 'Claim'}
                      onConnect={onConnectWallet}
                      connected={false}
                      onDisconnect={() => {}}
                      className={classes.connectWalletButton}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
            <Typography className={classes.description}>
              If you want to learn more about points distribution, check out our docs.
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
      <RewardsList userAddress={userAddress} isConnected={isConnected} />
    </Grid>
  )
}
