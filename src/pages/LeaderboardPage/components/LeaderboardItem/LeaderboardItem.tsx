import React from 'react'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import { useDispatch } from 'react-redux'
import { actions as snackbarActions } from '@store/reducers/snackbars'

import { colors, theme, typography } from '@static/theme'
import { useStyles } from './style'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { shortenAddress } from '@utils/uiUtils'
import { PublicKey } from '@solana/web3.js'

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

  totalPoints?: number
  positionsAmount?: number
  last24HoursPoints?: number
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

  if (displayType === 'header') {
    return <LeaderboardHeader />
  }

  const {
    rank = 0,
    totalPoints,
    isYou = false,
    address = '',
    last24HoursPoints = 0,
    positionsAmount = 0,
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
          <TooltipHover text='Copy address'>
            <FileCopyOutlinedIcon
              onClick={copyToClipboard}
              classes={{ root: classes.clipboardIcon }}
            />
          </TooltipHover>
        </Typography>

        <Typography>{totalPoints}</Typography>

        {!isMd && last24HoursPoints > 0 && (
          <Typography>
            <Typography
              style={{
                color: colors.invariant.green,
                ...typography.heading4
              }}>
              + {last24HoursPoints}
            </Typography>
          </Typography>
        )}

        {!isMd && <Typography>{positionsAmount}</Typography>}
      </Grid>
    </Grid>
  )
}

export default LeaderboardItem
