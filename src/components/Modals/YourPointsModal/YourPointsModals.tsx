import React from 'react'
// import icons from '@static/icons'
// import classNames from 'classnames'
import useStyles from './style'
import { ISelectNetwork } from '@store/consts/types'
import { Box, Button, Divider, Grid, Popover, Typography } from '@mui/material'
import { NetworkType } from '@store/consts/static'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { leaderboardSelectors } from '@store/selectors/leaderboard'

export interface ISelectNetworkModal {
  networks: ISelectNetwork[]
  open: boolean
  anchorEl: HTMLButtonElement | null
  onSelect: (networkType: NetworkType, rpcAddress: string, rpcName?: string) => void
  handleClose: () => void
  activeNetwork: NetworkType
}
export const YourPointsModal: React.FC<ISelectNetworkModal> = ({
  //   networks,
  anchorEl,
  open,
  //   onSelect,
  handleClose
  //   activeNetwork
}) => {
  const { classes } = useStyles()
  const navigate = useNavigate()
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
          {[
            {
              value: userStats?.totalPoints ?? 0,
              label: 'Your Points',
              styleVariant: classes.counterYourPoints
            },
            {
              value: userStats?.rank ?? 0,
              label: 'Your ranking position',
              styleVariant: classes.counterYourRanking
            }
          ].map(({ value, label, styleVariant }) => (
            <>
              <Box key={label} className={classes.counterItem}>
                <Typography className={styleVariant}>{value}</Typography>
                <Typography className={classes.counterLabel}>{label}</Typography>
              </Box>
              <Divider className={classes.divider} />
            </>
          ))}
          <Button
            className={classes.button}
            onClick={() => {
              handleClose()
              navigate('/leaderboard')
            }}>
            Go to Leaderboard
          </Button>
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
