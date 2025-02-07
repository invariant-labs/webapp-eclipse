import { Box, Typography } from '@mui/material'
import useStyles from './style'

export interface ISearchToken {
  icon: string
  name: string
  symbol: string
  address: string
  balance: any
  decimals: number
}

export const CommonTokenItem: React.FC<{
  token: ISearchToken
  onSelect: (e: React.MouseEvent, token: ISearchToken) => void
}> = ({ token, onSelect }) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.commonTokenContainer} onMouseDown={e => onSelect(e, token)}>
      <img className={classes.commonTokenIcon} src={token.icon} alt={token.symbol} />
      <Typography className={classes.commonTokenLabel}>{token.symbol}</Typography>
    </Box>
  )
}
