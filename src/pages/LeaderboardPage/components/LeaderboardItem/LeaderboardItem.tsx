import React from 'react'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { actions as snackbarActions } from '@store/reducers/snackbars'
import LaunchIcon from '@mui/icons-material/Launch'
import { colors, theme, typography } from '@static/theme'
import { useStyles } from './style'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { shortenAddress } from '@utils/uiUtils'
import { PublicKey } from '@solana/web3.js'
import icons from '@static/icons'
import { Link } from 'react-router-dom'
import { network } from '@store/selectors/solanaConnection'

interface BaseLeaderboardItemProps {
  displayType: 'item' | 'header'
}

interface LeaderboardHeaderProps extends BaseLeaderboardItemProps {
  displayType: 'header'
}

interface LeaderboardItemDetailProps extends BaseLeaderboardItemProps {
  displayType: 'item'
  isYou?: boolean

  hideBottomLine?: boolean

  points?: number
  positions?: number
  last24hPoints?: number
  rank?: number
  address?: PublicKey
}

export type LeaderboardItemProps = LeaderboardHeaderProps | LeaderboardItemDetailProps

const PLACE_COLORS = [colors.invariant.yellow, colors.invariant.green, colors.invariant.pink]

const LeaderboardHeader: React.FC = () => {
  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Grid container classes={{ container: classes.container, root: classes.header }}>
      <Typography style={{ lineHeight: '11px' }}>Rank</Typography>
      <Typography style={{ cursor: 'pointer' }}>Address</Typography>
      <Typography style={{ cursor: 'pointer' }}>Total points</Typography>
      {!isMd && (
        <>
          <Typography style={{ cursor: 'pointer' }}>24H points</Typography>
          <Typography style={{ cursor: 'pointer' }}>Positions</Typography>
        </>
      )}
    </Grid>
  )
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = props => {
  const { displayType } = props
  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const currentNetwork = useSelector(network)

  if (displayType === 'header') {
    return <LeaderboardHeader />
  }

  const {
    rank = 0,
    points,
    isYou = false,
    address = '',
    last24hPoints = 0,
    positions = 0,
    hideBottomLine = false
  } = props

  const getColorByPlace = (index: number) => {
    return index - 1 < PLACE_COLORS.length ? PLACE_COLORS[index - 1] : colors.invariant.text
  }

  const copyToClipboard = () => {
    if (!address) return

    navigator.clipboard
      .writeText(address.toString())
      .then(() => {
        dispatch(
          snackbarActions.add({
            message: 'Address copied!',
            variant: 'success',
            persist: false
          })
        )
      })
      .catch(() => {
        dispatch(
          snackbarActions.add({
            message: 'Failed to copy address!',
            variant: 'error',
            persist: false
          })
        )
      })
  }

  return (
    <Grid maxWidth='100%'>
      <Grid
        container
        classes={{ container: classes.container }}
        style={{
          border: hideBottomLine ? 'none' : undefined,
          background: isYou ? colors.invariant.light : 'transparent'
        }}>
        <Typography style={{ color: getColorByPlace(rank) }}>{rank}</Typography>

        <Typography>
          {isYou ? 'You' : shortenAddress(address.toString(), 7)}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline' }}>
            <TooltipHover text='Copy address'>
              <FileCopyOutlinedIcon
                onClick={copyToClipboard}
                classes={{ root: classes.clipboardIcon }}
              />
            </TooltipHover>
            <TooltipHover text='Open in explorer'>
              <Link
                to={`https://eclipsescan.xyz/token/${address}?cluster=${currentNetwork.toLocaleLowerCase()}`}
                target='_blank'>
                <LaunchIcon classes={{ root: classes.clipboardIcon }} />
              </Link>
            </TooltipHover>
          </Box>
        </Typography>

        <Typography>{points}</Typography>

        {!isMd && last24hPoints > 0 && (
          <Typography>
            <Typography
              style={{
                color: colors.invariant.green,
                ...typography.heading4
              }}>
              + {last24hPoints}
            </Typography>
          </Typography>
        )}

        {!isMd && <Typography>{positions}</Typography>}
      </Grid>
    </Grid>
  )
}

export default LeaderboardItem
