import React from 'react'
import { colors, theme, typography } from '@static/theme'
import { useStyles } from './style'
import { Grid, Typography, useMediaQuery } from '@mui/material'

interface IProps {
  displayType: string
  username?: string
  totalPoints?: number
  tokenIndex?: number
  isYou?: boolean
  hideBottomLine?: boolean
  pointsIncome?: number
  liquidityPositions?: number
}

const Item: React.FC<IProps> = ({
  tokenIndex = 0,
  totalPoints,
  displayType,
  isYou,
  username,
  pointsIncome,
  liquidityPositions,
  hideBottomLine = false
}) => {
  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))
  const getColorByPlace = (index: number) => {
    const places = [colors.invariant.yellow, colors.invariant.green, colors.invariant.pink]
    return index - 1 <= places.length ? places[index - 1] : colors.invariant.text
  }
  const abbreviateAddress = (addr: string, signs?: number) => {
    const numberOfSigns = signs ? signs : 4
    if (addr && addr.length > 8) {
      return addr.slice(0, numberOfSigns) + '...' + addr.slice(-numberOfSigns)
    }
    return addr
  }

  return (
    <Grid maxWidth='100%'>
      {displayType === 'token' ? (
        <Grid
          container
          classes={{ container: classes.container }}
          style={{
            border: hideBottomLine ? 'none' : undefined,
            background: isYou ? colors.invariant.light : 'transparent'
          }}>
          {!isMd ? (
            <Typography
              style={{
                color: getColorByPlace(tokenIndex)
              }}>
              {tokenIndex}
            </Typography>
          ) : null}

          <Typography>{abbreviateAddress(username ?? '-', 8)}</Typography>
          <Typography>{totalPoints ? totalPoints : '-'}</Typography>
          <Typography>
            {pointsIncome ? (
              <Typography style={{ color: colors.invariant.green, ...typography.heading4 }}>
                + {pointsIncome}
              </Typography>
            ) : (
              <Typography>-</Typography>
            )}{' '}
          </Typography>
          <Typography>{liquidityPositions ? liquidityPositions : '-'}</Typography>
        </Grid>
      ) : (
        <Grid container classes={{ container: classes.container, root: classes.header }}>
          {!isMd && (
            <Typography style={{ lineHeight: '11px' }}>
              N<sup>o</sup>
            </Typography>
          )}

          <Typography
            style={{ cursor: 'pointer' }}
            // onClick={() => {
            //   if (sortType === SortTypePoolList.NAME_ASC) {
            //     onSort?.(SortTypePoolList.NAME_DESC)
            //   } else {
            //     onSort?.(SortTypePoolList.NAME_ASC)
            //   }
            // }}
          >
            Username
            {/* {sortType === SortTypePoolList.NAME_ASC ? (
              <ArrowDropUpIcon className={classes.icon} />
            ) : sortType === SortTypePoolList.NAME_DESC ? (
              <ArrowDropDownIcon className={classes.icon} />
            ) : null} */}
          </Typography>
          <Typography
            style={{ cursor: 'pointer' }}
            // onClick={() => {
            //   if (sortType === SortTypePoolList.FEE_ASC) {
            //     onSort?.(SortTypePoolList.FEE_DESC)
            //   } else {
            //     onSort?.(SortTypePoolList.FEE_ASC)
            //   }
            // }}
          >
            Total points
            {/* {sortType === SortTypePoolList.FEE_ASC ? (
              <ArrowDropUpIcon className={classes.icon} />
            ) : sortType === SortTypePoolList.FEE_DESC ? (
              <ArrowDropDownIcon className={classes.icon} />
            ) : null} */}
          </Typography>

          <Typography
            style={{ cursor: 'pointer' }}
            // onClick={() => {
            //   if (sortType === SortTypePoolList.VOLUME_DESC) {
            //     onSort?.(SortTypePoolList.VOLUME_ASC)
            //   } else {
            //     onSort?.(SortTypePoolList.VOLUME_DESC)
            //   }
            // }}
          >
            24H points
            {/* {sortType === SortTypePoolList.VOLUME_ASC ? (
              <ArrowDropUpIcon className={classes.icon} />
            ) : sortType === SortTypePoolList.VOLUME_DESC ? (
              <ArrowDropDownIcon className={classes.icon} />
            ) : null} */}
          </Typography>
          <Typography
            style={{ cursor: 'pointer' }}
            // onClick={() => {
            //   if (sortType === SortTypePoolList.TVL_DESC) {
            //     onSort?.(SortTypePoolList.TVL_ASC)
            //   } else {
            //     onSort?.(SortTypePoolList.TVL_DESC)
            //   }
            // }}
          >
            Liquidity positions
            {/* {sortType === SortTypePoolList.TVL_ASC ? (
              <ArrowDropUpIcon className={classes.icon} />
            ) : sortType === SortTypePoolList.TVL_DESC ? (
              <ArrowDropDownIcon className={classes.icon} />
            ) : null} */}
          </Typography>
        </Grid>
      )}
    </Grid>
  )
}

export default Item
