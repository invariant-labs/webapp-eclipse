import { Box, Grid, Typography } from '@mui/material'
import icons from '@static/icons'
import { shortenAddress } from '@utils/uiUtils'
import useStyles from './style'
import { printBN } from '@utils/utils'

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

  return (
    <Box className={classes.tokenContainer}>
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
        <Box display='flex' flexDirection='column'>
          <Box display='flex' flexDirection='row' alignItems='center' gap='6px'>
            <Typography className={classes.tokenLabel}>{shortenAddress(option.symbol)}</Typography>
            <Grid className={classes.tokenAddress} container direction='column'>
              <a
                href={`https://eclipsescan.xyz/token/${option.address.toString()}${networkUrl}`}
                target='_blank'
                rel='noopener noreferrer'
                onClick={event => event.stopPropagation()}>
                <Typography>{shortenAddress(option.address)}</Typography>
                <img width={8} height={8} src={icons.newTab} alt='Token address' />
              </a>
            </Grid>
          </Box>
          <Typography className={classes.tokenName}>
            {option.name === option.address ? shortenAddress(option.name) : option.name}
          </Typography>
        </Box>
      </Box>
      <Typography className={classes.balaceLabel}>
        {option.balance > 0 && `Balance: ${printBN(option.balance, option.decimals)}`}
      </Typography>
    </Box>
  )
}
