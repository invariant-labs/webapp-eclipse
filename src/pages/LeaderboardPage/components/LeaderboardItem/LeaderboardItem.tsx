import React from 'react'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import { useDispatch } from 'react-redux'
import { actions as snackbarActions } from '@store/reducers/snackbars'

import { colors, theme, typography } from '@static/theme'
import { useStyles } from './style'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { shortenAddress } from '@utils/uiUtils'

interface BaseLeaderboardItemProps {
  displayType: 'item' | 'header'
}

interface LeaderboardHeaderProps extends BaseLeaderboardItemProps {
  displayType: 'header'
}

interface LeaderboardItemDetailProps extends BaseLeaderboardItemProps {
  displayType: 'item'
  tokenIndex?: number
  totalPoints: number
  isYou?: boolean
  address?: string
  pointsIncome?: number
  liquidityPositions?: number
  hideBottomLine?: boolean
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
    tokenIndex = 0,
    totalPoints,
    isYou = false,
    address = '',
    pointsIncome = 0,
    liquidityPositions = 0,
    hideBottomLine = false
  } = props

  const getColorByPlace = (index: number) => {
    return index - 1 < PLACE_COLORS.length ? PLACE_COLORS[index - 1] : colors.invariant.text
  }

  const copyToClipboard = () => {
    if (!address) return

    navigator.clipboard
      .writeText(address)
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
        <Typography style={{ color: getColorByPlace(tokenIndex) }}>{tokenIndex}</Typography>

        <Typography>
          {isYou ? 'You' : shortenAddress(address, 7)}
          <TooltipHover text='Copy address'>
            <FileCopyOutlinedIcon
              onClick={copyToClipboard}
              classes={{ root: classes.clipboardIcon }}
            />
          </TooltipHover>
        </Typography>

        <Typography>{totalPoints}</Typography>

        {!isMd && pointsIncome > 0 && (
          <Typography>
            <Typography
              style={{
                color: colors.invariant.green,
                ...typography.heading4
              }}>
              + {pointsIncome}
            </Typography>
          </Typography>
        )}

        {!isMd && <Typography>{liquidityPositions}</Typography>}
      </Grid>
    </Grid>
  )
}

export default LeaderboardItem
