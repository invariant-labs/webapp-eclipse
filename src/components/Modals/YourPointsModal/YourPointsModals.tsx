import React, { useMemo } from 'react'
import useStyles from './style'
import { Box, Button, Divider, Grid, Popover, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { status } from '@store/selectors/solanaWallet'
import { Status } from '@store/reducers/solanaWallet'
import { colors, typography } from '@static/theme'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import { printBN, trimZeros } from '@utils/utils'
import { BN } from '@coral-xyz/anchor'
import { network } from '@store/selectors/solanaConnection'
import { NetworkType } from '@store/consts/static'
import { formatLargeNumber } from '@utils/uiUtils'

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
              <Typography style={{ color: colors.invariant.text }}>
                Points Program is{' '}
                <span
                  style={{
                    color: colors.invariant.pink,
                    textAlign: 'center',
                    textShadow: `0 0 22px ${colors.invariant.pink}`
                  }}>
                  live!
                </span>
              </Typography>
              {<Divider className={classes.divider} />}

              <Typography
                style={{
                  color: colors.invariant.text,
                  textAlign: 'center',
                  marginTop: '16px'
                }}>
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

                  <Button
                    className={classes.button}
                    style={{ marginTop: '16px' }}
                    onClick={() => {
                      handleClose()
                      navigate('/points')
                    }}>
                    Go to Points Tab
                  </Button>
                </>
              ) : (
                <Box className={classes.counterItem}>
                  <Typography style={{ color: colors.invariant.text }}>
                    Points Program is{' '}
                    <span
                      style={{
                        color: colors.invariant.pink,
                        textAlign: 'center',
                        textShadow: `0 0 22px ${colors.invariant.pink}`
                      }}>
                      live!
                    </span>
                  </Typography>
                  <Typography
                    style={{
                      color: colors.invariant.textGrey,
                      ...typography.body2,
                      marginTop: '8px',
                      textAlign: 'center'
                    }}>
                    Visit Points Tab to track your progress.
                  </Typography>
                  <Button
                    style={{ marginTop: '16px' }}
                    className={classes.button}
                    onClick={() => {
                      handleClose()
                      navigate('/points')
                    }}>
                    Go to Points Tab
                  </Button>
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
