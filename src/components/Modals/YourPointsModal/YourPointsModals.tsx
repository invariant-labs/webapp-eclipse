import React, { useMemo } from 'react'
import useStyles from './style'
import { Box, Divider, Grid, Popover, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { status } from '@store/selectors/solanaWallet'
import { Status } from '@store/reducers/solanaWallet'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import { printBN, ROUTES, trimZeros } from '@utils/utils'
import { BN } from '@coral-xyz/anchor'
import { network } from '@store/selectors/solanaConnection'
import { NetworkType } from '@store/consts/static'
import { formatLargeNumber } from '@utils/uiUtils'
import { Button } from '@common/Button/Button'

export interface ISelectNetworkModal {
  open: boolean
  anchorEl: HTMLButtonElement | null
  handleClose: () => void
}

export const YourPointsModal: React.FC<ISelectNetworkModal> = ({ anchorEl, open, handleClose }) => {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const currentNetwork = useSelector(network)
  const walletStatus = useSelector(status)
  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])
  const totalItems = useSelector(leaderboardSelectors.totalItems)
  const userStats = useSelector(leaderboardSelectors.currentUser)

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      classes={{ paper: classes.paper }}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}>
      <Grid className={classes.root}>
        <Box className={classes.counterContainer}>
          {currentNetwork === NetworkType.Testnet ? (
            <Box className={classes.counterItem}>
              <Typography>
                Points Program is <span className={classes.pinkLabel}>live!</span>
              </Typography>
              {<Divider className={classes.divider} />}

              <Typography component='h1'>
                You are currently on the testnet, where points distribution is unavailable. Please
                switch to the mainnet to access the Invariant Points System.
              </Typography>
            </Box>
          ) : (
            <>
              {isConnected ? (
                <>
                  {[
                    {
                      value:
                        trimZeros(
                          formatLargeNumber(
                            +printBN(new BN(userStats.total?.points, 'hex'), LEADERBOARD_DECIMAL)
                          )
                        ) ?? 0,
                      label: 'Your Points',
                      styleVariant: classes.counterYourPoints
                    },
                    {
                      value: `# ${userStats.total?.rank ?? totalItems.total + 1}`,
                      label: 'Your Ranking Position',
                      styleVariant: classes.counterYourRanking
                    }
                  ].map(({ value, label, styleVariant }, index) => (
                    <React.Fragment key={label}>
                      <Box className={classes.counterItem} style={{ marginTop: '4px' }}>
                        <Typography className={styleVariant}>{value}</Typography>
                        <Typography className={classes.counterLabel}>{label}</Typography>
                      </Box>
                      {index < 1 && <Divider className={classes.divider} />}
                    </React.Fragment>
                  ))}
                  <Box className={classes.linkContainer}>
                    <Button
                      scheme='green'
                      width='100%'
                      height={32}
                      onClick={() => {
                        handleClose()
                        navigate(ROUTES.POINTS)
                      }}>
                      Go to Points Tab
                    </Button>
                  </Box>
                </>
              ) : (
                <Box className={classes.counterItem}>
                  <Typography>
                    Points Program is <span className={classes.pinkLabel}>live!</span>
                  </Typography>
                  <Typography component='h2'>Visit Points Tab to track your progress.</Typography>
                  <Box className={classes.linkContainer}>
                    <Button
                      scheme='green'
                      height={32}
                      onClick={() => {
                        handleClose()
                        navigate(ROUTES.POINTS)
                      }}>
                      Go to Points Tab
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      </Grid>
    </Popover>
  )
}

export default YourPointsModal
