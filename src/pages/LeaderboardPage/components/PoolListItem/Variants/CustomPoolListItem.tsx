import React from 'react'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { useMediaQuery, Grid, Typography, Box } from '@mui/material'
import icons from '@static/icons'
import { colors, theme, typography } from '@static/theme'
import { apyToApr, shortenAddress } from '@utils/uiUtils'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { useStyles } from './style'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { addressToTicker, initialXtoY, parseFeeToPathFee } from '@utils/utils'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import { IProps } from '../PoolListItem'

export const CustomPoolListItem: React.FC<IProps> = ({
  fee = 0,
  displayType,
  symbolFrom,
  symbolTo,
  iconFrom,
  iconTo,
  tokenIndex,
  hideBottomLine = false,
  addressFrom,
  addressTo,
  network,
  poolAddress,
  copyAddressHandler,
  apy = 0,
  showAPY
}) => {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const handleOpenPosition = () => {
    const revertRatio = initialXtoY(addressFrom ?? '', addressTo ?? '')

    const tokenA = revertRatio
      ? addressToTicker(network, addressTo ?? '')
      : addressToTicker(network, addressFrom ?? '')
    const tokenB = revertRatio
      ? addressToTicker(network, addressFrom ?? '')
      : addressToTicker(network, addressTo ?? '')

    navigate(
      `/newPosition/${tokenA}/${tokenB}/${parseFeeToPathFee(Math.round(fee * 10 ** (DECIMAL - 2)))}`,
      { state: { referer: 'stats' } }
    )
  }

  const copyToClipboard = () => {
    if (!poolAddress || !copyAddressHandler) {
      return
    }
    navigator.clipboard
      .writeText(poolAddress)
      .then(() => {
        copyAddressHandler('Market ID copied to Clipboard', 'success')
      })
      .catch(() => {
        copyAddressHandler('Failed to copy Market ID to Clipboard', 'error')
      })
  }

  const apr = apyToApr(apy)

  return (
    <Grid maxWidth='100%'>
      {displayType === 'token' ? (
        <>
          <Grid
            container
            classes={{
              container: classNames(classes.container, { [classes.containerNoAPY]: !showAPY })
            }}
            style={{
              border: hideBottomLine ? 'none' : undefined,
              marginTop: '8px',
              marginBottom: '24px'
            }}>
            <Typography>{tokenIndex}</Typography>
            <Grid className={classes.imageContainer}>
              <Box className={classes.iconsWrapper}>
                <Box className={classes.iconContainer}>
                  <img
                    className={classes.tokenIcon}
                    src={iconFrom}
                    alt='Token from'
                    onError={e => {
                      e.currentTarget.src = icons.unknownToken
                    }}
                  />
                </Box>
                <Box className={classes.iconContainer}>
                  <img
                    className={classes.tokenIcon}
                    src={iconTo}
                    alt='Token to'
                    onError={e => {
                      e.currentTarget.src = icons.unknownToken
                    }}
                  />
                </Box>
              </Box>
              {isMd && (
                <Grid className={classes.symbolsContainer}>
                  <Typography>
                    {shortenAddress(symbolFrom ?? '')}/{shortenAddress(symbolTo ?? '')}
                  </Typography>
                  <TooltipHover text='Copy pool address'>
                    <FileCopyOutlinedIcon
                      onClick={copyToClipboard}
                      classes={{ root: classes.clipboardIcon }}
                    />
                  </TooltipHover>
                  <img src={icons.airdropRainbow} height={20} style={{ marginLeft: '8px' }} />
                </Grid>
              )}
            </Grid>

            <Box className={classes.action}>
              <TooltipHover text='Add position'>
                <button className={classes.actionButton} onClick={handleOpenPosition}>
                  <img width={32} height={32} src={icons.plusIcon} alt={'Open'} />
                </button>
              </TooltipHover>
            </Box>
          </Grid>
          <Grid
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingTop: '24px',
              borderTop: `1px solid ${colors.invariant.light}`
            }}>
            <Box>
              <Typography style={{ ...typography.body2, color: colors.invariant.textGrey }}>
                Fee
              </Typography>
              <Typography style={{ ...typography.heading4, color: colors.invariant.text }}>
                {fee}%
              </Typography>
            </Box>
            <Box>
              <Box style={{ display: 'flex' }}>
                <span
                  style={{
                    ...typography.body2,
                    color: colors.invariant.textGrey,
                    alignSelf: 'flex-end'
                  }}>
                  APY
                </span>
                <span
                  style={{
                    ...typography.tiny2,
                    color: colors.invariant.textGrey,
                    alignSelf: 'flex-end',
                    marginLeft: '8px'
                  }}>
                  APR
                </span>
              </Box>
              <Box style={{ display: 'flex' }}>
                <span
                  style={{
                    ...typography.heading4,
                    color: colors.invariant.text,
                    alignSelf: 'flex-end'
                  }}>
                  {apy > 1000 ? '>1000%' : apy === 0 ? '' : apy.toFixed(2) + '%'}
                </span>
                <span
                  style={{
                    ...typography.tiny2,
                    color: colors.invariant.text,
                    alignSelf: 'flex-end',
                    marginLeft: '8px',
                    marginBottom: '2px'
                  }}>
                  {apr > 1000 ? '>1000%' : apr === 0 ? '' : apr.toFixed(2) + '%'}
                </span>
              </Box>
            </Box>
            <Box>
              <Typography style={{ ...typography.body2, color: colors.invariant.textGrey }}>
                Points per 24H
              </Typography>

              <Typography style={{ ...typography.heading4, color: colors.invariant.text }}>
                8,640,000
              </Typography>
            </Box>
          </Grid>
        </>
      ) : (
        <Grid
          container
          classes={{
            container: classNames(classes.container),
            root: classes.header
          }}>
          <Typography style={{ lineHeight: '11px' }}>
            N<sup>o</sup>
          </Typography>
          <Typography style={{ cursor: 'pointer' }}>Name</Typography>
          <Typography align='right'>Action</Typography>
        </Grid>
      )}
    </Grid>
  )
}
