import { Box } from '@mui/material'
import { useStyles } from './style'
import { TokenDetails } from '../TokenDetails/TokenDetails'

type Props = {
  tokenA: {
    icon: string
    ticker: string
    amount: number
    price?: number
  }
  tokenB: {
    icon: string
    ticker: string
    amount: number
    price?: number
  }
}

export const Liquidity = ({ tokenA, tokenB }: Props) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.container}>
      <Box className={classes.tokenContainer}>
        <TokenDetails
          icon={tokenA.icon}
          ticker={tokenA.ticker}
          amount={tokenA.amount}
          price={tokenA.price}
          isLoading={false}
        />
      </Box>
      <Box className={classes.tokenContainer}>
        <TokenDetails
          icon={tokenB.icon}
          ticker={tokenB.ticker}
          amount={tokenB.amount}
          price={tokenB.price}
          isLoading={false}
        />
      </Box>
    </Box>
  )
}
