import React from 'react'
import { colors, theme, typography } from '@static/theme'
import { useStyles } from './style'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import { ListElement } from '../ItemList/ItemList'
import { shortenAddress } from '@utils/uiUtils'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import { useDispatch } from 'react-redux'
import { actions as snackbarActions } from '@store/reducers/snackbars'

const Item: React.FC<ListElement> = ({
  tokenIndex = 0,
  totalPoints,
  displayType,
  isYou,
  address,
  pointsIncome,
  liquidityPositions,
  hideBottomLine = false
}) => {
  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const getColorByPlace = (index: number) => {
    const places = [colors.invariant.yellow, colors.invariant.green, colors.invariant.pink]
    return index - 1 <= places.length ? places[index - 1] : colors.invariant.text
  }

  const copyToClipboard = () => {
    if (!address) {
      return
    }
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
            message: 'Failed to address copy!',
            variant: 'success',
            persist: false
          })
        )
      })
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
          <Typography
            style={{
              color: getColorByPlace(tokenIndex)
            }}>
            {tokenIndex}
          </Typography>

          <Typography>
            {isYou ? 'You' : shortenAddress(address ?? '-', 7)}
            <TooltipHover text='Copy address'>
              <FileCopyOutlinedIcon
                onClick={copyToClipboard}
                classes={{ root: classes.clipboardIcon }}
              />
            </TooltipHover>
          </Typography>
          <Typography>{totalPoints}</Typography>
          {!isMd && (
            <Typography>
              {pointsIncome && (
                <Typography style={{ color: colors.invariant.green, ...typography.heading4 }}>
                  + {pointsIncome}
                </Typography>
              )}{' '}
            </Typography>
          )}
          {!isMd && <Typography>{liquidityPositions}</Typography>}
        </Grid>
      ) : (
        <Grid container classes={{ container: classes.container, root: classes.header }}>
          <Typography style={{ lineHeight: '11px' }}>Rank</Typography>

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
            Address
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
          {!isMd && (
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
          )}
          {!isMd && (
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
              Positions
              {/* {sortType === SortTypePoolList.TVL_ASC ? (
              <ArrowDropUpIcon className={classes.icon} />
            ) : sortType === SortTypePoolList.TVL_DESC ? (
              <ArrowDropDownIcon className={classes.icon} />
            ) : null} */}
            </Typography>
          )}
        </Grid>
      )}
    </Grid>
  )
}

export default Item
