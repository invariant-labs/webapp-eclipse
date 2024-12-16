import React, { useMemo } from 'react'
import useStyles from './style'
import { Box, Button, Divider, Grid, Popover, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { status } from '@store/selectors/solanaWallet'
import { Status } from '@store/reducers/solanaWallet'
import { colors, typography } from '@static/theme'
import { formatLargeNumber } from '@utils/formatBigNumber'

export interface ISelectNetworkModal {
  open: boolean
  anchorEl: HTMLButtonElement | null
  handleClose: () => void
}
export const YourPointsModal: React.FC<ISelectNetworkModal> = ({ anchorEl, open, handleClose }) => {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const walletStatus = useSelector(status)
  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])

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
          {isConnected ? (
            <>
              {[
                {
                  value: formatLargeNumber(userStats?.points ?? 0),
                  label: 'Your Points',
                  styleVariant: classes.counterYourPoints
                },
                {
                  value: `# ${userStats?.rank ?? 0}`,
                  label: 'Your Ranking Position',
                  styleVariant: classes.counterYourRanking
                }
              ].map(({ value, label, styleVariant }, index) => (
                <React.Fragment key={label}>
                  <Box className={classes.counterItem} style={{ marginTop: '4px' }}>
                    <Typography className={styleVariant}>{value}</Typography>
                    <Typography className={classes.counterLabel}>{label}</Typography>
                  </Box>
                  {index < 1 && <Divider className={classes.divider} />}{' '}
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
            <>
              <Box className={classes.counterItem}>
                <Typography style={{ color: colors.invariant.text }}>
                  Points Program is{' '}
                  <span style={{ color: colors.invariant.pink, textAlign: 'center' }}>live!</span>
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
            </>
          )}
        </Box>
        {/* <Typography className={classes.title}>Select a network</Typography>
        <Grid className={classes.list} container alignContent='space-around' direction='column'>
          {networks.map(({ networkType, rpc, rpcName }) => (
            <Grid
              className={classNames(
                classes.listItem,
                networkType === activeNetwork ? classes.active : null
              )}
              item
              key={`networks-${networkType}`}
              onClick={() => {
                onSelect(networkType, rpc, rpcName)
              }}>
              <img
                className={classes.icon}
                src={icons[`${networkType}Icon`]}
                alt={`${networkType} icon`}
              />
              <Typography className={classes.name}>{networkType}</Typography>
              <DotIcon className={classes.dotIcon} />
            </Grid>
          ))}
        </Grid> */}
      </Grid>
    </Popover>
  )
}
export default YourPointsModal