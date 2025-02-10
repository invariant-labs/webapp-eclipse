import { Box, Typography } from '@mui/material'
import icons from '@static/icons'
import { shortenAddress } from '@utils/uiUtils'
import { formatNumber, printBN } from '@utils/utils'
import { useStyles } from './style'

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
}> = ({ option, networkUrl }) => {
  const { classes } = useStyles()
  const tokenBalance = printBN(option.balance, option.decimals)

  return (
    <Box className={classes.tokenContainer} flexWrap='nowrap'>
      <Box display='flex' alignItems='center'>
        <img
          src={option?.icon ?? icons.unknownToken}
          onError={e => {
            e.currentTarget.onerror = null
            e.currentTarget.src = icons.unknownToken
          }}
          alt={option.symbol}
          className={classes.searchResultIcon}
        />
        <Box display='flex' flexDirection='column' flexWrap='wrap'>
          <Box display='flex' flexDirection='row' alignItems='center' gap='6px' flexWrap='nowrap'>
            <Typography className={classes.tokenLabel}>{shortenAddress(option.symbol)}</Typography>
            <Box className={classes.tokenAddress}>
              <a
                href={`https://eclipsescan.xyz/token/${option.address.toString()}${networkUrl}`}
                target='_blank'
                rel='noopener noreferrer'
                onClick={event => event.stopPropagation()}>
                <Typography>{shortenAddress(option.address)}</Typography>
                <img width={8} height={8} src={icons.newTab} alt='Token address' />
              </a>
            </Box>
          </Box>
          <Typography className={classes.tokenName}>
            {option.name === option.address ? shortenAddress(option.name) : option.name}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.tokenBalanceStatus}>
        {Number(option.balance) > 0 ? (
          <>
            <Typography>Balance:</Typography>
            <Typography>&nbsp; {formatNumber(tokenBalance)}</Typography>
          </>
        ) : null}
      </Box>
    </Box>
  )
}
