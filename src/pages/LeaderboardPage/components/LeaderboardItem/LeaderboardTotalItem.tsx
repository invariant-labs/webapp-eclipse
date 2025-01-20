import React from 'react'
import { alpha, Box, Grid, Typography, useMediaQuery } from '@mui/material'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { actions as snackbarActions } from '@store/reducers/snackbars'
import LaunchIcon from '@mui/icons-material/Launch'
import { colors, theme, typography } from '@static/theme'
import { useStyles } from './style'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { shortenAddress } from '@utils/uiUtils'
import { PublicKey } from '@solana/web3.js'
import { Link } from 'react-router-dom'
import { network } from '@store/selectors/solanaConnection'
import { BN } from '@coral-xyz/anchor'
import { formatNumberWithCommas, printBN } from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@pages/LeaderboardPage/config'

interface BaseLeaderboardTotalItemProps {
  displayType: 'item' | 'header'
}

interface LeaderboardTotalHeaderProps extends BaseLeaderboardTotalItemProps {
  displayType: 'header'
}

interface LeaderboardTotalItemDetailProps extends BaseLeaderboardTotalItemProps {
  displayType: 'item'
  isYou?: boolean
  hideBottomLine?: boolean
  points?: string
  lpPoints?: string
  swapPoints?: string
  last24hPoints?: string
  rank?: number
  address?: PublicKey
}

export type LeaderboardTotalItemProps =
  | LeaderboardTotalHeaderProps
  | LeaderboardTotalItemDetailProps

const PLACE_COLORS = [colors.invariant.yellow, colors.invariant.silver, colors.invariant.bronze]

const LeaderboardTotalHeader: React.FC = () => {
  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Grid container classes={{ container: classes.totalContainer, root: classes.header }}>
      <Typography style={{ lineHeight: '11px' }}>Rank</Typography>
      <Typography style={{ cursor: 'pointer' }}>Address</Typography>
      <Typography style={{ cursor: 'pointer' }}>Total points</Typography>
      {!isMd && (
        <>
          <Typography style={{ cursor: 'pointer' }}>Swap points</Typography>
          <Typography style={{ cursor: 'pointer' }}>Liquidity points</Typography>
          <Typography style={{ cursor: 'pointer' }}>24H points</Typography>
        </>
      )}
    </Grid>
  )
}

const LeaderboardTotalItem: React.FC<LeaderboardTotalItemProps> = props => {
  const { displayType } = props
  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const currentNetwork = useSelector(network)
  const pointOneValue = new BN(10).pow(new BN(LEADERBOARD_DECIMAL)).div(new BN(10))

  if (displayType === 'header') {
    return <LeaderboardTotalHeader />
  }

  const {
    rank = 0,
    points,
    isYou = false,
    address = '',
    last24hPoints = 0,
    lpPoints,
    swapPoints,
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
        classes={{ container: classes.totalContainer }}
        style={{
          border: hideBottomLine ? 'none' : undefined,
          background: isYou ? alpha(colors.invariant.light, 0.2) : 'transparent',
          paddingLeft: isYou ? 24 : 0,
          paddingRight: isYou ? 24 : 0
        }}>
        <Typography style={{ color: getColorByPlace(rank) }}>{rank}</Typography>

        <Typography>
          {shortenAddress(address.toString(), 4)}
          {isYou ? (
            <Typography style={{ color: colors.invariant.pink, marginLeft: '5px' }}>
              (You)
            </Typography>
          ) : null}
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

        <Typography>
          {new BN(points, 'hex').isZero()
            ? 0
            : formatNumberWithCommas(
                Number(printBN(new BN(points, 'hex'), LEADERBOARD_DECIMAL)).toFixed(2)
              )}
        </Typography>
        {!isMd && (
          <Typography>
            {new BN(swapPoints, 'hex').isZero()
              ? 0
              : formatNumberWithCommas(
                  Number(printBN(new BN(swapPoints, 'hex'), LEADERBOARD_DECIMAL)).toFixed(2)
                )}
          </Typography>
        )}
        {!isMd && (
          <Typography>
            {new BN(lpPoints, 'hex').isZero()
              ? 0
              : formatNumberWithCommas(
                  Number(printBN(new BN(lpPoints, 'hex'), LEADERBOARD_DECIMAL)).toFixed(2)
                )}
          </Typography>
        )}
        {!isMd && (
          <Typography>
            <Typography
              style={{
                color: colors.invariant.green,
                ...typography.heading4
              }}>
              {new BN(last24hPoints, 'hex').lt(pointOneValue) ? (
                <span style={{ color: colors.invariant.text }}>0</span>
              ) : (
                <span>
                  +{' '}
                  {formatNumberWithCommas(
                    parseFloat(printBN(new BN(last24hPoints, 'hex'), LEADERBOARD_DECIMAL)).toFixed(
                      1
                    )
                  )}
                </span>
              )}
            </Typography>
          </Typography>
        )}
      </Grid>
    </Grid>
  )
}

export default LeaderboardTotalItem
