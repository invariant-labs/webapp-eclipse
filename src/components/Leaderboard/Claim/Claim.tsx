import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { useStyles } from './styles'
import LaunchIcon from '@mui/icons-material/Launch'
import { airdropIcon } from '@static/icons'
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
import { Button } from '@common/Button/Button'
import { theme } from '@static/theme'

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
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
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
              <Box className={classes.iconWrapper}>
                <img src={airdropIcon} style={{ height: '32px', marginRight: '16px' }} />
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
                <Box mt={3}>
                  {isConnected ? (
                    <Button scheme='green' disabled width={200} height={44}>
                      Claim
                    </Button>
                  ) : (
                    <ChangeWalletButton
                      name={isSm ? 'Connect' : 'Connect Wallet'}
                      onConnect={onConnectWallet}
                      connected={false}
                      onDisconnect={() => {}}
                      className={classes.connectWalletButton}
                    />
                  )}
                </Box>
              </Box>
            </Box>
            <Box className={classes.description2}>
              If you want to learn more about points distribution, check out our docs.
              <Link
                to='https://docs.invariant.app/docs/invariant_points/mechanism'
                target='_blank'
                style={{ textDecoration: 'none' }}>
                <Box mt={2}>
                  <Button scheme='green' width={200} height={44}>
                    <Box className={classes.learnMoreButton}>
                      Learn more <LaunchIcon classes={{ root: classes.clipboardIcon }} />
                    </Box>
                  </Button>
                </Box>
              </Link>
            </Box>
          </>
        </Box>
      </Box>
      <RewardsList userAddress={userAddress} isConnected={isConnected} />
    </Grid>
  )
}
