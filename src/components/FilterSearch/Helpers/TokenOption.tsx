import { Box, Typography } from '@mui/material'
import icons from '@static/icons'
import { shortenAddress } from '@utils/uiUtils'
import { formatNumber, printBN } from '@utils/utils'
import { useStyles } from './style'
import { typography } from '@static/theme'

interface ISearchToken {
  icon: string
  name: string
  symbol: string
  address: string
  balance: any
  decimals: number
}

export const TokenOption: React.FC<{
  option: ISearchToken
  networkUrl: string
  isSmall: boolean
}> = ({ option, networkUrl, isSmall }) => {
  const { classes } = useStyles()

  const tokenBalance = printBN(option.balance, option.decimals)

  return (
    <Box
      className={classes.tokenContainer}
      sx={isSmall ? { marginBottom: '20px' } : { marginBottom: '10px' }}>
      <Box className={classes.leftSide}>
        <img
          width={isSmall ? 42 : 24}
          src={option?.icon ?? icons.unknownToken}
          onError={e => {
            e.currentTarget.onerror = null
            e.currentTarget.src = icons.unknownToken
          }}
          alt={option.symbol}
          className={classes.searchResultIcon}
        />
        <Box className={classes.tokenData}>
          <Box className={classes.symbolAndAddress}>
            <Typography
              className={classes.tokenLabel}
              sx={isSmall ? { ...typography.heading3 } : { ...typography.heading4 }}>
              {shortenAddress(option.symbol)}
            </Typography>
            <Box className={classes.tokenAddress}>
              <a
                className={classes.addressLink}
                href={`https://eclipsescan.xyz/token/${option.address.toString()}${networkUrl}`}
                target='_blank'
                rel='noopener noreferrer'
                onClick={event => event.stopPropagation()}>
                <Typography className={classes.truncatedAddress}>
                  {shortenAddress(option.address)}
                </Typography>

                <img className={classes.newTabIcon} src={icons.newTab} alt='Token address' />
              </a>
            </Box>
          </Box>
          {isSmall && (
            <Typography sx={{ ...typography.caption2 }} className={classes.tokenName}>
              {option.name === option.address ? shortenAddress(option.name) : option.name}
            </Typography>
          )}
        </Box>
      </Box>

      <Box>
        <Box className={classes.tokenBalanceStatus}>
          {Number(option.balance) > 0 && (
            <>
              <Typography sx={isSmall ? { ...typography.body2 } : { ...typography.caption2 }}>
                Balance:
              </Typography>
              <Typography sx={isSmall ? { ...typography.body2 } : { ...typography.caption2 }}>
                &nbsp; {formatNumber(tokenBalance)}
              </Typography>
            </>
          )}
        </Box>
        {!isSmall && (
          <Box>
            <Typography
              className={classes.tokenName}
              sx={{ textAlign: 'end', ...typography.tiny2 }}>
              {option.name === option.address ? shortenAddress(option.name) : option.name}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
